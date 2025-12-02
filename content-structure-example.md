# Recommended Folder Structure

```
keyracer/
├── content/                    # All Markdown content
│   ├── tutorials/
│   │   ├── python/
│   │   │   ├── introduction.md
│   │   │   ├── getting-started.md
│   │   │   ├── syntax.md
│   │   │   ├── variables.md
│   │   │   └── data-types.md
│   │   ├── javascript/
│   │   │   ├── basics.md
│   │   │   └── advanced.md
│   │   └── web-development/
│   ├── guides/
│   │   ├── installation.md
│   │   └── troubleshooting.md
│   ├── documentation/
│   │   ├── api.md
│   │   └── configuration.md
│   └── meta/                   # Content metadata
│       ├── navigation.json
│       └── tutorials-config.json
├── templates/                  # HTML templates
│   ├── tutorial.html
│   ├── guide.html
│   └── documentation.html
├── assets/
│   ├── css/
│   ├── js/
│   │   ├── markdown-renderer.js
│   │   └── content-loader.js
│   └── images/
└── scripts/
    └── build-content.js        # Optional: Static generation
```