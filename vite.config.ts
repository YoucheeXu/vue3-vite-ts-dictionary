import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import path from "path";
import { fileURLToPath, URL } from "node:url";
import { getValidatedAppConfig } from "./src/config/nodeConfigUtils";

// Get validated Server config (from shared config utility)
const appConfig = getValidatedAppConfig();
const serverConfig = appConfig.Server;

export default defineConfig({
    base: "./", // Relative public path to adapt to HTTP server loading
    plugins: [vue()],
    // Development environment configuration (optional, kept for compatibility)
    server: {
        // host: true, // Bind to 0.0.0.0 (listen on all network interfaces)
        host: "localhost",
        port: 5173,
        strictPort: false,
        open: true, // Optional: Auto-open browser when dev server starts
        // Core: Configure cross-origin proxy
        proxy: {
            // Match requests starting with "/api" (customizable prefix)
            "/api": {
                target: serverConfig.proxyUrl, // Backend API base URL
                changeOrigin: true, // Enable cross-origin proxy (critical for CORS)
                rewrite: (path) => {
                    // Step 1: Log path before/after rewrite (frontend request path)
                    console.log("Path before proxy rewrite: ", path); // Logs example: /api/dicts/-1/able in frontend terminal
                    const newPath = path.replace(/^\/api/, ""); // Remove "/api" prefix to match backend API structure
                    console.log("Path after proxy rewrite: ", newPath); // Logs example: /dicts/-1/able
                    return newPath;
                },
                // Step 2: Configure proxy events to log full forwarded URL
                configure: (proxy, options) => {
                    // Listen to event before proxy request is sent
                    proxy.on("proxyReq", (proxyReq, req, res) => {
                        // Assemble full forwarded URL: target + rewritten path
                        const target = options.target as string; // Backend base URL (e.g., http://127.0.0.1:5000)
                        const path = proxyReq.path; // Rewritten path (e.g., /dicts/, /dicts/-1/able)
                        const fullForwardUrl = `${target}${path}`;

                        // Log core info: Frontend request URL → Proxy forwarded URL
                        console.log(
                            "\n==================== Proxy Forward Log ===================="
                        );
                        console.log(
                            `Frontend Request URL: http://localhost:5173${req.url}`
                        );
                        console.log(`Proxy Forwarded URL: ${fullForwardUrl}`);
                        console.log(
                            "=====================================================\n"
                        );
                    });

                    // Optional: Listen to proxy response event to log backend status code
                    proxy.on("proxyRes", (proxyRes, req, res) => {
                        // Force set correct Content-Type for audio files (fallback fix)
                        if (req.url?.includes(".mp3")) {
                            proxyRes.headers["Content-Type"] = "audio/mpeg";
                        }
                        console.log(
                            `[Proxy Response] Backend Status Code: ${proxyRes.statusCode}`
                        );
                    });
                },
            },
        },
    },
    // Production build configuration
    build: {
        outDir: "../dist", // Build output to "dist" folder in project root directory
        assetsDir: "assets", // Static assets directory
        target: "ESNext", // Compatibility target (JavaScript version)
        emptyOutDir: true, // Clear output directory before building
    },
    // Path alias configuration
    resolve: {
        alias: {
            // "@": path.resolve(__dirname, "./src"),
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
