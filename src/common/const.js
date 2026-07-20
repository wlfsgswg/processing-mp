const fromValueGetName = (value, list) => {
  let name = "--";
  list.map((it) => {
    if (it.value === value) name = it.name;
  });
  return name;
};
// 快捷时间选项
const pickerOptions = {
  shortcuts: [
    {
      text: "最近一周",
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        picker.$emit("pick", [start, end]);
      },
    },
    {
      text: "最近一个月",
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
        picker.$emit("pick", [start, end]);
      },
    },
    {
      text: "最近三个月",
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
        picker.$emit("pick", [start, end]);
      },
    },
  ],
};

// 等级
const grades = [
  // {
  //     name: '超级管理员',
  //     value: 1
  // },
  {
    name: "管理员",
    value: 2,
  },
  {
    name: "普通用户",
    value: 3,
  },
];

// 账户
const accountList = [
  {
    account: "Admin",
    password: "111111@w",
  },
  {
    account: "Admin2",
    password: "111111@w",
  },
  {
    account: "superAdmin",
    password: "jf@666666",
  },
];


export {
  grades,
  pickerOptions,
  fromValueGetName,
  accountList,
};
