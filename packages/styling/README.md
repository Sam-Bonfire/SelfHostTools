# Styling & UI Components

This package (`@packages/styling`) serves as the foundational design system for the SelfHostTools suite. It exports a set of reusable, accessible, and stylistically consistent React components.

## Design Philosophy
The UI follows a distinct **Neo-Brutalism / High-Contrast** aesthetic:
*   **Bold Borders**: Thick, solid borders (often `border-4` and `border-black`) define structure.
*   **Vibrant Colors**: Usage of primary colors like Yellow (`bg-yellow-300`) and standard Tailwind palette for status checks (Green/Red/Orange).
*   **Hard Shadows**: CSS box-shadows with no blur (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`) create a tactile, comic-book-like depth.

## Components

### `Card`
A container component with the signature hard border and shadow style. Used to group related inputs or results.
*   **Usage**: Wraps calculator sections (e.g., "Billed Income", "Results Analysis").

### `Button`
Interactive elements with hover/active states that mimic physical pressing (translation + shadow removal).
*   **Variants**: `primary`, `secondary`, `outline`.

### `Input`
Form controls styled with bold fonts and clear borders.
*   **Features**: Supports standard HTML input props. Often used in conjunction with absolute positioned icons in the calculator forms.
*   **Accessibility**: Always requires an `id` prop to be associated with a label via `htmlFor`.

### `Tooltip`
Informational overlays used to explain complex financial terms or input requirements.
*   **Behavior**: content appears on hover; supports positioning adjustments.

### `Checkbox`
Custom-styled selection control that matches the thick-border aesthetic of the rest of the application.
*   **Accessibility**: Should be wrapped in a `<label>` element for proper hit-area size and assistive text association.

### Layout Components

To reduce boilerplate and ensure visual consistency across the "Calculators Hub", a set of layout-specific components are provided:

#### `CalculatorLayout`
A grid-based container responsive enough for both detailed inputs and complex result visualizations.

#### `CalculatorHeader`
A pre-styled header block that includes:
- A prominent icon.
- A bold title.
- A brief description.
- A "highlight" secondary description for extra context.

#### `ResultsAnalysis`
The standardized container for calculation outputs. It enforces:
- An italicized "Results Analysis" title (customizable).
- A slots-based `headerElements` section for badges or secondary info.
- Consistent padding and internal spacing for results cards and tables.
- **Accessibility**: Includes `aria-live="polite"` on the content wrapper to ensure screen readers announce dynamic result updates.

## Technologies
*   **TailwindCSS**: The utility-first CSS framework drives all styling.
*   **React**: Components are functional React components.
