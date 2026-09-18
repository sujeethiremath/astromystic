# Contributing to AstroMystic

Thank you for your interest in contributing to AstroMystic! We welcome contributions to enhance features, fix bugs, and improve documentation.

---

## Code of Conduct

Please be respectful, collaborative, and constructive when interacting with fellow contributors and maintainers.

---

## Development Workflow

### Branch Policy

We maintain two primary branches:

- `main`: Production-ready, stable releases.
- `develop`: Ongoing integration and development branch.

All feature work and bug fixes should originate from temporary feature branches branched off `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

---

## How to Contribute

1. **Fork the Repository**: Create a fork under your GitHub account.
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/your-username/astromystic.git
   cd astromystic/astromystic
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Implement Changes**:
   - Follow existing code style and formatting conventions.
   - Run linter and formatting before committing:
     ```bash
     npm run lint
     npm run format
     ```
   - Verify that production build succeeds without errors:
     ```bash
     npm run build
     ```
6. **Commit Changes**: Write clear, descriptive commit messages.
7. **Submit a Pull Request**:
   - Push to your fork and submit a PR targeting the `develop` branch.
   - Provide a concise summary of the changes and any relevant issue references.

---

## Security Disclosures

Do not report security issues or vulnerabilities through public issues or pull requests. Please refer to [SECURITY.md](SECURITY.md) for instructions on confidential disclosure.
