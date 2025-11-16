# Modal style baseline

All in-game menus and popups should reuse the shared modal theme introduced in `src/styles/modalTheme.css`.

## Base classes
-
- `ui-overlay`: full-screen backdrop with blur and fade.
- `ui-modal-card`: gradient panel shell. Add the optional `full-width` modifier to stretch wider layouts.
- `ui-modal-title`, `ui-modal-body`: typography helpers for headings and supporting text.
- `ui-modal-actions`: flex container for footer buttons.
- `ui-modal-btn`: pill-shaped button. Add `.secondary` when you need a low-emphasis action.
- `ui-modal-icon`: consistent sizing for emoji/SVG icons.

## Usage
Wrap modal content like so:

```tsx
<div className="ui-overlay">
  <div className="ui-modal-card">
    <div className="ui-modal-icon">✨</div>
    <h2 className="ui-modal-title">Title</h2>
    <p className="ui-modal-body">Copy...</p>
    <div className="ui-modal-actions">
      <button className="ui-modal-btn">Primary</button>
      <button className="ui-modal-btn secondary">Cancel</button>
    </div>
  </div>
</div>
```

Add component-specific classes only when you need extra spacing or layout tweaks.
