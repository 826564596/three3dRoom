import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Index",
        component: () => import("../views/Index.vue"),
    },

    {
        path: "/home",
        name: "About",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import("../views/Home.vue"),
    },
    {
        path: "/mu",
        name: "mu",
        component: () => import("../views/museum.vue"),
    },
    {
        path: "/VR",
        name: "mu",
        component: () => import("../views/testVR.vue"),
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
});

export default router;
