# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AITOOLBOX - A video project management tool for Midjourney v7 that allows users to manage video scenes with start/end frames, prompts, and transitions.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Application Structure

The app uses a **three-view navigation system** controlled by state in `App.tsx`:
- **START view** (`showStart=true`): Displays a fullscreen hero image
- **Project view** (default state): Main project management interface with scenes/frames
- **Nano Studio view** (`showNanoStudio=true`): Embedded iframe to external Nano Studio app

Navigation is handled via the Sidebar component with mutually exclusive view states.

### State Management

**App-level state** (in `App.tsx`):
- `projectData`: The entire project JSON structure loaded from file
- `showStart`, `showNanoStudio`: View routing state
- `sidebarOpen`: Mobile sidebar visibility

**Persistence**:
- Project data auto-saves to `localStorage` as `currentProject`
- Frame-specific overrides (prompts, images) cached with keys: `frame_image_{sceneId}_{type}` and `frame_prompt_{sceneId}_{type}`

### Data Model

Projects are loaded via JSON file upload with this structure:

```typescript
{
  project: {
    title: string
    style: string
    aspectRatio: string
    totalDuration: string
    description?: string
  }
  scenario?: string  // Optional scenario text shown in modal
  scenes: Array<{
    sceneNumber: number
    sceneId: string
    title?: string
    description?: string
    frames: {
      start: { prompt: string, description?: string, imageUrl?: string }
      end: { prompt: string, description?: string, imageUrl?: string }
    }
    transition?: { type: string, duration: number }
  }>
}
```

### Component Hierarchy

```
App
├── Header (fixed top)
│   ├── Logo (clickable, routes to /)
│   ├── Scenario button (conditional, shows modal)
│   └── Upload button (triggers JSON file input)
├── Sidebar (fixed left, collapsible on mobile)
│   ├── START tab
│   ├── 프로젝트 tab
│   ├── 나노스튜디오 tab
│   └── Download/Clear actions (when project loaded)
└── Main content area (conditional rendering)
    ├── START: Fullscreen image
    ├── Nano Studio: iframe embed
    └── ProjectManager
        ├── Project info summary
        ├── Scene selector (dropdown)
        └── SceneCard (single scene)
            └── FrameBox × 2 (start/end frames)
                ├── Editable prompt (click to edit)
                ├── Copy button
                └── Image URL input + preview
```

### Key Features

**Editable Prompts**:
- Click prompt text to enter edit mode (textarea)
- Changes persist to localStorage immediately
- Cancel button reverts to cached version

**Image Management**:
- Users can add image URLs to frames
- Images display with `object-contain` to preserve aspect ratio
- URLs cached to localStorage per frame

**Scene Navigation**:
- Dropdown selector shows one scene at a time
- Scene numbers and titles displayed in dropdown options

## Styling

- **Framework**: Tailwind CSS v3 with custom dark theme
- **Design system**: Black & white with red accent (`bg-red-900/50` for active states)
- **Button style**: `rounded-full` with hover effects (`hover:bg-white/10` for inactive, `hover:bg-red-900/70` for active)
- **Theme**: Dark mode enforced via CSS variables in `src/index.css`

### Color Tokens

All colors use HSL CSS variables defined in `:root`:
- `--background: 0 0% 7%` (near black)
- `--foreground: 0 0% 98%` (near white)
- `--card: 0 0% 10%`
- `--border: 0 0% 20%`

## File Paths

- Use `@/` alias for imports from `src/` directory (configured in `vite.config.ts`)
- UI components: `@/components/ui/`
- Utility functions: `@/lib/utils`

## External Integration

Nano Studio iframe URL: `https://nano-studio-252213558759.us-west1.run.app`