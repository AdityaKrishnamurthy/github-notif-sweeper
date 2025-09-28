# GitHub Notification Sweeper

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple but powerful Node.js script to completely reset your GitHub notifications. This tool marks all notifications as read, marks them as done, and unsubscribes from every notification thread, effectively clearing your inbox and the repository filter list in the sidebar.

---

## The Problem

GitHub is currently facing a significant crypto spam problem. Millions of fake issues and pull requests are created by spammers, clogging up repositories and flooding the notifications of countless users. These spammers exploit the platform to create chaos before their accounts are eventually removed.

This creates a secondary, more persistent issue for users: when GitHub deletes these spam accounts, the notifications they generated often get stuck. They become **"ghost" notifications** that are impossible to clear through the standard web UI. This can leave your inbox permanently cluttered with hundreds or even thousands of un-actionable alerts.

This script was created to be a powerful, brute-force solution. It allows you to fight back against the chaos by completely resetting your notification state, wiping out the spam, and giving you back a clean, usable inbox.

---

## Features

* Fetches all notifications (read and unread).
* Marks every notification thread as **read**.
* Marks every notification thread as **done**.
* **Unsubscribes** you from every notification thread, clearing the repository list in the sidebar.
* Uses the GitHub CLI for simple and secure authentication.

---

## ⚠️ Warning

This script is destructive and the action is **irreversible**. It will permanently clear your entire notification history and subscriptions. Use this only if you are certain you want to achieve "inbox zero" and remove all repository filters from your notifications sidebar.

---

## Prerequisites

1. **Node.js** (v18+ recommended)
2. **GitHub CLI (`gh`)** installed and configured for your account

You can install the GitHub CLI from [https://cli.github.com/](https://cli.github.com/) and Node.js from [https://nodejs.org/](https://nodejs.org/).

---

## Authenticating with GitHub CLI

This project relies on `gh` for secure authentication. If you haven't logged in yet, run:

```bash
gh auth login
```

Follow the interactive prompts (choose your preferred method, usually web or device). After login, confirm status with:

```bash
gh auth status
```

---

## HOW TO RUN

### 1) Place `clear-github.cjs` into a directory of your choice.

### 2) Open Terminal in that directory


```bash
node clear-github.cjs
```

## License

This project is released under the MIT License. See the `LICENSE` file for details.

---

*Use this tool carefully — it is intentionally destructive by design.*
