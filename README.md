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
