# Docker Rules
1. NEVER use 'context: ..' in .devcontainer files on Windows.
2. ALWAYS use 'context: .' (Root) and 'dockerfile: .devcontainer/Dockerfile.toolbox'.
3. IF FAIL: Run ./scripts/fix-docker-paths.ps1

## Windows Host Preparation
4. **Long Paths:** Windows MUST have 'LongPathsEnabled' set to 1 in the Registry.
   * *Why:* Node.js and AI datasets frequently exceed the 260-char limit.
   * *Fix:* Run 'New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force' as Administrator.

## The "Container Mindset"
5. **Disposable Environments:** NEVER manually fix a broken tool inside a container.
   * *Rule:* If the environment is broken, fix the 'Dockerfile', then **Rebuild Container**.
   * *Goal:* You should be able to delete the container at any time and lose zero work (because code is in Git, and tools are in Dockerfile).
