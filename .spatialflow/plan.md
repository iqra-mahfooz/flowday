
## GitSpace — Spatial Productivity System for Developers

### Overview
A dark-mode, developer-aesthetic infinite canvas where tasks live as draggable Markdown nodes. Projects create visible boundary zones on the canvas. Completing a task simulates a Git commit. A commit history panel tracks all task state changes. Powered by Supabase for full persistence.

---

### 1. Design System & Theme
- Deep dark background (`#0a0a0a` / near-black) with subtle grid or dot-pattern on the canvas
- Monospace font (JetBrains Mono or similar) for all metadata — timestamps, IDs, commit hashes
- Muted neon accent color (cyan or green) for active states, selection, and commit indicators
- Minimal motion — smooth drag, slide-in panels, no bouncy animations
- Border styling reminiscent of terminal/IDE panels

---

### 2. App Layout
- **Top bar** — project selector, command palette trigger (`⌘K`), keyboard shortcut hint
- **Left sidebar** — collapsible panel listing Projects (folders) with task counts and a "Commit Log" toggle
- **Main area** — the infinite 2D canvas
- **Right panel** — slides in for task editing (Markdown + preview)

---

### 3. Infinite 2D Canvas
- Pannable and zoomable canvas (mouse drag to pan, scroll to zoom)
- Faint dot-grid background that moves with the canvas
- Task nodes rendered as cards at their saved X/Y positions
- Project boundary zones rendered as lightly outlined rectangular regions with a project label in the corner
- Tasks can be dragged freely; if dropped inside a boundary zone, they're assigned to that project
- Canvas state (pan offset, zoom level) remembered per session

---

### 4. Task Cards (Nodes)
Each card shows:
- Task title (monospace, bold)
- Project badge (color dot + name)
- Status indicator: `[ ]` open, `[x]` complete
- `created_at` timestamp in small monospace text
- A subtle "commit count" badge if the task has history entries

Interactions:
- **Click** → open right-side editing panel
- **Drag** → reposition on canvas (position auto-saved)
- **Right-click / hover menu** → Delete, Duplicate, Mark Complete
- **Double-click title** → quick inline rename

---

### 5. Task Editor (Right Side Panel)
- Split view: Markdown source on left, rendered preview on right (togglable)
- Title input at the top
- Project selector dropdown
- Status toggle button ("Mark Complete → Commit")
- Metadata footer: `id`, `created_at`, `updated_at` in monospace
- Changes auto-save with a debounced save indicator

---

### 6. Project Boundary Zones
- Created from the Projects panel in the left sidebar
- Rendered as semi-transparent labeled rectangles on the canvas
- Can be repositioned and resized
- Each project has a color; all its tasks inherit that color accent
- Tasks dropped inside a zone auto-assign to that project

---

### 7. Simulated Git Commit System
When a task is marked complete:
- A commit entry is written to the `commit_log` table
- Entry contains: `task_id`, `action_type` (e.g. `"COMPLETE"`), `timestamp`, auto-generated `message` (e.g. `"chore: closed task #abc123 - Fix auth bug"`)
- Task card gains a ✓ and a muted green border
- A short toast notification confirms the "commit"

Other logged actions: task created, task edited (on significant change), task deleted (soft-log)

---

### 8. Commit History Panel
- Accessible from the left sidebar
- Shows a git-log style list: `hash • timestamp • message`
- Filterable by project or task
- Clicking an entry highlights the related task on the canvas
- Monospace styling throughout, subtle color-coding by action type

---

### 9. Command Palette (`⌘K`)
- Fuzzy search over all tasks and projects
- Actions: "New Task", "New Project", "Open Commit Log", "Search tasks…"
- Results show task title + project badge
- Keyboard-navigable (arrow keys + Enter)

---

### 10. Keyboard Shortcuts
- `⌘K` → Command palette
- `N` → New task (at canvas center)
- `Esc` → Close panel / deselect
- `⌘S` → Force save current task
- `⌘Enter` → Mark task complete (commit)
- `Space` → Pan mode toggle

---

### 11. Database Schema (Supabase)
**`tasks` table**
- `id`, `title`, `markdown_content`, `project_id`, `status` (open/complete), `x`, `y`, `created_at`, `updated_at`

**`projects` table**
- `id`, `name`, `color`, `x`, `y`, `width`, `height`, `created_at`

**`commit_log` table**
- `id`, `task_id`, `action_type`, `message`, `timestamp`

---

### 12. Architecture Notes (Extensibility)
- Canvas engine abstracted into its own module → easy to swap renderer later
- Commit logic isolated in a `useCommitLog` hook → ready for real GitHub API calls
- Task data fetching via React Query with local cache → offline-friendly reads
- Markdown rendering via a dedicated component → swappable parser
- Command palette as a standalone component → extensible with AI actions later
