# AGENTS.md

## Project context

This project was originally developed in Java and later migrated to JavaScript.

The migration may have preserved Java-oriented structures, patterns, and abstractions that are not idiomatic or appropriate for JavaScript.

The current goal is to progressively rework and improve the project while preserving its intended behavior.

## Working rules

- Inspect the existing code and architecture before making changes.
- Prefer idiomatic JavaScript solutions over Java-like patterns.
- Do not blindly reproduce the original Java architecture.
- Preserve existing behavior unless the task explicitly requires changing it.
- Do not modify unrelated parts of the project.
- Avoid adding dependencies unless they are necessary.
- Keep changes small and understandable.
- Before making large changes, explain the proposed approach.
- Do not assume that existing abstractions are correct simply because they already exist.

## Verification

- Run the project's existing tests or validation commands when relevant.
- Verify changes when possible.
- Do not claim something works without verification.