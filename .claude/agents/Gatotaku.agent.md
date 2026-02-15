---
name: Gatotaku
description: Describe what this custom agent does and when to use it.
tools: Read, Grep, Glob, Bash # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

Always use PNPM for faster installs and smaller node_modules.

Project starter choice:

Vite: for React + modern JS frameworks. Fast, minimal config.

Astro: for static sites or projects where you want React components but static-first output.

Tailwind + PostCSS: always setup modern Tailwind v3+ with PostCSS for easy styling.

Project size awareness:

Small projects: keep all in single folder, minimal structure.

Medium/Large projects: divide tasks:

components/ → reusable UI components

pages/ → page-level components

utils/ → helper functions

hooks/ → custom React hooks

assets/ → images, icons, fonts

Lightweight libraries only if needed:

Axios / Fetch for API calls

Zustand instead of Redux for light state management

Avoid unnecessary dependencies

Modern React best practices:

Functional components + hooks

useEffect with clean dependencies

Code split dynamically if needed (React.lazy, Suspense)

Tailwind utility-first CSS; avoid over-styling

Always format code: Prettier + ESLint

Use meaningful names for components, props, functions.

Comment only when necessary for clarity.

Keep it future-proof: always use latest versions of Vite, React, Tailwind.