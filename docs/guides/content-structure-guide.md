# Content Structure Guide

## 📁 Where to Write Content

All content is written in **Markdown (.md) files** inside the `content/` folder.

### Folder Structure:

```
keyracer/
├── content/                          # ← All your content goes here
│   ├── tutorials/
│   │   ├── python/
│   │   │   ├── introduction.md       # ← Write Python intro here
│   │   │   ├── variables.md          # ← Write about variables here
│   │   │   ├── data-types.md         # ← Write about data types here
│   │   │   ├── functions.md
│   │   │   └── ...
│   │   ├── javascript/
│   │   │   ├── basics.md
│   │   │   └── advanced.md
│   │   └── web-development/
│   │       ├── html.md
│   │       └── css.md
│   ├── guides/
│   │   ├── installation.md
│   │   └── troubleshooting.md
│   └── meta/
│       └── navigation.json           # ← Configure menu here
│
├── tutorial-template.html            # ← Main page (don't edit much)
├── scripts/
│   └── markdown-renderer.js          # ← Loads and displays content
└── styles/
    └── markdown-content.css          # ← Styles for content
```

## ✍️ How to Add New Content

### Step 1: Create a Markdown File

Create a new file in `content/tutorials/python/` folder:

**Example: `content/tutorials/python/loops.md`**

```markdown
# Python Loops

## What are Loops?

Loops allow you to repeat code multiple times.

## For Loop

```python
for i in range(5):
    print(i)
```

## While Loop

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

## Key Points

- Use `for` when you know iterations
- Use `while` for conditional loops
- Use `break` to exit early
```

### Step 2: Add to Navigation

Edit `content/meta/navigation.json`:

```json
{
  "Python Tutorial": [
    {
      "title": "Introduction",
      "path": "tutorials/python/introduction"
    },
    {
      "title": "Variables",
      "path": "tutorials/python/variables"
    },
    {
      "title": "Loops",
      "path": "tutorials/python/loops"
    }
  ]
}
```

### Step 3: Done!

Your content will automatically appear in the navigation menu and be searchable.

## 🎨 Page Layout

```
┌─────────────────────────────────────────────────────┐
│                    HEADER                           │
│  Logo    Home  Challenges  Leaderboard    Login    │
└─────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────┐
│   SIDEBAR    │        MAIN CONTENT                  │
│              │                                      │
│ Navigation:  │  # Python Loops                      │
│ - Intro      │                                      │
│ - Variables  │  ## What are Loops?                  │
│ - Loops ✓    │  Loops allow you to...               │
│              │                                      │
│ TOC:         │  ```python                           │
│ - What are   │  for i in range(5):                  │
│ - For Loop   │      print(i)                        │
│ - While Loop │  ```                                 │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

## 📝 Markdown Syntax Quick Reference

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
`inline code`

- Bullet point
- Another point

1. Numbered list
2. Second item

[Link text](https://example.com)

![Image alt text](path/to/image.png)

```python
# Code block with syntax highlighting
def hello():
    print("Hello")
```

> Blockquote for important notes

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

## 🔄 Converting Your Existing HTML Content

Your current `python-tutorial.html` has sections like:

```html
<section id="variables" class="tutorial-section">
    <h1>📝 Python Variables</h1>
    <div class="example-box">
        <h3>📌 1. Declaring a Variable</h3>
        <p>Python does not require...</p>
        <pre><code class="language-python">
x = 5
name = "Alice"
        </code></pre>
    </div>
</section>
```

Convert to Markdown:

```markdown
# 📝 Python Variables

## 📌 1. Declaring a Variable

Python does not require...

```python
x = 5
name = "Alice"
```
```

## 🚀 Quick Start Commands

```bash
# Create content folder structure
mkdir -p content/tutorials/python
mkdir -p content/tutorials/javascript
mkdir -p content/guides
mkdir -p content/meta

# Create your first markdown file
touch content/tutorials/python/introduction.md

# Edit it with any text editor
nano content/tutorials/python/introduction.md
```

## ✅ Content Checklist

When creating new content:

- [ ] Create `.md` file in appropriate folder
- [ ] Write content using Markdown syntax
- [ ] Add code blocks with language tags
- [ ] Add entry to `navigation.json`
- [ ] Test in browser
- [ ] Check TOC generates correctly

## 🎯 Where Each File Goes

| Content Type | Location | Example |
|--------------|----------|---------|
| Python tutorials | `content/tutorials/python/` | `loops.md` |
| JavaScript tutorials | `content/tutorials/javascript/` | `arrays.md` |
| Installation guides | `content/guides/` | `setup.md` |
| API docs | `content/documentation/` | `api-reference.md` |
| Navigation config | `content/meta/` | `navigation.json` |

## 💡 Pro Tips

1. **Keep filenames simple**: Use lowercase with hyphens (e.g., `data-types.md`)
2. **One topic per file**: Don't make files too long
3. **Use clear headings**: They become the table of contents
4. **Add code examples**: Always include working code
5. **Test locally**: Open `tutorial-template.html` in browser to test