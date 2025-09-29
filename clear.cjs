const { exec } = require("node:child_process");

// --- 🎯 TARGET LIST ---
// Add the full names of any stubborn repositories you want to remove here.
const TARGET_REPOS = [
  'gitcoinnotifypromo/gitcoincdao',
  'gitcoinod/org'
];
// --------------------


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

// A cache for the GitHub token.
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
    console.error(`  > API Error for ${method} ${url}: ${response.status} ${response.statusText}`);
  }
  return response;
}


// Main function to orchestrate the targeted cleanup.
async function main() {
  console.log("🚀 Starting targeted notification cleanup...");
  console.log("Targets:", TARGET_REPOS);

  const token = await getGithubToken();

  console.log("🔎 Fetching all notifications to find targets...");
  // We add `?per_page=100` to get the maximum number of items in one go.
  const notificationsResponse = await githubApiRequest('https://api.github.com/notifications?all=true&per_page=100', 'GET', token);
  const allNotifications = await notificationsResponse.json();

  if (!allNotifications || allNotifications.length === 0) {
    console.log("✅ No notifications were returned by the API.");
    return;
  }
  
  // Filter the full list to find ONLY the notifications from our target list.
  const targetSet = new Set(TARGET_REPOS);
  const notificationsToProcess = allNotifications.filter(
    (notification) => targetSet.has(notification.repository.full_name)
  );

  if (notificationsToProcess.length === 0) {
    console.log("❌ No matching notifications found for the target repositories in the API response.");
    console.log("This means the ghost notifications are not being served by the API. Please try the manual `gh api` command if this persists.");
    return;
  }

  console.log(`🎯 Found ${notificationsToProcess.length} matching notification(s) to destroy.`);

  for (const notification of notificationsToProcess) {
    const repoName = notification.repository.full_name;
    const threadUrl = notification.url;
    const subscriptionUrl = notification.subscription_url;

    console.log(`- Force-deleting notification from "${repoName}"...`);
    
    // Perform all actions: mark as read, mark as done, and unsubscribe.
    await Promise.all([
      githubApiRequest(threadUrl, 'PATCH', token), // Mark as Read
      githubApiRequest(threadUrl, 'DELETE', token), // Mark as Done
      githubApiRequest(subscriptionUrl, 'DELETE', token) // Unsubscribe
    ]);
    console.log(`  > Annihilated successfully.`);
  }

  console.log("\n🎉 Success! Targeted cleanup complete.");
  console.log("Refresh your GitHub notifications page to see the results.");
}

main().catch(error => {
  console.error("\nAn unexpected error occurred:", error);
  process.exit(1);
});