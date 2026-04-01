# Design System

Kradle is designed from rules downward.

The order is:
- design system
- elements
- components
- pages
- flows

Apple HIG is not a separate layer beside this system. It is a product philosophy that shapes the rules at the top, then those rules guide every layer below.

## 1. Design System

The design system is the rule layer.

It defines:
- color
- type
- spacing
- radius
- shadow
- motion
- density
- state behavior
- semantic tone
- interaction language

This is where Kradle decides what “calm”, “premium”, “inevitable”, and “teacher-first” actually mean in interface form.

### Kradle Rule Summary
- Fewer visible controls.
- One hero per page.
- One primary action per surface.
- Mood is tonal, not loud.
- Hierarchy comes from spacing before decoration.
- Dense work should feel editorial, not busy.
- Motion should be restrained and consistent.
- Output artifacts should feel as designed as the app.

## 2. Elements

Elements are the smallest building blocks.

Examples:
- icons
- labels
- buttons
- chips
- badges
- avatars
- inputs
- dividers
- rows

Questions to ask:
- Is it visually balanced?
- Does it match the system tokens?
- Is it quiet enough for its importance?
- Is its active, hover, and pressed state consistent?

## 3. Components

Components are composed units with one clear job.

Examples:
- blade row
- focus surface
- top bar
- metric card
- table row
- sign-out row
- report summary rail

Questions to ask:
- Does it solve one interaction clearly?
- Is it over-explaining?
- Is there any extra chrome that can disappear?
- Does it use hierarchy correctly inside itself?

## 4. Pages

Pages arrange components into one clear screen.

Examples:
- dashboard
- students
- reports
- settings
- profile
- exports

Questions to ask:
- Is there one hero?
- Is there one primary action?
- Can any visible control disappear?
- Does the page read clearly when zoomed out?
- Is the page calmer after simplification?

## 5. Flows

Flows connect pages and components into a complete experience.

Examples:
- sign in -> onboarding -> workspace
- scan -> review -> entry -> preview -> export
- profile -> avatar -> password
- archive -> restore -> delete

Questions to ask:
- Does each step feel inevitable?
- Is the next action obvious without extra instruction?
- Does motion feel like one family?
- Are we making the user decide too often?

## Apple HIG Translation For Kradle

If a screen feels wrong, use this order of correction:

1. Remove visible choices before adding new styling.
2. Strengthen spacing before adding emphasis.
3. Use tonal material before borders.
4. Use one clear action before adding secondary CTAs.
5. Prefer progressive disclosure over open-form clutter.
6. Let pages feel edited, not merely filled.

## Review Order

When auditing any UI surface, review it in this order:

1. Rules
2. Elements
3. Components
4. Page
5. Flow

If something feels off at the page level, the cause is often lower:
- inconsistent elements
- noisy components
- weak system rules

## Current UI Corrections To Keep Making

- Move shared account actions into account/shared namespaces, not auth namespaces.
- Replace explanatory UI copy with direct product language.
- Keep blades and focus surfaces as the default utility pattern.
- Use disclosure carets for expandable sections and blade groups.
- Do not use `+` or `-` as the primary expand/collapse affordance when a caret communicates state more naturally.
- Reduce nested cards when one flatter surface can do the job.
- Keep semantic mood blended into the app material, never outlined like alerts.
- Treat the PDF/report card as a flagship product surface, not a utility export.
