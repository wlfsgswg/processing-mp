import http from "./service";

// 组件内请求例子： this.$API.getDemo(params).then(res => {})
// 如果需要mock的话，可以使用使用 dev:mock 启动项目，并在main-index-web/src/mock/resData.js 中进行mock数据维护
// ps: 开发时，也可以在api.js末尾直接写mock代码，记得删除

const requestAddressList = [
  {
    describe: "创建数据库表",
    method: "createTable",
    url: "/api/create/table",
    type: "post",
  },
  {
    describe: "导入数据",
    method: "importData",
    url: "/api/import/data",
    type: "post",
  },
  {
    describe: "查询数据",
    method: "queryTableData",
    url: "/api/query/tableData",
    type: "post",
  },
  {
    describe: "查询下拉框选项",
    method: "queryDistinctField",
    url: "/api/query/distinctField",
    type: "post",
  },
];

const API = {};

requestAddressList.forEach((item) => {
  if (API[item.method]) console.log(`存在相同方法：${item.method}`);

  // requestOptions => { requestHeaders: {}, loading: {}, ... }
  API[item.method] = (requestParams, requestOptions) =>
    http[item.type](item.url, requestParams, requestOptions);
});

// mock例子
// API.getDemo = Promise.resolve({
//   errCode: 0,
//   data: {},
// })

export default API;
