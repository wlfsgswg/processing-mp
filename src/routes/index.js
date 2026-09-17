const routes = [
    {
        path: "/",
        redirect: '/home',
        component: () =>
            import("@/containers/Menu/index.vue"),
        children: [
            {
                path: "/home",
                component: () =>
                    import("@/containers/Menu/Home/index.vue")
            },
            // data
            {
                path: "/data/import",
                component: () =>
                    import("@/containers/Menu/Data/DataImport/index.vue"),
            },
            {
                path: "/data/table",
                component: () =>
                    import("@/containers/Menu/Data/DataTable/index.vue"),
            },
            // system
            {
                path: "/system/accountcontrol",
                component: () =>
                    import("@/containers/Menu/System/AccountControl/index.vue"),
            },
        ]
    },
    {
        path: "/login",
        component: () =>
            import("@/containers/Login/index.vue")
    },
    {
        path: "*",
        component: () =>
            import("@/containers/NotFound/index.vue")
    }
];
export { routes };