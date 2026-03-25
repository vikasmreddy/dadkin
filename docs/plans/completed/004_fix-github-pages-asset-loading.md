# 004: Fix GitHub Pages Asset Loading

**Status:** Completed
**Created:** 2026-03-25
**Project:** dadkin

---

## Initial Prompt
> One issue is the images don't seem to be working. Can you fix? It works when running locally so this isjust an issue on teh github pages.

## Background
The game is already deployed to GitHub Pages and runs locally, but at least one image asset does not load correctly on the hosted site. The current preload code loads `assets/dadkin.png` from a string path, while the app is built with Vite and deployed under a GitHub Pages subpath. This suggests the runtime asset URL needs to be made Pages-safe rather than relying on a plain relative string.

## Context
If the main image asset fails to load on GitHub Pages, the public version looks broken even though local development works. Fixing the asset URL handling will make the hosted game match local behavior.

## Approach
1. Reproduce or inspect the current built asset path behavior for the failing image.
2. Update the preload code so asset URLs are generated in a way that works both locally and on GitHub Pages.
3. Run a production build to verify the fix.
4. Commit and push the fix so GitHub Pages redeploys.

## Files Changed
Expected scope:
- `docs/plans/completed/004_fix-github-pages-asset-loading.md`
- `src/scenes/PreloadScene.ts`

## Discussion Log
- **User:** One issue is the images don't seem to be working. Can you fix? It works when running locally so this isjust an issue on teh github pages.
- **Claude:** Inspected the current asset loading path and found the preload scene uses a plain string path for `assets/dadkin.png`, which is a likely mismatch for GitHub Pages hosting under a repo subpath.
- **Decision:** Fix the asset URL generation in preload code so it works reliably on both local dev and GitHub Pages.
- **Claude:** Updated preload asset loading to build the image URL from Vite's `BASE_URL`, then ran a production build to verify the GitHub Pages-safe path.
- **Decision:** Use the Vite base URL for this image asset so local development and GitHub Pages use the right path automatically.

## Progress
- 2026-03-25: Updated `PreloadScene` to load `dadkin.png` from `import.meta.env.BASE_URL` and confirmed the production build still succeeds.
- 2026-03-25: Confirmed the build copies `public/assets/dadkin.png` into `dist/assets/`, so the likely issue is runtime URL resolution rather than a missing file in the build output.
