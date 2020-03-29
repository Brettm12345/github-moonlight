# Contributing to GitHub-Moonlight

## Getting Started

GitHub-Moonlight is written in [stylus-lang](https://stylus-lang.com/) please
read the documentation for this language before approaching the code

## Style Guide

- Use the provided `.stlintrc` please check out
  [stlint](https://github.com/stylus/stlint) for more info
- Use the provided mixins in
  `[src/mixins.styl](https://github.com/Brettm12345/github-moonlight/blob/master/src/mixins.styl)`
- Nest selectors, create functions, use itorators, do everything possible to
  avoid repetition

## Build Scripts

- `yarn build`: Build the style
- `yarn copy`: Build the style and copy it to the clipboard. _note_: Requires `[xclip](https://github.com/astrand/xclip)`
