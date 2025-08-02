# Deploy Remote Setup

This repository is configured with a `deploy` remote that syncs to `https://github.com/pranavmappoli/ebat.git`.

## Current Remotes

- **origin**: `https://github.com/ebat-official/Ebat.git` (main repository)
- **deploy**: `https://github.com/pranavmappoli/ebat.git` (deploy repository)

## Usage

### Manual Sync
```bash
# Push current branch to deploy
git push deploy main

# Push all branches to deploy
git push deploy --all

# Push all tags to deploy
git push deploy --tags

# Push everything to deploy
git push deploy --all --tags
```

### Using the Sync Script
```bash
# Run the sync script (recommended)
./sync-deploy.sh
```

The sync script will:
- ✅ Check if you're on the main branch
- ✅ Push all branches to deploy
- ✅ Push all tags to deploy
- ✅ Show success message with deploy URL

## Verification

Check the deploy repository:
- 🌐 **URL**: https://github.com/pranavmappoli/ebat
- 📊 **Status**: Should be in sync with this repository

## Troubleshooting

If you get authentication errors:
1. Check that the token in the deploy remote URL is still valid
2. Regenerate the token if needed
3. Update the deploy remote: `git remote set-url deploy NEW_URL`

## Commands Reference

```bash
# View all remotes
git remote -v

# Test deploy remote
git ls-remote deploy

# Push to deploy
git push deploy main

# Run sync script
./sync-deploy.sh
``` 