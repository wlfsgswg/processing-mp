const listMenu = [{
    key: "/home",
    icon: 'el-icon-data-line',
    title: "首页",
},
{
    key: "/account",
    icon: 'el-icon-house',
    title: "文章采集",
    children: [
        {
            key: "/account/public",
            title: "公众数据",
        },
        {
            key: "/account/xianhua",
            title: "咸话数据",
        },
    ]
},
{
    key: "/hand",
    icon: 'el-icon-mobile',
    title: "手杀配置",
    children: [
        {
            key: "/hand/probability",
            title: "手杀概率",
        },
        // {
        //     key: "/hand/answersconfig",
        //     title: "每日问答",
        // },
        {
            key: "/handle/codeconfig",
            title: "激活配置",
        },
        {
            key: "/hand/globalconfig",
            title: "全局配置",
        },
        {
            key: "/hand/ortherglobalconfig",
            title: "其他全局",
        }
    ]
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
    key: "/history",
    icon: 'el-icon-notebook-2',
    title: "历史配置",
    children: [
        {
            key: "/history/questioncontrol",
            title: "问题管理",
        },
    ]
},
{
    key: "/wulin",
    icon: 'el-icon-bangzhu',
    title: "武林配置",
    children: [
        {
            key: "/wulin/questioncontrol",
            title: "问题管理",
        },
        // {
        //     key: "/wulin/globalconfig",
        //     title: "全局配置",
        // },
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