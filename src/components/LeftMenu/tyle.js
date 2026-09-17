const listMenu = [
  {
    key: "/home",
    icon: "el-icon-data-line",
    title: "首页",
  },
  {
    key: "/data",
    icon: "el-icon-tickets",
    title: "数据处理",
    children: [
      {
        key: "/data/import",
        title: "数据导入",
      },
    ],
  },
  {
    key: "/system",
    icon: "el-icon-monitor",
    title: "系统配置",
    children: [
      {
        key: "/system/accountcontrol",
        title: "账号管理",
      },
    ],
  },
];
export { listMenu };
