# DocVault (Path Traversal Lab)

Stack:

- Node.js + Express

Pages:

- `/files`
- `/files/view?name=<filename>`
- `/upload`
- `/audit`

This app is intentionally vulnerable for path traversal training. File viewer reads files using user-supplied `name` without sanitization.
