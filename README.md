# ichstillwoichwill

A small static Vite project scaffold with multiple HTML pages and SCSS support.

## Getting started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
make run
```

Build production assets:

```bash
make build
```

The hero source image at `src/assets/ichstillwoichwill-hero.jpg` is processed directly by Vite via `vite-imagetools`. During the build, Vite generates multiple responsive sizes and modern output formats for the hero image from the import query used in `src/scripts/hero-image.js`.

## Project structure

```text
.
├── about.html
├── index.html
├── Makefile
├── public/
├── src/
│   ├── assets/
│   ├── scripts/
│   └── styles/
└── vite.config.js
```



