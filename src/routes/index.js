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
            // guess
            {
                path: "/guess/questioncontrol",
                component: () =>
                    import("@/containers/Menu/Guess/QuestionControl/index.vue"),
            },
            {
                path: "/guess/globalconfig",
                component: () =>
                    import("@/containers/Menu/Guess/GlobalConfig/index.vue"),
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