# Visualizers App

A collection of visual tools designed to help you plan, reflect, and organize your life. Built with **Neo-Brutalism** design principles.

## Tools

### Memento Mori (`/memento-mori`)
A stoic "Life Calendar" that visualizes your life in weeks.
- **Life Grid**: See your life as a grid of 4,000+ weeks.
- **Phases**: Automatically highlights Childhood, Career, and Retirement.
- **True Freedom Mode**: Calculates your *actual* free time by subtracting sleep, work, and chores.
- **Animation**: Watch your past weeks fill up to visualize the passage of time.
- **Export**: Download high-quality PDF reports.

## Development

Run the app locally:
```bash
pnpm --filter apps/visualizers run dev
```
App will start at `http://localhost:5174`.

## Tech Stack
- React + Vite
- Tailwind CSS (Neo-Brutalism)
- Framer Motion (Animations)
- html2canvas + jsPDF (Export)
