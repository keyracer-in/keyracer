# Tutorial Template Files

This directory contains template files for creating new language tutorials in the KeyRacer platform.

## Overview

These templates provide a starting point for adding new programming language tutorials. They follow the established patterns used in the Python, Java, and JavaScript tutorials.

## Template Files

### 1. `tutorial-template.html`

**Location:** `public/pages/tutorial-template.html`

**Purpose:** HTML page template for a new language tutorial

**How to Use:**
1. Copy the file to `public/pages/tutorial-{language}.html`
2. Replace all `{Language}` placeholders with your language name (capitalized)
3. Replace all `{language}` placeholders with your language name (lowercase)
4. Customize SEO metadata (title, description, keywords)
5. Update Open Graph and Twitter Card tags
6. Modify structured data (JSON-LD)
7. Update the JavaScript initialization at the bottom

**Placeholders to Replace:**
- `{Language}` - Capitalized language name (e.g., "Ruby", "C++", "Go")
- `{language}` - Lowercase language name (e.g., "ruby", "cpp", "go")
- `{ext}` - File extension (e.g., "rb", "cpp", "go")

### 2. `example-introduction.md`

**Purpose:** Template for the introduction/overview page of a tutorial

**Content Includes:**
- Language overview and history
- Key features
- Why learn the language
- Real-world applications
- What learners will learn
- Prerequisites
- First program example

**How to Use:**
1. Copy to `content/tutorials/{language}/introduction.md`
2. Replace all placeholders with language-specific information
3. Add relevant code examples
4. Customize sections as needed

### 3. `example-getting-started.md`

**Purpose:** Template for installation and setup guide

**Content Includes:**
- Installation instructions (Windows, macOS, Linux)
- Development environment setup
- First program creation and execution
- Interactive mode (REPL) usage
- Project structure recommendations
- Common installation issues
- Package management basics

**How to Use:**
1. Copy to `content/tutorials/{language}/getting-started.md`
2. Update installation commands for your language
3. Modify IDE/editor recommendations
4. Adjust package manager information
5. Update troubleshooting section

### 4. `example-syntax.md`

**Purpose:** Template for basic syntax rules and conventions

**Content Includes:**
- Comments (single-line and multi-line)
- Indentation and code blocks
- Statements vs expressions
- Line continuation
- Case sensitivity
- Naming conventions
- Reserved keywords
- Operators
- String literals and formatting
- Common syntax errors

**How to Use:**
1. Copy to `content/tutorials/{language}/syntax.md`
2. Update syntax rules specific to your language
3. Modify code examples
4. Adjust naming conventions
5. Update reserved keywords list

### 5. `example-variables.md`

**Purpose:** Template for variables and basic data types

**Content Includes:**
- Variable declaration
- Naming rules and conventions
- Data types overview
- Variable scope
- Type conversion
- Variable operations
- String operations
- Constants
- Best practices
- Common mistakes
- Practice exercises

**How to Use:**
1. Copy to `content/tutorials/{language}/variables.md`
2. Update variable declaration syntax
3. Modify type system information (static vs dynamic)
4. Adjust data types section
5. Update code examples

### 6. `example-navigation.json`

**Purpose:** Template for navigation configuration

**Content Includes:**
- Example structure for multiple language tutorials
- Proper JSON formatting
- Path conventions
- Category organization

**How to Use:**
1. Add your language category to `content/meta/navigation.json`
2. Follow the pattern: `"{Language} Tutorial": [...]`
3. List topics in logical learning order
4. Use paths without `.md` extension
5. Ensure valid JSON syntax

## Quick Start Guide

### Adding a New Language Tutorial (Example: Ruby)

**Step 1: Create Content Directory**
```bash
mkdir -p content/tutorials/ruby
```

**Step 2: Copy and Customize Markdown Templates**
```bash
# Copy templates
cp docs/templates/example-introduction.md content/tutorials/ruby/introduction.md
cp docs/templates/example-getting-started.md content/tutorials/ruby/getting-started.md
cp docs/templates/example-syntax.md content/tutorials/ruby/syntax.md
cp docs/templates/example-variables.md content/tutorials/ruby/variables.md

# Edit each file and replace placeholders
# {Language} → Ruby
# {language} → ruby
# {ext} → rb
```

