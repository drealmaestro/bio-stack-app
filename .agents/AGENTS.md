# Rules for Antigravity

* **Post-Approval Action**: After the user agrees to any code changes, always ask the user if they want the updates pushed/deployed to their phone (e.g. Git commit/push & Vercel deployment) before executing it.

* **Mobile PWA Viewport Containment**: When styling mobile-first screen layouts with absolute/fixed top/bottom navigation panels, always ensure the main outer container is locked with `h-[100dvh] max-h-[100dvh] overflow-hidden` to prevent body scrolling. Handle scroll behavior exclusively inside the content container using `overflow-y-auto`.

* **Tailwind v4 Custom Utility Syntax**: When defining custom utilities in PostCSS/Tailwind v4 (via `@utility`), never append pseudo-classes directly to the utility name (e.g. `@utility card:hover`). Always nest them inside the declaration block using standard nesting (e.g., `&:hover { ... }`, `&:active { ... }`) to prevent compiler crashes.

* **Manual Vercel CLI Deployment**: If Vercel credentials are expired or missing, execute `npx vercel login` to display the device authorization URL (`https://vercel.com/oauth/device?user_code=...`) for the user to confirm in their browser, then execute `npm run deploy`.
