module.exports = {
  outputDir: "processing-dist", // 自定义的dist文件夹名
  publicPath: "/mp_processing/",
  filenameHashing: true, // 启用文件名哈希
  indexPath: "index.html",
  productionSourceMap: false,
  devServer: {
    proxy: {
      "/api": {
        // target: "http://localhost:3000/",
        target: "https://qifumoni.com/",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  // 此处可以修改antd主题颜色
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          "primary-color": "#1DA57A",
          "link-color": "#1DA57A",
          "border-radius-base": "2px",
        },
        javascriptEnabled: true,
      },
    },
  },
  chainWebpack(config) {
    // 匹配xlsx等二进制文件，交给file-loader处理
    config.module
      .rule("excel")
      .test(/\.(xlsx|xls)$/)
      .use("file-loader")
      .loader("file-loader")
      .options({
        name: "static/[name].[hash:8].[ext]",
      });
  },
};
