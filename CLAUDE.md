# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI TOOLBOX - A video project management tool for Midjourney v7 that allows users to manage video scenes with start/middle/end frames, prompts, characters, locations, and props using a semantic block-based prompt system.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production (runs tsc -b && vite build)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### View Navigation System

The app uses a **multi-view navigation system** controlled by boolean state flags in `App.tsx`:

| View | State Flag | Description |
|------|------------|-------------|
| START | `showStart` | Landing page with external Gemini tool links |
| Storyboard | default (all flags false) | Main project management with scenes/frames |
| Visual Concept | `showVisualConcept` | Character, location, and prop management |
| Nano Studio | `showNanoStudio` | Embedded iframe to external app |
| Frame Extractor | `showFrameExtractor` | Embedded iframe tool |
| MJ Download | `showMultiDownloader` | Batch image/video downloader |
| Prompt Generator | `showPromptGenerator` | AI prompt generation tool |

Navigation is mutually exclusive - setting one view flag clears others.

### State Management

**App-level state** (`App.tsx`):
- `projectData`: The entire project JSON structure
- `isPasswordAuthenticated`: Gate for app access
- View flags: `showStart`, `showNanoStudio`, `showVisualConcept`, etc.

**Persistence** (localStorage keys):
- `currentProject`: Full project data
- `passwordAuthenticated`: Auth state
- `language`: Selected language ('ko' | 'en')
- `frame_image_{sceneId}_{type}`: Frame image URLs
- `frame_video_{sceneId}_{type}`: Frame video URLs
- `frame_prompt_{sceneId}_{type}`: Prompt overrides
- `character_image_{id}`: Character reference images
- `keyprop_image_{id}`: Prop reference images
- `location_image_{id}`: Location reference images

### Internationalization (i18n)

Language system in `src/contexts/LanguageContext.tsx`:
- Supports Korean (`ko`) and English (`en`)
- Toggle button in Sidebar footer
- Access translations via `useLanguage()` hook: `const { t, language, setLanguage } = useLanguage()`
- All UI text should use `t.keyName` pattern

### Data Model

#### V8.1 Schema (Semantic Block System)

The app supports two data formats - legacy prompts and V8.1 semantic blocks:

```typescript
// V8.1 Semantic Blocks (src/types/schema.ts)
interface SemanticBlocks {
  // Style: style_main, style_ref, media_type, genre
  // Character: char_desc, char_body, char_hair, char_expression, char_outfit, action_pose...
  // Location: loc_main, loc_structure, atmosphere, loc_light_mood...
  // Props: prop_name, prop_detail, prop_special...
  // Camera: camera_shot, quality_tags, model_params
}

interface Library {
  characters: Record<string, { name: string, blocks: SemanticBlocks }>
  locations: Record<string, { name: string, blocks: SemanticBlocks }>
  props: Record<string, { name: string, blocks: SemanticBlocks }>
}
```

#### Prompt Generation

`src/lib/promptBuilder.ts` assembles prompts in 5 chunks:
1. **Style** - Visual style, genre, media type
2. **Camera** - Shot type, gaze direction
3. **Subject** - Character description, action, appearance
4. **Background** - Location, atmosphere, lighting
5. **Parameters** - Quality tags, model params

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `VisualConceptTabs` | `src/components/project/` | Tabbed UI for characters/locations/props with V8.1 block support |
| `SceneCard` | `src/components/project/` | Single scene with start/middle/end frames |
| `FrameBox` | `src/components/project/` | Editable frame with prompt, image/video URLs |
| `PasswordModal` | `src/components/auth/` | Initial authentication gate |
| `MultiDownloader` | `src/components/project/` | Batch download with JSZip |

## Styling

- **Framework**: Tailwind CSS v3 + shadcn/ui components
- **Theme**: Dark mode with CSS custom properties in `src/index.css`
- **UI Components**: `src/components/ui/` (Button, Card, Input, Badge, etc.)
- **Icons**: Lucide React

### CSS Variables (`:root`)

```css
--background: 0 0% 7%    /* Near black */
--foreground: 0 0% 98%   /* Near white */
--card: 0 0% 10%
--border: 0 0% 20%
--primary: 0 0% 98%
--muted: 0 0% 15%
```

## File Paths

- Path alias: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- UI components: `@/components/ui/`
- Contexts: `@/contexts/`
- Types: `@/types/`
- Utils: `@/lib/`

## JSON File Upload

The app handles multiple JSON formats on upload:
1. **Single scene** - Wrapped into a test project
2. **Full project** - Standard format with `project`, `scenes`, `definitions`
3. **Backup format** - Contains `projectData` + `cachedData`
4. **Properties wrapper** - `properties.projectData` format

Legacy `shots` fields are auto-converted to `frames`.
