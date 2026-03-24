import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function getGithubPagesBase(): string {
  if (process.env.GITHUB_PAGES !== "true") return "/";

  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
  if (!repo) return "/";

  return `/${repo}/`;
}

export default defineConfig({
  base: getGithubPagesBase(),
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
});
