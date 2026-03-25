# 004: Fix GitHub Pages Asset Loading

**Status:** Completed
**Created:** 2026-03-25
**Project:** dadkin

---

## Initial Prompt
> One issue is the images don't seem to be working. Can you fix? It works when running locally so this isjust an issue on teh github pages.

## Background
The game is already deployed to GitHub Pages and runs locally, but at least one image asset does not load correctly on the hosted site. The current preload code now uses a Pages-safe URL, but the hosted PNG is still failing. Further inspection showed GitHub Pages is serving a Git LFS pointer file for `dadkin.png` instead of the actual image because the deployment workflow checks out the repository without LFS assets.

## Context
If the main image asset fails to load on GitHub Pages, the public version looks broken even though local development works. Fixing the deployment workflow so it includes real asset files will make the hosted game match local behavior.

## Approach
1. Reproduce or inspect the current built asset path behavior for the failing image.
2. Confirm whether the deployed file is a real PNG or a Git LFS pointer.
3. Update the GitHub Pages workflow so build jobs fetch LFS assets.
4. Commit and push the fix so GitHub Pages redeploys with the real image files.

## Files Changed
Expected scope:
- `docs/plans/completed/004_fix-github-pages-asset-loading.md`
- `.github/workflows/deploy-pages.yml`
- `src/scenes/PreloadScene.ts`

## Discussion Log
- **User:** One issue is the images don't seem to be working. Can you fix? It works when running locally so this isjust an issue on teh github pages.
- **Claude:** Inspected the current asset loading path and found the preload scene uses a plain string path for `assets/dadkin.png`, which is a likely mismatch for GitHub Pages hosting under a repo subpath.
- **Decision:** Fix the asset URL generation in preload code so it works reliably on both local dev and GitHub Pages.
- **Claude:** Updated preload asset loading to build the image URL from Vite's `BASE_URL`, then ran a production build to verify the GitHub Pages-safe path.
- **Decision:** Use the Vite base URL for this image asset so local development and GitHub Pages use the right path automatically.
- **User:** getting thjis still: main.ts:5 Phaser v3.90.0 (WebGL | Web Audio) https://phaser.io/v390 ...
- **Claude:** Checked the deployed asset directly and confirmed GitHub Pages is returning a Git LFS pointer text file at `assets/dadkin.png`, while the local file is a real 500x500 PNG.
- **Decision:** Fix the deployment workflow by enabling LFS checkout so GitHub Pages builds with the real image asset.

## Progress
- 2026-03-25: Enabled LFS checkout in the GitHub Pages workflow, redeployed the site, and verified the hosted `dadkin.png` is now served as a real PNG instead of a Git LFS pointer.
- 2026-03-25: Confirmed the deployed `dadkin.png` URL returns Git LFS pointer text on GitHub Pages, which explains why Phaser fails to process it as an image.
- 2026-03-25: Updated `PreloadScene` to load `dadkin.png` from `import.meta.env.BASE_URL` and confirmed the production build still succeeds.
- 2026-03-25: Confirmed the build copies `public/assets/dadkin.png` into `dist/assets/`, so the likely issue is runtime URL resolution rather than a missing file in the build output.
