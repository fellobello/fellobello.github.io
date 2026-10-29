# fellobello.github.io

Personal portfolio for Steven Cochrane, served by GitHub Pages at https://fellobello.github.io.
Plain HTML and CSS, no build step and no JavaScript.

## Layout

```
index.html              home: intro, project cards, skills, contact
projects/*.html         one page per project
projects/_template.html copy this to start a new project page
assets/style.css        all styles (colors and sizes are tokens at the top)
assets/img/             screenshots and diagrams
```

## Adding a project

1. Copy `projects/_template.html` to `projects/<name>.html` and fill it in.
2. Put images in `assets/img/`.
3. Add a card for it in the `<ul class="cards">` list in `index.html`.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` here and visit http://localhost:8000.

## Editing in the browser

Double-click `_editor/Edit site.command` in Finder (or run `node _editor/server.js`). The site
opens at http://localhost:4000 with a toolbar at the bottom of every page:

- **Edit text**: click any text and type. Click a link or image to change its address. The blue
  tag on the selected block moves, duplicates (e.g. a project card) or deletes it.
- **CSS**: the page title, description and `assets/style.css`, applied as you type.
- **Save** (or Cmd+S) writes to the real files; an unedited page saves back unchanged, so
  `git diff` shows only what you changed.

Links work normally while Edit text is off. Close the Terminal window to stop. `_editor/` isn't
published.

## Drafts

`_drafts/` holds pages that aren't ready to show (GitHub Pages doesn't publish folders that
start with an underscore). To publish one, move it into `projects/` and add its card to
`index.html`.
