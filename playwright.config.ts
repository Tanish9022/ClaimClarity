import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "./e2e", use: { baseURL: "http://127.0.0.1:3101" }, webServer: { command: "npm run dev -- --port 3101", url: "http://127.0.0.1:3101", reuseExistingServer: false, timeout: 120000 } });
