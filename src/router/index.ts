import {
    createRouter,
    createWebHashHistory,
} from "vue-router";

const router = createRouter({
    // history: createWebHistory(process.env.BASE_URL),
    // history: createWebHistory(import.meta.env.BASE_URL),
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: "/dict/dict",
        },
        {
            path: "/dict",
            name: "dict",
            component: () => import("@/views/dictMain.vue"),
            // Nested sub-routes (share the layout's title/status bar)
            children: [
                {
                    path: "", // Empty path = default child route
                    name: "dictDefault",
                    component: () => import("@/views/dictDict.vue"),
                },
                // Sub-route 1: /dict/dict (original /dict page)
                {
                    path: "dict",
                    name: "dictDict",
                    component: () => import("@/views/dictDict.vue"),
                },
                // Sub-route 2: /dict/about (original /about page, now nested)
                {
                    path: "about",
                    name: "dictAbout",
                    component: () => import("@/views/dictAbout.vue"),
                },
            ],
        },
        {
            path: "/about",
            name: "about",
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("@/views/dictAbout.vue"),
        },
        {
            path: "/recite",
            name: "recite words",
            component: () => import("@/views/reciteMain.vue"),
        },
    ],
});

export default router;
