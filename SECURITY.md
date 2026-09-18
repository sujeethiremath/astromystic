# Security Policy

## Reporting Security Vulnerabilities

We take the security of AstroMystic very seriously. If you discover a security vulnerability, please do **NOT** open a public issue. Instead, report it directly to our security team.

### How to Report

Please send an email to **[hiremath09@gmail.com](mailto:hiremath09@gmail.com)** with the following details:

1. **Description**: Clear description of the vulnerability and its potential impact.
2. **Steps to Reproduce**: Detailed reproduction steps or a minimal proof-of-concept.
3. **Affected Components**: File paths, API endpoints, or configurations affected.
4. **Suggested Mitigation**: (Optional) Suggested remediation or patch.

We will acknowledge receipt of your report within 48 hours and provide updates as we work toward resolving the issue.

---

## Security Best Practices for Self-Hosting

If you are running or deploying an instance of AstroMystic:

### 1. Environment Variable Protection
- Never commit `.env` or `.env.local` files to version control.
- Ensure that private variables (`FIREBASE_PRIVATE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`) are kept on the server and never prefixed with `NEXT_PUBLIC_`.

### 2. Firebase Security Rules
- Ensure your Cloud Firestore security rules strictly protect user documents and subcollections (`requests`, `readings`, `charts`).
- Only allow users to read/write their own document tree unless they possess verified administrator credentials.

### 3. Stripe Webhooks
- Always configure `STRIPE_WEBHOOK_SECRET` in production so incoming webhook events are cryptographically validated using `stripe.webhooks.constructEvent`.

### 4. Admin Access
- Guard `ADMIN_EMAILS` carefully. Only authorized individuals should be included in this comma-separated list.
