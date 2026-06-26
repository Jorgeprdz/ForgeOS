# Forge Mobile Daily GUI

This directory contains the static, mobile-first frontend for the Forge Alpha semantic extraction interface.

## Deployment to GitHub Pages

To deploy this interface to GitHub Pages:

1.  **Push** your changes to the `main` branch of your repository.
2.  Go to your repository **Settings** on GitHub.
3.  Click on **Pages** in the left sidebar.
4.  Under **Build and deployment** > **Source**, ensure it is set to **Deploy from a branch**.
5.  Under **Branch**, select `main` and change the folder from `/(root)` to `/docs`.
6.  Click **Save**.

After a few minutes, the site will be live at:
`https://<your-username>.github.io/<your-repo-name>/`

The GUI will automatically be accessible at that URL, or specifically at:
`https://<your-username>.github.io/<your-repo-name>/10-gui/mobile-daily/index.html`

## Configuration

This folder is a demo/local diagnostic surface. Do not hardcode real Supabase keys here. For browser usage, configure window.__FORGE_MOBILE_DAILY_CONFIG__. For Termux diagnostics, export SUPABASE_URL and SUPABASE_ANON_KEY only in the local shell session. Never commit real keys.

> [!WARNING]
> Do **not** expose or commit the `GEMINI_API_KEY` in any frontend files.
