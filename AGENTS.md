# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript application code.
- `src/components/` groups UI building blocks (layout, project, and reusable UI).
- `src/lib/` holds shared utilities; `src/types/` defines shared types.
- `public/` stores static assets served as-is.
- `dist/` is the Vite build output (generated).

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server at `http://localhost:5173`.
- `npm run build`: type-check (`tsc -b`) and produce a production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint on the codebase.

## Coding Style & Naming Conventions
- TypeScript + React functional components (`.tsx` for UI, `.ts` for utilities).
- Indentation follows existing files (2 spaces in CSS, 2 spaces in JSON, 2 spaces in TS/TSX).
- Tailwind CSS utility classes are preferred for styling; global styles live in `src/index.css`.
- Use PascalCase for components (e.g., `SceneCard.tsx`) and camelCase for functions/vars.
- Path alias `@/` maps to `src/` (see `tsconfig.json`).

## Testing Guidelines
- No test framework is configured in this repository.
- If you add tests, document the framework and add scripts to `package.json`.

## Commit & Pull Request Guidelines
- Git history is not available in this workspace; follow conventional commits
  (`feat:`, `fix:`, `chore:`) unless the project team specifies otherwise.
- PRs should include: a clear description, linked issues (if any), and UI screenshots
  for visual changes.

## Security & Configuration Tips
- Keep environment-specific values out of source; prefer `.env` files ignored by Git.
- Do not commit user data or exported project JSON samples with sensitive content.
