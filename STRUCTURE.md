# 📁 KeyRacer Project Structure Guide

This document provides a comprehensive overview of the KeyRacer project structure, explaining the purpose of each directory, file naming conventions, and guidelines for where to place new files.

## 📋 Table of Contents

- [Directory Overview](#directory-overview)
- [Detailed Directory Descriptions](#detailed-directory-descriptions)
- [File Naming Conventions](#file-naming-conventions)
- [Contribution Guidelines](#contribution-guidelines)
- [Common Scenarios](#common-scenarios)

---

## 🗂️ Directory Overview

```
keyracer/
├── docs/                      # 📚 All project documentation
├── public/                    # 🌐 Static frontend files (served to clients)
├── src/                       # ⚙️ Server-side application code
├── scripts/                   # 🔧 Build, deployment, and utility scripts
├── tests/                     # 🧪 Test files and fixtures
├── data/                      # 📊 Static data files (JSON, etc.)
├── .github/                   # GitHub-specific files (workflows, templates)
├── node_modules/              # NPM dependencies (auto-generated)
├── package.json               # Project metadata and dependencies
├── package-lock.json          # Locked dependency versions
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── README.md                  # Main project documentation
├── STRUCTURE.md               # This file
├── LICENSE                    # Project license
├── CONTRIBUTING.md            # Contribution guidelines
└── ecosystem.config.js        # PM2 process manager configuration
```

---

## 📖 Detailed Directory Descriptions

### 📚 `docs/` - Documentation

**Purpose**: Centralized location for all project documentation.

**Structure**:
```
docs/
├── setup/                     # Installation and configuration guides
│   ├── google-oauth.md        # Google OAuth setup instructions
│   ├── production-checklist.md # Pre-deployment checklist
│   └── deployment-ready.md    # Deployment guide
├── features/                  # Feature-specific documentation
│   ├── coderacer.md           # CodeRacer system documentation
│   ├── aptitude.md            # Aptitude test system
│   ├── career-chatbot.md      # AI career chatbot
│   └── seo.md                 # SEO implementation
├── guides/                    # Development and usage guides
│   ├── content-structure-guide.md
│   ├── markdown-migration-guide.md
│   ├── security.md
│   └── ui-features-guide.md
├── archive/                   # Historical documentation
│   └── *-SUMMARY.md           # Old implementation summaries
└── CHANGELOG.md               # Version history and changes
```

**When to add files here**:
- Setup instructions for new features
- Feature documentation and user guides
- Development guidelines
- Architecture decisions
- API documentation

**Naming conventions**:
- Use lowercase with hyphens: `feature-name.md`
- Be descriptive: `google-oauth-setup.md` not `oauth.md`
- Archive old docs: move to `archive/` with date prefix if needed

---

### 🌐 `public/` - Static Frontend Files

**Purpose**: All files that are served directly to the client's browser.

**Structure**:
```
public/
├── index.html                 # Main entry point (homepage)
├── pages/                     # HTML pages
│   ├── about.html
│   ├── login.html
│   ├── challenges.html
│   ├── code-racer.html
│   ├── leaderboard.html
│   └── ...
├── scripts/                   # Client-side JavaScript
│   ├── main.js                # Main application logic
│   ├── auth-middleware.js     # Client-side auth handling
│   ├── code-racer.js          # CodeRacer functionality
│   ├── analytics/             # Analytics scripts
│   └── utils/                 # Utility functions
├── styles/                    # CSS stylesheets
│   ├── style.css              # Main stylesheet
│   ├── code-racer.css         # Feature-specific styles
│   ├── leaderboard.css
│   └── ...
└── assets/                    # Static assets
    ├── images/                # Images and graphics
    ├── avatars/               # User avatar images
    └── ...
```

**When to add files here**:
- HTML pages that users navigate to
- Client-side JavaScript (runs in browser)
- CSS stylesheets
- Images, fonts, icons
- Any file that needs to be publicly accessible

**Naming conventions**:
- HTML: `feature-name.html` (lowercase with hyphens)
- JavaScript: `feature-name.js` or `featureName.js` (camelCase for modules)
- CSS: `feature-name.css` (lowercase with hyphens)
- Keep names descriptive and consistent

**Important notes**:
- Files in `public/` are served at the root URL
- `public/index.html` → `http://localhost:3000/`
- `public/pages/login.html` → `http://localhost:3000/pages/login.html`
- `public/scripts/main.js` → `http://localhost:3000/scripts/main.js`

---

### ⚙️ `src/` - Server-Side Code

**Purpose**: All Node.js/Express server-side application code.

**Structure**:
```
src/
├── server.js                  # Main server entry point
├── routes/                    # API route handlers
│   ├── authRoutes.js          # Authentication endpoints
│   ├── challengeRoutes.js     # Challenge management
│   ├── leaderboardRoutes.js   # Leaderboard endpoints
│   ├── aptitudeRoutes.js      # Aptitude test endpoints
│   └── ...
├── models/                    # Mongoose database models
│   ├── User.js                # User schema
│   ├── Challenge.js           # Challenge schema
│   ├── UserStats.js           # User statistics
│   └── ...
├── middleware/                # Express middleware
│   ├── auth.js                # Authentication middleware
│   ├── authMiddleware.js      # Additional auth checks
│   └── ...
├── services/                  # Business logic services
│   ├── authService.js         # Authentication logic
│   ├── emailService.js        # Email sending
│   └── verificationService.js # Email verification
└── utils/                     # Utility functions
    ├── dbConnect.js           # Database connection
    ├── emailUtils.js          # Email utilities
    ├── tokenManager.js        # JWT token management
    └── ...
```

**When to add files here**:
- API route handlers
- Database models (Mongoose schemas)
- Business logic and services
- Server middleware
- Server-side utilities
- Any code that runs on the server

**Naming conventions**:
- Routes: `featureRoutes.js` (camelCase + Routes suffix)
- Models: `ModelName.js` (PascalCase, singular)
- Services: `featureService.js` (camelCase + Service suffix)
- Middleware: `featureName.js` or `feature-middleware.js`
- Utils: `descriptiveName.js` (camelCase)

**Important notes**:
- `server.js` is the main entry point (referenced in `package.json`)
- Routes define API endpoints (e.g., `/api/challenges`)
- Models define database schemas
- Services contain reusable business logic
- Middleware processes requests before they reach routes

---

### 🔧 `scripts/` - Build and Deployment Scripts

**Purpose**: Automation scripts for development, deployment, and maintenance.

**Structure**:
```
scripts/
├── deploy/                    # Deployment scripts
│   ├── deploy.sh              # Main deployment script
│   ├── deploy-production.sh   # Production deployment
│   └── deploy-aptitude-api.sh # Feature-specific deployment
├── setup/                     # Setup automation
│   ├── setup-coderacer.sh     # CodeRacer setup
│   ├── setup-career-chatbot.sh
│   ├── setup-production.sh
│   └── setup-google-auth.js
└── utils/                     # Utility scripts
    ├── check-coderacer.sh     # Health check scripts
    ├── update-challenges.py   # Data management
    ├── validate-challenges.py
    └── ...
```

**When to add files here**:
- Deployment automation
- Setup and installation scripts
- Database seeding scripts
- Build scripts
- Maintenance utilities
- Data migration scripts

**Naming conventions**:
- Shell scripts: `action-target.sh` (e.g., `deploy-production.sh`)
- Python scripts: `action_target.py` (e.g., `update_challenges.py`)
- JavaScript: `actionTarget.js` (camelCase)
- Be descriptive about what the script does

---

### 🧪 `tests/` - Test Files

**Purpose**: All test files, test fixtures, and test-related utilities.

**Structure**:
```
tests/
├── unit/                      # Unit tests
│   ├── auth.test.js           # Authentication tests
│   ├── challenge.test.js      # Challenge logic tests
│   ├── root-directory-cleanliness.test.js
│   └── server-entry-point.test.js
├── integration/               # Integration tests
│   ├── api.test.js            # API endpoint tests
│   └── auth-flow.test.js      # End-to-end auth tests
└── fixtures/                  # Test fixtures and mock data
    ├── debug-aptitude.html    # Debug pages
    ├── mock-users.json        # Mock data
    └── ...
```

**When to add files here**:
- Unit tests for individual functions/modules
- Integration tests for API endpoints
- End-to-end tests
- Test fixtures and mock data
- Debug HTML pages used for testing

**Naming conventions**:
- Test files: `feature.test.js` or `feature.spec.js`
- Mirror the source structure (e.g., `src/models/User.js` → `tests/unit/user.test.js`)
- Fixtures: descriptive names like `mock-users.json`

---

### 📊 `data/` - Static Data Files

**Purpose**: Static data files used by the application.

**Structure**:
```
data/
├── aptitude-content.json      # Aptitude test content
├── aptitude-questions.json    # Question bank
└── ...
```

**When to add files here**:
- JSON data files
- Configuration data
- Static content that doesn't belong in the database
- Seed data

---

## 📝 File Naming Conventions

### General Rules
1. **Be descriptive**: Names should clearly indicate the file's purpose
2. **Be consistent**: Follow existing patterns in the directory
3. **Use appropriate case**:
   - HTML/CSS: `kebab-case.html`, `kebab-case.css`
   - JavaScript modules: `camelCase.js` or `PascalCase.js` (for classes)
   - Shell scripts: `kebab-case.sh`
   - Python scripts: `snake_case.py`
   - Markdown: `kebab-case.md`

### Specific Conventions

#### Routes (`src/routes/`)
- Pattern: `featureRoutes.js`
- Examples: `authRoutes.js`, `challengeRoutes.js`, `leaderboardRoutes.js`

#### Models (`src/models/`)
- Pattern: `ModelName.js` (PascalCase, singular)
- Examples: `User.js`, `Challenge.js`, `UserStats.js`

#### Services (`src/services/`)
- Pattern: `featureService.js`
- Examples: `authService.js`, `emailService.js`, `verificationService.js`

#### HTML Pages (`public/pages/`)
- Pattern: `feature-name.html`
- Examples: `code-racer.html`, `login.html`, `coderacer-leaderboard.html`

#### Client Scripts (`public/scripts/`)
- Pattern: `feature-name.js` or `featureName.js`
- Examples: `code-racer.js`, `leaderboard.js`, `auth-middleware.js`

#### CSS Files (`public/styles/`)
- Pattern: `feature-name.css`
- Examples: `code-racer.css`, `leaderboard.css`, `style.css`

---

## 🤝 Contribution Guidelines

### Where to Place New Files

#### Adding a New Feature

1. **Frontend (User Interface)**:
   - HTML page → `public/pages/feature-name.html`
   - JavaScript → `public/scripts/feature-name.js`
   - CSS → `public/styles/feature-name.css`
   - Assets → `public/assets/feature-name/`

2. **Backend (API)**:
   - Routes → `src/routes/featureRoutes.js`
   - Models → `src/models/FeatureName.js`
   - Services → `src/services/featureService.js`
   - Middleware → `src/middleware/feature.js` (if needed)

3. **Documentation**:
   - Feature docs → `docs/features/feature-name.md`
   - Setup guide → `docs/setup/feature-setup.md`
   - User guide → `docs/guides/feature-guide.md`

4. **Tests**:
   - Unit tests → `tests/unit/feature.test.js`
   - Integration tests → `tests/integration/feature-api.test.js`

#### Adding Utility Functions

- **Client-side**: `public/scripts/utils/utilityName.js`
- **Server-side**: `src/utils/utilityName.js`

#### Adding Scripts

- **Deployment**: `scripts/deploy/deploy-feature.sh`
- **Setup**: `scripts/setup/setup-feature.sh`
- **Utilities**: `scripts/utils/utility-name.sh` or `.py`

### File Organization Best Practices

1. **Keep related files together**: Group files by feature, not by type
2. **Avoid deep nesting**: Maximum 3-4 levels of directories
3. **Use subdirectories for large features**: If a feature has many files, create a subdirectory
4. **Don't duplicate**: Check if similar functionality exists before creating new files
5. **Clean up**: Remove unused files and update references

### Code Organization

1. **Imports at the top**: Group by external, internal, relative
2. **Export at the bottom**: Use named exports when possible
3. **One responsibility**: Each file should have a single, clear purpose
4. **Consistent formatting**: Follow the project's ESLint/Prettier config

---

## 🎯 Common Scenarios

### Scenario 1: Adding a New Page

**Task**: Add a new "Profile" page

**Steps**:
1. Create HTML: `public/pages/profile.html`
2. Create JavaScript: `public/scripts/profile.js`
3. Create CSS: `public/styles/profile.css`
4. Add route (if needed): `src/routes/profileRoutes.js`
5. Update navigation: Modify `public/scripts/nav.js`
6. Add documentation: `docs/features/profile.md`

### Scenario 2: Adding a New API Endpoint

**Task**: Add an endpoint to get user achievements

**Steps**:
1. Create/update model: `src/models/Achievement.js`
2. Create route: `src/routes/achievementRoutes.js`
3. Create service: `src/services/achievementService.js`
4. Register route in: `src/server.js`
5. Add tests: `tests/unit/achievement.test.js`
6. Document API: Update `docs/guides/api-documentation.md`

### Scenario 3: Adding a Deployment Script

**Task**: Add a script to deploy to staging

**Steps**:
1. Create script: `scripts/deploy/deploy-staging.sh`
2. Make executable: `chmod +x scripts/deploy/deploy-staging.sh`
3. Document usage: Add to `docs/setup/deployment-ready.md`
4. Add to package.json: `"deploy:staging": "./scripts/deploy/deploy-staging.sh"`

### Scenario 4: Adding Test Fixtures

**Task**: Add mock data for testing

**Steps**:
1. Create fixture: `tests/fixtures/mock-challenges.json`
2. Use in tests: Import in `tests/unit/challenge.test.js`
3. Document: Add comment in test file explaining fixture usage

---

## 🔍 Quick Reference

### "Where does this file go?"

| File Type | Location | Example |
|-----------|----------|---------|
| HTML page | `public/pages/` | `public/pages/profile.html` |
| Client JS | `public/scripts/` | `public/scripts/profile.js` |
| CSS | `public/styles/` | `public/styles/profile.css` |
| Image | `public/assets/` | `public/assets/images/logo.png` |
| API route | `src/routes/` | `src/routes/profileRoutes.js` |
| Database model | `src/models/` | `src/models/Profile.js` |
| Business logic | `src/services/` | `src/services/profileService.js` |
| Middleware | `src/middleware/` | `src/middleware/auth.js` |
| Server utility | `src/utils/` | `src/utils/imageProcessor.js` |
| Client utility | `public/scripts/utils/` | `public/scripts/utils/formatter.js` |
| Deployment script | `scripts/deploy/` | `scripts/deploy/deploy-prod.sh` |
| Setup script | `scripts/setup/` | `scripts/setup/setup-oauth.sh` |
| Utility script | `scripts/utils/` | `scripts/utils/check-health.sh` |
| Unit test | `tests/unit/` | `tests/unit/profile.test.js` |
| Integration test | `tests/integration/` | `tests/integration/profile-api.test.js` |
| Test fixture | `tests/fixtures/` | `tests/fixtures/mock-users.json` |
| Feature docs | `docs/features/` | `docs/features/profile.md` |
| Setup guide | `docs/setup/` | `docs/setup/oauth-setup.md` |
| Dev guide | `docs/guides/` | `docs/guides/testing-guide.md` |
| Static data | `data/` | `data/questions.json` |

---

## 📚 Additional Resources

- [README.md](README.md) - Main project documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [docs/guides/](docs/guides/) - Development guides
- [docs/setup/](docs/setup/) - Setup instructions

---

## 🆘 Need Help?

If you're unsure where to place a file:
1. Check this guide first
2. Look for similar existing files
3. Ask in the project's Discord/Slack
4. Open a GitHub discussion
5. When in doubt, ask a maintainer

---

**Last Updated**: January 2026

**Maintained by**: KeyRacer Team
