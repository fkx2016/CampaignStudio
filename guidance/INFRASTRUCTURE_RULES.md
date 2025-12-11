# Docker Rules
1. NEVER use 'context: ..' in .devcontainer files on Windows.
2. ALWAYS use 'context: .' (Root) and 'dockerfile: .devcontainer/Dockerfile.toolbox'.
3. IF FAIL: Run ./scripts/fix-docker-paths.ps1
