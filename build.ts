import { capitalCase } from "change-case";
import { chain, map, range, zip } from "fp-ts/lib/Array";
import { Endomorphism, identity, tupled } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import * as R from "fp-ts/lib/Record";
import * as fs from "fs";
import * as stylus from "stylus";
import * as pkg from "./package.json";

const Color = require("color");

type Dictionary = Record<string, string>;

const palette = {
  red: "#ff5370",
  "red-alt": "#FF98A4",
  orange: "#ff995e",
  yellow: "#ffc777",
  green: "#c3e88d",
  teal: "#4fd6be",
  aqua: "#50C4FA",
  cyan: "#86e1fc",
  "cyan-alt": "#b4f9f8",
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
const variables = (type: "color" | "text" | "select") => (
  rec: string[] | Dictionary,
  { handleKey = identity, handleValue = identity }: VariableOptions = {}
) =>
  pipe(
    Array.isArray(rec) ? zip(range(1, rec.length + 1), rec) : R.toArray(rec),
    map(([k, v]) => [type, handleKey(k.toString()), handleValue(v)])
  );

const colors = variables("color");
const textVars = variables("text");
const prefix = (str: string): Endomorphism<string> => x => `${str}-${x}`;
const suffix = (str: string): Endomorphism<string> => x => `${x}-${str}`;
const userVariables = pipe(
  [
    [{ ...palette, calendar: palette.teal }],
    [text, { handleKey: prefix("text") }],
    [
      { thumb: text.dark + 30, track: gray[2] },
      { handleKey: prefix("scrollbar") }
    ],
    [
      {
        bg: palette.blue,
        fg: text.light
      },
      { handleKey: prefix("selection") }
    ],
    [
      palette,
      {
        handleKey: suffix("desaturated"),
        handleValue: hex =>
          Color({ hex })
            .desaturate(0.5)
            .hex()
      }
    ],
    [
      palette,
      {
        handleKey: suffix("light"),
        handleValue: hex =>
          Color({ hex })
            .lighten(0.1)
            .hex()
      }
    ],
    [
      palette,
      {
        handleKey: suffix("transparent"),
        handleValue: v => v + 33
      }
    ],
    [gray, { handleKey: prefix("base") }]
  ],
  chain(tupled(colors))
).concat(
  pipe(
    [
      [
        {
          family: [
            "'Inter V'",
            "'Inter'",
            "sans-serif",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "Helvetica",
            "Arial",
            "Apple Color Emoji",
            "Segoe UI Emoji"
          ].join(","),
          weight: "400",
          size: "14px"
        },
        {
          handleKey: prefix("ui-font")
        }
      ],

      [
        {
          family: "monospace",
          weight: "500",
          size: "100%"
        },
        {
          handleKey: prefix("mono-font")
        }
      ],
      [{ "selection-border": "none", "max-width": "1012px" }],
      [
        { size: "6px", radius: "0px" },
        { handleKey: prefix("scrollbar-chrome") }
      ],
      [
        ["0 2px 5px 0 rgba(0, 0, 0, 0.26)", "0 4px 8px 0 rgba(0, 0, 0, 0.4)"],
        { handleKey: prefix("elevation") }
      ]
    ],
    chain(tupled(textVars))
  )
);

stylus('@import "github.user";').render((err, css) => {
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
@-moz-document regexp('.*github.*') {
  :root {
${userVariables.map(([_, k]) => `--${k}: /*[[${k}]]*/;`).join("\n")}
  }
}

${css}`
  );
});
