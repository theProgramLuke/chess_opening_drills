import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/welcome",
    name: "Welcome",
    component: () => import("../views/Welcome.vue"),
  },
  {
    path: "/edit",
    name: "Edit",
    component: () => import("../views/Edit.vue"),
  },
  {
    path: "/train",
    name: "Train",

    component: () => import("../views/Train.vue"),
  },
  {
    path: "/schedule",
    name: "Schedule",

    component: () => import("../views/Schedule.vue"),
  },
  {
    path: "/reports",
    name: "Reports",

    component: () => import("../views/Reports.vue"),
  },
  {
    path: "/health",
    name: "Repertoire Health",

    component: () => import("../views/RepertoireHealth.vue"),
  },
  {
    path: "/settings",
    name: "Settings",

    component: () => import("../views/Settings.vue"),
  },
  {
    path: "*",
    redirect: "/welcome",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
