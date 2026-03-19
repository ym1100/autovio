# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in AutoVio, please **do not open a public GitHub issue**. Instead, report it privately so we can investigate and release a fix before public disclosure.

**Email:** <!-- security@yourdomain.com — replace with your actual contact -->

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- The affected component (backend API, frontend, MCP server, a specific provider)
- Any suggested fix if you have one

We will acknowledge your report within **48 hours** and aim to release a fix within **14 days** for critical issues. We will keep you updated throughout the process.

---

## Scope

The following are in scope for security reports:

- **Authentication & authorization** — JWT handling, session management, access control between users/projects
- **API input validation** — injection attacks, malformed payloads, path traversal in file storage
- **AI provider key exposure** — API keys leaking in logs, responses, or error messages
- **File upload handling** — reference video and asset uploads (MIME type validation, path sanitization)
- **FFmpeg export pipeline** — command injection via user-controlled input passed to FFmpeg

The following are **out of scope**:

- Vulnerabilities in third-party AI provider APIs (report those to the respective provider)
- Denial of service via expensive AI API calls (rate limiting is the operator's responsibility)
- Issues in dependencies — report those to the dependency maintainer directly

---

## Security model

AutoVio is designed to be **self-hosted**. A few things to keep in mind when running it in production:

- **API keys are never stored server-side.** They are passed per-request via HTTP headers (`x-api-key`, `x-llm-api-key`, etc.) from the frontend or MCP client. Do not log these headers.
- **JWT_SECRET** must be set to a strong, random value. The default is not safe for production.
- **MongoDB** should not be exposed publicly. Use a local instance or a VPC-restricted Atlas cluster.
- **FFmpeg** runs on the server. Ensure the backend process does not have unnecessary filesystem permissions.
- **File storage** (`packages/backend/data/`) contains user-uploaded assets and generated media. Restrict access to this directory.

---

## Supported versions

| Version | Supported |
|---------|-----------|
| latest (`main`) | Yes |
| older releases | No — please update to the latest release |
