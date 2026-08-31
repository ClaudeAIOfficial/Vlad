# VLAD Website

A clean single-page frontend inspired by the supplied reference.

## Files
- `index.html` — page structure
- `styles.css` — sky, grass, low-poly scene, chat UI
- `script.js` — basic chat panel interactions

## Vlad character
The supplied Vlad character is already installed at `assets/vlad-character.png`.

Example:
```html
<img class="vlad-character" src="assets/vlad.png" alt="Vlad">
```

Then add:
```css
.vlad-character{
  width:300px;
  max-height:420px;
  object-fit:contain;
  filter:drop-shadow(0 18px 14px rgba(0,0,0,.18));
}
```

## Run
Open `index.html` directly, or deploy the folder to Vercel / Netlify.
