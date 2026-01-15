# Table of Contents (TOC) Generation Feature

## Overview

The Table of Contents (TOC) generation feature automatically creates a navigable index of all headings (h2 and h3) in tutorial content. The TOC is displayed in the sidebar under the active navigation item, providing users with quick access to different sections within a page.

## Features

### 1. Automatic Heading ID Generation

- **Unique IDs**: Every heading automatically receives a unique ID for anchor linking
- **Text-based IDs**: IDs are generated from heading text (e.g., "Introduction" → "introduction")
- **Special Character Handling**: Special characters are sanitized (e.g., "What's New?" → "what-s-new")
- **Duplicate Prevention**: Duplicate headings get numbered suffixes (e.g., "intro", "intro-1", "intro-2")
- **Fallback IDs**: Empty headings receive fallback IDs (e.g., "heading-0", "heading-1")

### 2. Hierarchical Structure

- **Two-Level Hierarchy**: h2 headings are top-level, h3 headings are nested underneath
- **Visual Nesting**: Nested items are indented and styled differently
- **Logical Grouping**: h3 items are grouped under their parent h2 heading

### 3. Smooth Scrolling

- **Smooth Animation**: Clicking a TOC link smoothly scrolls to the target heading
- **Visual Feedback**: Target heading briefly highlights when scrolled to
- **URL Updates**: Browser URL updates with the heading anchor (e.g., `#introduction`)
- **Bookmarkable**: Users can bookmark or share links to specific sections

### 4. Sidebar Integration

- **Dynamic Display**: TOC appears under the active navigation item in the sidebar
- **Automatic Updates**: TOC regenerates when content changes
- **Responsive Design**: TOC adapts to different screen sizes

## Implementation Details

### JavaScript Components

#### MarkdownRenderer.generateTOC(container)

Main method that orchestrates TOC generation:

```javascript
generateTOC(container) {
    // 1. Extract h2 and h3 headings
    const headings = container.querySelectorAll('h2, h3');
    
    // 2. Generate unique IDs for all headings
    // 3. Create TOC structure
    // 4. Display in sidebar
}
```

#### MarkdownRenderer.displayTOCInSidebar(tocItems)

Renders the TOC HTML structure in the sidebar:

```javascript
displayTOCInSidebar(tocItems) {
    // 1. Find active navigation link
    // 2. Find subsection container
    // 3. Build hierarchical HTML structure
    // 4. Show the container
}
```

#### MarkdownRenderer.createTOCLink(item)

Creates individual TOC link elements with smooth scroll:

```javascript
createTOCLink(item) {
    // 1. Create anchor element
    // 2. Add smooth scroll behavior
    // 3. Update URL on click
    // 4. Add visual feedback
}
```

### CSS Styling

#### Base Subsection Styles

```css
.nav-subsections {
    list-style: none;
    padding-left: 1rem;
    margin-top: 0.5rem;
}
```

#### Nested Subsection Styles

```css
.nav-subsections-nested {
    list-style: none;
    padding-left: 1rem;
    margin-top: 0.25rem;
}
```

#### TOC Link Styles

```css
.toc-link {
    display: block;
    position: relative;
    transition: all 0.2s ease;
}

.toc-link.toc-level-2 {
    font-weight: 500;
}

.toc-link.toc-level-3 {
    font-weight: 400;
    opacity: 0.9;
}
```

#### Highlight Animation

```css
.toc-target-highlight {
    animation: highlightPulse 2s ease;
}

@keyframes highlightPulse {
    0% { background: transparent; }
    10% { 
        background: rgba(0, 255, 221, 0.15);
        box-shadow: 0 0 20px rgba(0, 255, 221, 0.3);
    }
    100% { background: transparent; }
}
```

## Usage

### For Content Authors

When writing tutorial content in markdown:

1. **Use h2 for main sections**:
   ```markdown
   ## Introduction
   ```

2. **Use h3 for subsections**:
   ```markdown
   ### What is Python?
   ```

3. **Write descriptive headings**: The heading text becomes the TOC link text and ID

4. **Avoid duplicate headings**: If you must use duplicates, they'll get numbered IDs

