# NexusSpace Specification: Portability & Migration Standards

**Module:** Container & Environment Sanitizer
**Goal:** Ensure repositories can migrate between drives (C: to E:) or OSs (Windows to Linux) without manual refactoring.

---

## 1. The "No-Hard-Path" Law
**Severity:** CRITICAL (Blocks Build)
* **Detection:** Scan `*.yml`, `*.json`, `*.sh`, `Dockerfile`. Look for Regex `([a-zA-Z]:\\)|(\/home\/)`.
* **Violation:** `C:\Users\fkurk\Projects\...` or `/home/frank/...`
* **Fix:** Replace with relative path variables (`.` or `..`) or `${PWD}`.

## 2. The "Gremlin" Filter (Encoding Hygiene)
**Severity:** HIGH (Causes 'Unknown Instruction' crashes)
* **Detection:** Read file hex headers. Look for BOM (`0xEF,0xBB,0xBF`).
* **Violation:** Files created in Windows Notepad or copied from web browsers often carry hidden Byte Order Marks.
* **Fix:**
    * Strip BOM.
    * Force encoding: `UTF-8`.
    * Force line endings: `LF` (Linux) instead of `CRLF` (Windows) for all shell scripts and Dockerfiles.

## 3. The Context Trap Validator
**Severity:** HIGH (Causes 'File not found' during build)
* **Detection:** Parse `docker-compose.yml`. Calculate `build.context` + `build.dockerfile`.
* **Violation:** Setting `context: .` (current dir) when the Dockerfile is actually inside a subdirectory like `.devcontainer/`.
* **Fix:** If Dockerfile is in a subdir, usually `context` needs to be `..` (Project Root) to allow access to source code.

## 4. The "Zombie" Volume Check
**Severity:** MEDIUM (Mounts empty folders)
* **Detection:** Parse `volumes:` in `docker-compose.yml`.
* **Violation:** Hardcoded paths that do not match the current host user's structure.
* **Fix:** Use relative paths (`./data:/var/lib/postgresql/data`) instead of absolute paths.