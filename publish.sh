#!/bin/sh
# Commit and push Chonk Patrol to github.com/saumyarshah9697/ChonkPatrol.
#
# Usage:
#   ./publish.sh                 commits everything with a default message
#   ./publish.sh "message here"  commits with your message
#
# Identity is set LOCALLY for this repo only (your global Amazon git config
# is untouched). Commits are attributed to the saumyarshah9697 GitHub
# profile via the noreply email. Override with env vars if needed:
#   CHONK_GIT_NAME, CHONK_GIT_EMAIL, CHONK_REPO_URL
#
# Auth: the push uses HTTPS. When git prompts, use your GitHub username and
# a Personal Access Token (github.com -> Settings -> Developer settings ->
# Personal access tokens) as the password. macOS keychain remembers it after
# the first push.

set -eu

REPO_URL="${CHONK_REPO_URL:-https://github.com/saumyarshah9697/ChonkPatrol.git}"
GIT_NAME="${CHONK_GIT_NAME:-saumyarshah9697}"
GIT_EMAIL="${CHONK_GIT_EMAIL:-saumyarshah9697@users.noreply.github.com}"
MSG="${1:-Update Chonk Patrol}"

cd "$(dirname "$0")"

if [ ! -d .git ]; then
  git init
  git branch -M main 2>/dev/null || git checkout -b main
fi

git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git add .

if git diff --cached --quiet 2>/dev/null && git rev-parse HEAD >/dev/null 2>&1; then
  echo "Nothing new to commit."
else
  git commit -m "$MSG"
fi

# If the GitHub repo already has commits (e.g. created with a README),
# rebase our work on top of them before pushing.
if git ls-remote --exit-code --heads origin main >/dev/null 2>&1; then
  git pull --rebase origin main
fi

git push -u origin main

echo ""
echo "Pushed. Repo: https://github.com/saumyarshah9697/ChonkPatrol"
echo "To host the game: repo Settings -> Pages -> deploy from main branch,"
echo "then it serves at https://saumyarshah9697.github.io/ChonkPatrol/"
