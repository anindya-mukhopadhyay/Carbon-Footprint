# Security Architecture

## Identity and Access

- Firebase Authentication handles Google Sign-In and MFA.
- Firebase Admin verifies ID tokens.
- RBAC uses custom claims: `user`, `moderator`, `admin`.
- Firestore and Storage rules enforce ownership and admin controls.

## Application Protection

- Helmet enables secure headers and CSP.
- Firebase Hosting adds HSTS and `nosniff`.
- CORS is restricted to configured origins.
- Express rate limiting protects API endpoints.
- Zod validates all request bodies and query parameters.
- Recursive sanitization removes script content and blocks `$` or dotted keys to reduce NoSQL injection risk.
- Optional double-submit CSRF protection can be enabled for cookie deployments.

## Data Protection

- HTTPS is enforced through Firebase Hosting and Cloud Run.
- AES-256-GCM helper is provided for sensitive fields.
- Receipt uploads are limited by size and MIME type.
- Storage rules isolate receipt files by user id.
- Audit log hooks record sensitive actions.
- Secrets stay out of Git and should be provided by Secret Manager in production.

## Privacy and Compliance

- Consent model supports analytics, AI personalization, and reminders.
- Data minimization keeps raw uploads separate from derived carbon metrics.
- User settings include export/delete readiness.
- AI prompts avoid unnecessary personal data and use profile-level facts.