### For Developers

The TOC generation is automatic. When content is loaded:

```javascript
// In markdown-renderer.js
async renderToElement(contentPath, targetElement) {
    // ... load and render content ...
    
    // TOC is automatically generated
    this.generateTOC(targetElement);
}
```

No additional code is needed in tutorial pages.

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **Requirement 10.1**: Extracts h2 and h3 headings from content ✓
- **Requirement 10.2**: Generates unique IDs for all headings ✓
- **Requirement 10.3**: Creates TOC links with smooth scroll ✓
- **Requirement 10.4**: Displays TOC in sidebar ✓
- **Requirement 10.5**: Assigns unique IDs to all headings for anchor linking ✓

## Testing

### Manual Testing

1. Open any tutorial page (e.g., `tutorial-java.html`)
2. Navigate to a content page with multiple headings
3. Verify TOC appears in the sidebar
4. Click TOC links and verify smooth scrolling
5. Check that URL updates with heading anchors
6. Verify nested structure (h3 under h2)

### Automated Testing

Run the verification script:

```bash
node tests/verify-toc-generation.js
```

### Test HTML Page

Open the test page in a browser:

```
keyracer/tests/fixtures/toc-test.html
```

## Browser Compatibility

- **Chrome**: Full support ✓
- **Firefox**: Full support ✓
- **Safari**: Full support ✓
- **Edge**: Full support ✓
- **Mobile browsers**: Full support ✓

The implementation uses standard Web APIs:
- `scrollIntoView()` with smooth behavior
- `history.replaceState()` for URL updates
- Standard DOM manipulation

## Performance Considerations

- **Efficient Selectors**: Uses `querySelectorAll('h2, h3')` for fast heading extraction
- **Minimal DOM Operations**: Builds TOC structure in memory before inserting
- **Event Delegation**: Could be added for better performance with many TOC items
- **Lazy Generation**: TOC only generates when content is loaded

## Future Enhancements

Potential improvements for future versions:

1. **Active Section Highlighting**: Highlight the current section in TOC as user scrolls
2. **Collapsible Sections**: Allow users to collapse/expand TOC sections
3. **Search in TOC**: Add search functionality to filter TOC items
4. **Sticky TOC**: Make TOC sticky within the sidebar
5. **Progress Indicator**: Show reading progress through the document
6. **Print Optimization**: Include TOC in printed versions

## Troubleshooting

### TOC Not Appearing

**Problem**: TOC doesn't show in sidebar

**Solutions**:
- Check that content has h2 or h3 headings
- Verify active navigation link exists (`.content-navigation a.active`)
- Check browser console for errors
- Ensure `.nav-subsections` container exists

### Duplicate IDs

**Problem**: Multiple headings have the same ID

**Solution**: This should not happen - the implementation ensures uniqueness. If it does:
- Check for manual ID assignments in markdown
- Verify the uniqueness logic in `generateTOC()`

### Smooth Scroll Not Working

**Problem**: Clicking TOC links jumps instead of scrolling smoothly

**Solutions**:
- Check browser support for `scrollIntoView({ behavior: 'smooth' })`
- Verify no CSS `scroll-behavior` conflicts
- Check for JavaScript errors preventing the click handler

### Styling Issues

**Problem**: TOC links don't look right

**Solutions**:
- Verify `tutorial-common.css` is loaded
- Check for CSS conflicts with other stylesheets
- Inspect elements in browser DevTools

## Related Files

- **JavaScript**: `keyracer/public/scripts/markdown-renderer.js`
- **CSS**: `keyracer/public/styles/tutorial-common.css`
- **Test Page**: `keyracer/tests/fixtures/toc-test.html`
- **Verification Script**: `keyracer/tests/verify-toc-generation.js`
- **Documentation**: `keyracer/docs/features/table-of-contents.md`

## Changelog

### Version 1.0.0 (Current)

- Initial implementation of TOC generation
- Automatic heading ID generation with uniqueness
- Hierarchical structure (h2 with nested h3)
- Smooth scrolling to headings
- Visual feedback on scroll
- Sidebar integration
- Responsive design
- Comprehensive documentation
