# Contributing to GitHub-Moonlight

## Getting Started

GitHub-Moonlight is written in [stylus-lang](https://stylus-lang.com/) please
read the documentation for this language before approaching the code

## Style Guide

- Use the provided `.stlintrc` please check out
  [stlint](https://github.com/stylus/stlint) for more info
- Use the provided mixins in
  [src/mixins.styl](https://github.com/Brettm12345/github-moonlight/blob/master/src/mixins.styl)
- Nest selectors, create functions, use itorators, do everything possible to
  avoid repetition

## Build Scripts

- `yarn build`: Build the style
- `yarn copy`: Build the style and copy it to the clipboard. _note_: Requires [xclip](https://github.com/astrand/xclip)


## Where to look

- *[src/mixins.styl](https://github.com/Brettm12345/github-moonlight/blob/master/src/mixins.styl)*: Custom stylus rules, mixins and functions
- *[github.user.styl](https://github.com/Brettm12345/github-moonlight/blob/master/github.user.styl)*: Where all the different parts of the theme come together
- *[src/index.styl](https://github.com/Brettm12345/github-moonlight/blob/master/src/index.styl)*: Where different files are imported
- *[metadata.css](https://github.com/brettm12345/github-moonlight/blob/master/metadata.css)*: Version info and color variables please reference the [UserCSS](https://github.com/openstyles/stylus/wiki/UserCSS-authors) spec
