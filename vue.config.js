//vue.config.js
module.exports = {
    // 部署应用时的基本 URL
    publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
    // build时构建文件的目录 构建时传入 --no-clean 可关闭该行为
    outputDir: "dist",
    // build时放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
    assetsDir: "",
    // 指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径。
    indexPath: "index.html",
    // 默认在生成的静态资源文件名中包含hash以控制缓存
    filenameHashing: true,
    // 构建多页面应用，页面的配置
    pages: {
        index: {
            // page 的入口
            entry: "src/main.js",
            // 模板来源
            template: "public/index.html",
            // 在 dist/index.html 的输出
            filename: "index.html",
            // 当使用 title 选项时，template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            // title: "Index Page",
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            // chunks: ["chunk-vendors", "chunk-common", "index"],
        },
        // 当使用只有入口的字符串格式时，模板会被推导为 `public/subpage.html`，并且如果找不到的话，就回退到 `public/index.html`。
        // 输出文件名会被推导为 `subpage.html`。
        subpage: "src/main.js",
    },
    // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码 (在生产构建时禁用 eslint-loader)
    lintOnSave: process.env.NODE_ENV !== "production",
    // 是否使用包含运行时编译器的 Vue 构建版本
    runtimeCompiler: false,
    // Babel 显式转译列表
    transpileDependencies: [],
    // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建
    productionSourceMap: true,
    // 设置生成的 HTML 中 <link rel="stylesheet"> 和 <script> 标签的 crossorigin 属性（注：仅影响构建时注入的标签）

    crossorigin: "",
    // 在生成的 HTML 中的 <link rel="stylesheet"> 和 <script> 标签上启用 Subresource Integrity (SRI)
    integrity: false,
    // 如果这个值是一个对象，则会通过 webpack-merge 合并到最终的配置中
    // 如果你需要基于环境有条件地配置行为，或者想要直接修改配置，那就换成一个函数 (该函数会在环境变量被设置之后懒执行)。该方法的第一个参数会收到已经解析好的配置。在函数内，你可以直接修改配置，或者返回一个将会被合并的对象
    configureWebpack: {},
    // 对内部的 webpack 配置（比如修改、增加Loader选项）(链式操作)
    // chainWebpack: (config) => {
    //     config.module
    //         .rule("images")
    //         .use("url-loader")
    //         .loader("url-loader")
    //         .tap((options) => {
    //             Object.assign(options, { limit: 10240 }); //10240 是修改的图片大小
    //         });
    // },

    devServer: {
        // open: false,
        disableHostCheck: true,
        host: "0.0.0.0",
        port: 8082,
        https: false,
        hotOnly: false,
        // before: (app) => {},
        // 跨域--代理
        proxy: {
            "/api": {
                target: "http://27.150.173.9:9002/", // 域名
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    "^/api": "/", //http://192.168.1.65:8886/api => http://192.168.1.65:8886/
                },
            },
            "/newApi": {
                target: "http://27.150.173.9:9696/", //域名
                changeOrigin: true,
                pathRewrite: {
                    "^/newApi": "", //http://192.168.1.65:8886/api => http://192.168.1.65:8886/
                },
            },
            "ftp/": {
                target: "http://119.3.66.94:8090/", //域名
                changeOrigin: true,
                pathRewrite: {
                    "^/newApi": "", //http://192.168.1.65:8886/api => http://192.168.1.65:8886/
                },
            },
        },
        // proxy: null,
    },
    //把px换成rem
    // css: {
    //     loaderOptions: {
    //         postcss: {
    //             plugins: [
    //                 require("postcss-plugin-px2rem")({
    //                     rootValue: 55, //换算基数， 默认100  ，这样的话把根标签的字体规定为1rem为50px,这样就可以从设计稿上量出多少个px直接在代码中写多上px了。
    //                     // unitPrecision: 5, //允许REM单位增长到的十进制数字。
    //                     propWhiteList: [], //默认值是一个空数组，这意味着禁用白名单并启用所有属性。
    //                     propBlackList: [], //黑名单
    //                     exclude: /(node_module)/, //默认false，可以（reg）利用正则表达式排除某些文件夹的方法，例如/(node_module)\/如果想把前端UI框架内的px也转换成rem，请把此属性设为默认值
    //                     selectorBlackList: [], //要忽略并保留为px的选择器
    //                     ignoreIdentifier: false, //（boolean/string）忽略单个属性的方法，启用ignoreidentifier后，replace将自动设置为true。
    //                     replace: true, // （布尔值）替换包含REM的规则，而不是添加回退。
    //                     mediaQuery: false, //（布尔值）允许在媒体查询中转换px。
    //                     minPixelValue: 0, //设置要替换的最小像素值(3px会被转rem)。 默认 0
    //                 }),
    //             ],
    //         },
    //     },
    // },

    // // 是否为 Babel 或 TypeScript 使用 thread-loader
    parallel: require("os").cpus().length > 1,
    // 向 PWA 插件传递选项
    pwa: {},
    // 可以用来传递任何第三方插件选项
    pluginOptions: {},
};
