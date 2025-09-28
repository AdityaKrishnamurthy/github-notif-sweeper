// A Node.js script to mark all GitHub notifications as read, done, and unsubscribe from all threads.
// This will completely clear your notifications inbox and the repository list in the sidebar.

const { exec } = require("node:child_process");

// Helper function to run a shell command and return its output.
function runShellCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing shell command:", stderr);
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// A cache for the GitHub token so we don't have to fetch it repeatedly.
let _githubToken = null;
async function getGithubToken() {
  if (!_githubToken) {
    try {
      _githubToken = await runShellCommand("gh auth token");
    } catch (e) {
      console.error("Fatal: Could not get GitHub token. Is the GitHub CLI ('gh') installed and are you logged in (`gh auth login`)?");
      process.exit(1);
    }
  }
  return _githubToken;
}

// Generic function to make an API request to GitHub.
async function githubApiRequest(url, method = 'GET', token) {
  const response = await fetch(url, {
    method: method,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    // We log the error but don't stop the script, in case one notification fails.
    console.error(`  > API Error for ${method} ${url}: ${response.status} ${response.statusText}`);
  }
  return response;
}


// Main function to orchestrate the cleanup.
async function main() {
  console.log("🚀 Starting the ultimate GitHub notification cleanup...");

  const token = await getGithubToken();

  console.log("🔎 Fetching all notifications...");
  const notificationsResponse = await githubApiRequest('https://api.github.com/notifications?all=true', 'GET', token);
  const notifications = await notificationsResponse.json();

  if (!notifications || notifications.length === 0) {
    console.log("✅ Your notifications are already empty. Nothing to do!");
    return;
  }

  console.log(`🧹 Found ${notifications.length} notification threads to clear.`);

  for (const notification of notifications) {
    const repoName = notification.repository.full_name;
    const threadUrl = notification.url;
    const subscriptionUrl = notification.subscription_url;

    console.log(`- Clearing notification from "${repoName}"...`);
    
    // We perform all actions: mark as read, mark as done, and unsubscribe.
    // Unsubscribing is what removes the repository from the sidebar.
    // We can run them in parallel to speed things up.
    await Promise.all([
      githubApiRequest(threadUrl, 'PATCH', token), // Mark as Read
      githubApiRequest(threadUrl, 'DELETE', token), // Mark as Done
      githubApiRequest(subscriptionUrl, 'DELETE', token) // Unsubscribe
    ]);
  }

  console.log("\n🎉 Success! All notifications have been cleared and unsubscribed.");
  console.log("Refresh your GitHub notifications page to see the results.");
}

// Run the main function and catch any top-level errors.
main().catch(error => {
  console.error("\nAn unexpected error occurred:", error);
  process.exit(1);
});