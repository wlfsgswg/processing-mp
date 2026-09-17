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
    user: "那就这样吧",
    time: "2026-07-01 12:00:00",
  },
  {
    account: "Admin2",
    password: "111111@w",
    user: "佚名",
    time: "2026-07-01 00:00:00",
  },
  {
    account: "superAdmin",
    password: "jf@666666",
    user: "江枫",
    time: "2026-07-01 01:00:00",
  },
  {
    account: "test",
    password: "abcdefg@w",
    user: "你管我是谁",
    time: "2026-07-01 12:00:00",
  },
  {
    account: "ceshi",
    password: "12345678@w",
    user: "且慢",
    time: "2026-07-01 00:00:00",
  },
  {
    account: "Lalala",
    password: "jf@123456",
    user: "哈哈哈、天命！",
    time: "2026-07-01 01:00:00",
  },
];

// 默认显示表头
const headerBasicCell = [
  "序号",
  "线索来源",
  "受理日期",
  "主要被反映人姓名",
  // "主要被反映人单位及职务",
  // "主要被反映人职级",
  "主要问题摘要",
  // "归属全国性重点整治项目情况",
  // "归属全国性重大民生实事情况",
  // "归属省级重点整治项目情况",
  // "初次处置方式",
  "初次处置日期",
  "是否立案",
  "立案日期",
  "立案人数",
  // "是否采取留置措施",
  // "留置日期",
  // "留置人数",
  // "反映问题是否属实",
  // "是否查结",
  // "备注",
  "承办单位",
  "办结日期",
  "办理结果100字以内简要填写处理处分情况",
];
const headerBasicCellScope = [
  "受理日期",
  "初次处置日期",
  "立案日期",
  "办结日期",
];
export {
  grades,
  pickerOptions,
  fromValueGetName,
  accountList,
  headerBasicCell,
  headerBasicCellScope,
};
