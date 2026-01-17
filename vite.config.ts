import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import path from "path";
import { fileURLToPath, URL } from "node:url";

// 正确的 Vite 配置（TS 类型兼容）
export default defineConfig({
    // 🔥 核心修正：base 移到根级别（全局配置）
    base: "./", // 相对公共路径，适配 HTTP 服务器加载
    plugins: [vue()],
    // 开发环境配置（可选，保留）
    server: {
        // host: true, // 0.0.0.0
        host: "localhost",
        port: 5173,
        strictPort: false,
        open: true, // 可选：启动dev服务时自动打开浏览器
        // 核心：配置跨域代理
        proxy: {
            // 匹配以/api开头的请求（可自定义前缀）
            "/api": {
                target: "http://127.0.0.1:5000", // 后端接口基础地址
                changeOrigin: true, // 开启跨域代理（关键）
                rewrite: (path) => {
                    // 第一步：打印rewrite前后的路径（前端请求路径）
                    console.log("代理前的路径：", path); // 会在前端终端打印 /api/dicts/-1/able
                    const newPath = path.replace(/^\/api/, ""); // 去掉/api前缀（适配后端接口）
                    console.log("代理后的路径：", newPath); // 会打印 /dicts/-1/able
                    return newPath;
                },
                // 第二步：配置代理事件，打印完整转发URL
                configure: (proxy, options) => {
                    // 监听代理请求发送前的事件
                    proxy.on("proxyReq", (proxyReq, req, res) => {
                        // 拼接完整的转发URL：target + 重写后的路径
                        const target = options.target as string; // 后端基础地址（http://127.0.0.1:5000）
                        const path = proxyReq.path; // 重写后的路径（如/dicts/、/dicts/-1/able）
                        const fullForwardUrl = `${target}${path}`;

                        // 打印核心信息：前端请求URL → 代理转发URL
                        console.log(
                            "\n==================== 代理转发日志 ===================="
                        );
                        console.log(
                            `前端请求URL：http://localhost:5173${req.url}`
                        );
                        console.log(`代理转发URL：${fullForwardUrl}`);
                        console.log(
                            "=====================================================\n"
                        );
                    });

                    // 可选：监听代理响应事件，打印后端返回状态
                    proxy.on("proxyRes", (proxyRes, req, res) => {
                        // 若请求是音频文件，强制设置正确的Content-Type（兜底）
                        if (req.url?.includes(".mp3")) {
                            proxyRes.headers["Content-Type"] = "audio/mpeg";
                        }
                        console.log(
                            `[代理响应] 后端状态码：${proxyRes.statusCode}`
                        );
                    });
                },
            },
        },
    },
    // 生产环境打包配置
    build: {
        outDir: "../dist", // 打包输出到项目根目录的 dist
        assetsDir: "assets", // 静态资源目录
        target: "ESNext", // 兼容目标
        emptyOutDir: true, // 打包前清空 outDir
    },
    // 路径别名配置
    resolve: {
        alias: {
            // "@": path.resolve(__dirname, "./src"),
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
