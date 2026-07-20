const listMenu = [{
    key: "/home",
    icon: 'el-icon-data-line',
    title: "首页",
},
{
    key: "/guess",
    icon: 'el-icon-tickets',
    title: "猜猜配置",
    children: [
        {
            key: "/guess/questioncontrol",
            title: "问题管理",
        },
        {
            key: "/guess/globalconfig",
            title: "全局配置",
        }
    ]
},
{
    key: "/system",
    icon: 'el-icon-monitor',
    title: "系统配置",
    children: [{
        key: "/system/accountcontrol",
        title: "账号管理",
    }]
},
];
export { listMenu };