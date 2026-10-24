# Contributing

Thanks for helping improve MetaNum. This guide covers the local setup, the test suite, and what a good pull request looks like.

## Requirements

- [Node.js](https://nodejs.org/) 22 (the CI workflow uses the same version)
- npm (bundled with Node.js)

The library has no runtime dependencies: `metanum.js` and `format-metanum.js` are self-contained files.

## Getting started

```bash
git clone https://github.com/dlsdl/metanum.git
cd metanum
npm test
```

## Tests

`npm test` runs the regression suite:

```bash
node test_mixed.js
```

The suite prints one `PASS` / `FAIL` line per assertion and exits non-zero on failure. `node docs/repro/issue-17.js` replays the historical defects tracked in issue #17.

When you fix a bug or change parser/formatter behavior:

- add a regression vector to `test_mixed.js` that fails before the fix and passes after it;
- keep the existing vectors passing;
- avoid weakening assertions to make a test pass.

## Notation semantics

[`docs/notation-semantics.md`](docs/notation-semantics.md) is the normative description of the notation (letter notation, brackets, hyper-operations, BEAF, layers, and formatting). If a change affects how a value is parsed, displayed, or formatted, update that document together with the code and the regression vectors. Open follow-up items and their acceptance criteria are tracked in [`docs/followups.md`](docs/followups.md).

## Branches and commits

- Branch off `main`: `fix/<topic>`, `docs/<topic>`, or `ci/<topic>`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) style messages where practical, for example `fix(format): exact token form past multiLetterLimit` or `docs: sync follow-up status`.
- Keep each pull request focused on one topic. Separate unrelated refactors and formatting changes.

## Pull requests

- Describe the problem, the approach, and any behavior changes.
- Link the relevant issue (`Fixes #NN` when the PR closes it) and include a runnable reproduction or test vector.
- Make sure the `tests` workflow passes; the same suite must pass locally with `npm test`.
- Do not commit generated files, editor configuration, or unrelated dependency changes.

## Issues

- Include a minimal, runnable reproduction: the input, the expected result, and the actual result.
- State the Node.js version and the MetaNum version (`require("./package.json").version`).
- For display problems, include the output of `format(...)` and the value it should represent.
