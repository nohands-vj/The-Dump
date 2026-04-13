#!/bin/bash
# Helper script to create pull request

echo "Creating pull request..."
echo ""

gh pr create \
  --base main \
  --head claude/project-motion-brief-c6yti \
  --title "Fix admin page accessibility and deployment configuration" \
  --body "## Summary
- Fixed admin page accessibility by consolidating deployment workflows
- Removed duplicate \`deploy.yml\` workflow that was missing Firebase environment variables
- Updated admin page with correct production and local development URLs
- Added helpful URL display banner on admin page for easy access
- Created comprehensive \`ADMIN_ACCESS.md\` guide with troubleshooting
- Fixed critical drag clumping bug (missing id field in objects)

## Key Changes
1. **Deployment Workflow**: Removed \`deploy.yml\`, kept \`nextjs.yml\` with proper Firebase config
2. **Admin Page**: Added URL banner showing production and local URLs
3. **Documentation**: New \`ADMIN_ACCESS.md\` with complete setup and troubleshooting guide
4. **Bug Fix**: Fixed object clumping on drag by ensuring proper id field assignment

## Admin URLs
- **Production**: https://nohands-vj.github.io/The-Dump/admin
- **Local Dev**: http://localhost:3000/admin

## Test Plan
- [x] Admin page loads correctly with URL banner
- [x] Firebase environment variables properly configured in workflow
- [x] Objects can be populated from admin panel
- [x] Drag and drop works without clumping
- [x] Documentation is clear and comprehensive

## Deployment
Once merged, GitHub Actions will automatically deploy to GitHub Pages (~2-3 minutes).

https://claude.ai/code/session_01X93p1gBvMAsYAVr4XpN5kU"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Pull request created successfully!"
else
  echo ""
  echo "❌ Failed to create PR. You may need to authenticate first:"
  echo "   gh auth login"
  echo ""
  echo "Or create the PR manually at:"
  echo "   https://github.com/nohands-vj/The-Dump/compare/main...claude/project-motion-brief-c6yti"
fi
