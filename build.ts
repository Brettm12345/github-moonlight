import { capitalCase } from "change-case";
import { chain, map, range, zip } from "fp-ts/lib/Array";
import { Endomorphism, identity, tupled } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import * as R from "fp-ts/lib/Record";
import * as fs from "fs";
import * as stylus from "stylus";
import * as pkg from "./package.json";

const fonts = {
  ui:
    "'Inter', 'Inter V', sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
  mono: "monospace"
};

const palette = {
  red: "#ff5370",
  "red-light": "#ff757f",
  orange: "#ff995e",
  yellow: "#ffc777",
  green: "#c3e88d",
  teal: "#4fd6be",
  cyan: "#86e1fc",
  "cyan-light": "#b4f9f8",
  blue: "#82aaff",
  "blue-dark": "#4976eb",
  pink: "#fca7ea",
  purple: "#c597f9",
  indigo: "#7a88cf"
};

const text = (() => {
  const base = {
    light: "#e2e8fa",
    primary: "#c8d3f5",
    paragraph: "#c0cdf3",
    secondary: "#b4c2f0",
    gray: "#a9b8e8",
    dark: "#828bb8"
  };
  return {
    ...base,
    faded: base.dark + "ed",
    placeholder: base.primary + "aa"
  };
})();

const gray = [
  "#131421",
  "#191b28",
  "#1b1d2c",
  "#1e2030",
  "#212337",
  "#222436",
  "#2f334d",
  "#383e5c",
  "#444a73"
];

interface VariableOptions {
  handleKey?: Endomorphism<string>;
  handleValue?: Endomorphism<string>;
}
const variables = (type: "color" | "text") => (
  rec: string[] | Record<string, string>,
  { handleKey = identity, handleValue = identity }: VariableOptions = {}
) =>
  pipe(
    Array.isArray(rec) ? zip(range(1, rec.length + 1), rec) : R.toArray(rec),
    map(([k, v]) => [type, handleKey(k.toString()), handleValue(v)])
  );

const colors = variables("color");
const vars = variables("text");

const userVariables = pipe(
  [
    [{ ...palette, calendar: palette.teal }],
    [text, { handleKey: k => `text-${k}` }],
    [
      {
        bg: palette.blue,
        fg: text.light
      },
      { handleKey: k => `selection-${k}` }
    ],
    [
      palette,
      {
        handleKey: k => `${k}-transparent`,
        handleValue: v => v + 33
      }
    ],
    [gray, { handleKey: i => `base-${i}` }]
  ],
  chain(tupled(colors))
).concat(
  pipe(
    [
      [
        fonts,
        {
          handleKey: k => `${k}-font`
        }
      ],
      [{ "selection-border": "none" }],
      [
        { size: "6px", radius: "0px" },
        { handleKey: k => `scrollbar-chrome-${k}` }
      ],
      [
        ["0 2px 5px 0 rgba(0, 0, 0, 0.26)", "0 4px 8px 0 rgba(0, 0, 0, 0.4)"],
        { handleKey: k => `elevation-${k}` }
      ]
    ],
    chain(tupled(vars))
  )
);

stylus.render('@import "github.user";', (err, css) => {
  if (err) throw err;

  fs.writeFileSync(
    "./github.user.css",
    `/* ==UserStyle==
@name         ${pkg.name}
@namespace    ${pkg.homepage}
@version      ${pkg.version}

@license      ${pkg.license}
@description  ${pkg.description}
@author       ${pkg.author}
@homepageURL  ${pkg.homepage}
@supportURL   ${pkg.bugs.url}
@updateURL    ${pkg.homepage}/raw/master/github.user.css

${userVariables
  .map(([t, k, v]) => `@var ${t} ${k} "${capitalCase(k)}" ${v}`)
  .join("\n")}
@preprocessor uso
==/UserStyle== */
@-moz-document domain('raw.githubusercontent.com'),
regexp('https?://((developer|gist)\.)?github\.com/.*') {
  :root {
${userVariables.map(([_, k]) => `    --${k}: /*[[${k}]]*/;`).join("\n")}
  }
}

${css}`
  );
});