**Step 3: Update Navigation**
```bash
# Edit content/meta/navigation.json
# Add Ruby Tutorial section following the example pattern
```

**Step 4: Create Tutorial Page**
```bash
# Copy template
cp public/pages/tutorial-template.html public/pages/tutorial-ruby.html

# Edit and customize:
# - Replace all {Language} with Ruby
# - Replace all {language} with ruby
# - Update SEO metadata
# - Update JavaScript initialization
```

**Step 5: Test**
```bash
# Open in browser
open public/pages/tutorial-ruby.html
# or
python -m http.server 8000
```

## Placeholder Reference

### Common Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{Language}` | Capitalized language name | Ruby, Python, JavaScript |
| `{language}` | Lowercase language name | ruby, python, javascript |
| `{ext}` | File extension | rb, py, js |
| `{package-manager}` | Package manager command | gem, pip, npm |

### Language-Specific Examples

**Python:**
- `{Language}` → Python
- `{language}` → python
- `{ext}` → py
- `{package-manager}` → pip

**Ruby:**
- `{Language}` → Ruby
- `{language}` → ruby
- `{ext}` → rb
- `{package-manager}` → gem

**JavaScript:**
- `{Language}` → JavaScript
- `{language}` → javascript
- `{ext}` → js
- `{package-manager}` → npm

**Go:**
- `{Language}` → Go
- `{language}` → go
- `{ext}` → go
- `{package-manager}` → go get

**Rust:**
- `{Language}` → Rust
- `{language}` → rust
- `{ext}` → rs
- `{package-manager}` → cargo

## Customization Tips

### Content Customization

1. **Adjust Depth**: Templates provide comprehensive coverage. Feel free to simplify or expand based on your audience.

2. **Add Language-Specific Features**: Include unique features of your language that don't fit the template structure.

3. **Update Examples**: Ensure all code examples are idiomatic for your language.

4. **Add Visual Elements**: Consider adding diagrams, tables, or emojis for better engagement.

### SEO Customization

1. **Research Keywords**: Use tools like Google Keyword Planner to find relevant keywords.

2. **Write Unique Descriptions**: Don't just copy templates - write compelling, unique descriptions.

3. **Create Social Images**: Design custom Open Graph images (1200x630px) for better social sharing.

4. **Update Structured Data**: Ensure JSON-LD accurately represents your tutorial content.

### Style Customization

If your language needs specific styling:

1. Add language-specific CSS class to body: `tutorial-{language}`
2. Create custom styles in `public/styles/tutorial-common.css`
3. Use the class to scope your styles

Example:
```css
.tutorial-ruby .code-block {
  /* Ruby-specific code block styling */
}
```

## Validation Checklist

Before publishing your tutorial:

- [ ] All placeholders replaced
- [ ] Code examples tested and working
- [ ] Navigation.json updated and valid JSON
- [ ] SEO metadata complete and unique
- [ ] Links work correctly
- [ ] Syntax highlighting works
- [ ] Table of contents generates
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] No spelling/grammar errors

## Additional Resources

- **Main Guide**: See `docs/guides/adding-new-tutorials.md` for comprehensive instructions
- **Content Structure**: See `docs/guides/content-structure-guide.md` for content organization
- **Markdown Guide**: See `docs/guides/markdown-migration-guide.md` for markdown tips
- **Existing Tutorials**: Review Python, Java, and JavaScript tutorials as reference implementations

## Support

If you need help:
1. Review existing tutorials for reference
2. Check the comprehensive guide in `docs/guides/adding-new-tutorials.md`
3. Validate JSON files using online validators
4. Check browser console for errors
5. Reach out to the development team

## Version History

- **v1.0** - Initial template collection
  - HTML page template
  - Four markdown content templates
  - Navigation configuration example
  - Comprehensive documentation
