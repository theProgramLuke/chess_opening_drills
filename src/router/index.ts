import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Welcome",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Welcome.vue")
  },
  {
    path: "/edit",
    name: "Edit",
    component: () => import(/* webpackChunkName: "about" */ "../views/Edit.vue")
  },
  {
    path: "/train",
    name: "Train",

    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Train.vue")
  },
  {
    path: "/statistics",
    name: "Statistics",

    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Statistics.vue")
  },
  {
    path: "/settings",
    name: "Settings",

    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Settings.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
