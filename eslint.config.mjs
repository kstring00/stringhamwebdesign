import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import babelParser from "@babel/eslint-parser";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Next 16 removed `next lint`, so the lint script runs ESLint directly.
 *
 * This is Next's own rule set (core-web-vitals) plus the React Hooks rules,
 * with TypeScript files parsed by Babel's TypeScript preset. It deliberately
 * does not load eslint-config-next or typescript-eslint: both refuse to start
 * against TypeScript 7, the compiler this repo uses, and will until
 * typescript-eslint ships TS 7 support (their issue #10940). Babel parses the
 * same syntax without needing the TypeScript API, at the cost of the
 * type-aware rules — none of which the Next or Hooks rule sets require.
 */
export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "next-env.d.ts",
      // Playwright and Lighthouse checks: plain Node scripts, run by hand.
      "scripts/**",
    ],
  },
  js.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    rules: {
      // The site links between pages with plain anchors on purpose: every
      // move is a full document load, which is what keeps the analytics tag
      // from following a visitor into the client portal (see
      // app/ClarityAnalytics.tsx). The rule assumes client transitions are
      // always wanted; here they are not.
      "@next/next/no-html-link-for-pages": "off",
      // Images are plain <img> with explicit srcSet, sizes, width and height,
      // decided per image, and Lighthouse holds above 90 on the heavy pages.
      // The 2026-09-13 audit report records this as a deliberate choice.
      "@next/next/no-img-element": "off",
      // Both flag patterns this codebase uses knowingly — restoring a draft
      // from sessionStorage after hydration, and a "latest value" ref
      // written during render. Kept visible as warnings rather than errors
      // so a new instance still gets a second look.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      // Browser globals and TS-checked code: the TypeScript compiler already
      // catches undefined names, and ESLint without type information cannot
      // see DOM or Node globals reliably.
      "no-undef": "off",
      // Babel's parser does not mark JSX tags or type positions as uses, so
      // the core rule reports every imported component and type as unused.
      // The TypeScript compiler is the authority on unused symbols here.
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        requireConfigFile: false,
        // The presets live in their own file rather than inline: ESLint
        // deep-merges parserOptions across config objects and turns an
        // inline presets array into an object on the way, which Babel then
        // rejects. The file name is deliberately not one Next looks for, so
        // the build stays on SWC.
        babelOptions: {
          babelrc: false,
          configFile: "./eslint.babel.json",
        },
      },
    },
  },
];
