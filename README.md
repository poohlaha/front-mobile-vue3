# 手机端 Vue3 框架

1. 项目结构

```
├── __test__                                         // 单元测试目录
│── public                                           // 静态资源目录
│   ├── favicon.ico                                  // 网站图标
│   ├── ...                                          // logo、manifest.json等其他文件
│   └── index.html                                   // 入口页面
│── scripts                                          // 打包配置文件目录
├── src                                              // src目录
│   ├── assets                                       // 资源文件目录
│   │   ├── fonts                                    // 字体目录
│   │   ├── locales                                  // 国际化目录
│   │   ├── images                                   // 图片目录
│   │   └── styles                                   // 样式目录
│   │   │    ├── common                              // 公共样式目录, 如: reset.less、common.less等
│   │   │    ├── pages                               // 页面样式目录
│   │   │    └── skin                                // 皮肤目录
│   │── communal                                     // 项目框架目录
│   │   ├── app                                      // 存放 app.vue
│   │   ├── configs                                  // 项目配置目录
│   │   ├── request                                  // axios目录
│   │   └── utils                                    // 公共utils目录
│   │── route                                        // 路由文件存放目录
│   │── views                                        // 站点页面存放目录
│   │   ├── components                               // 自定义组件目录
│   │   ├── modules                                  // 自定义业务组件目录
│   │   ├── pages                                    // 页面目录
│   │   └── stores                                   // 数据存储目录
├── .babelrc                                         // babel配置文件
├── .commitlintrc.js                                 // commitlint配置文件
├── .editorconfig                                    // 编辑器格式配置文件
├── .env.*                                           // 环境配置文件
├── .eslintignore                                    // eslint ignore配置文件
├── .eslintrc.js                                     // eslint配置文件
├── .gitignore                                       // gitignore文件
├── .gitmessage                                      // git提交规范文件
├── .prettierignore.js                               // prettier ignore文件
├── .prettierrc.js                                   // prettier文件
├── postcss.config.js                                // postcss文件
├── package.json                                     // 项目依赖和常用脚本命令配置
├── vue.config.js                                    // vue配置文件
└── README.md                                        // 项目使用说明文件
```

2. 安装

- 设置镜像(`npm` 官方镜像)

  ```shell
  npm config set registry https://registry.npmjs.org
  ```

- 安装

  ```shell
  npm install # npm 安装
  yarn install # yarn 安装
  pnpm install # pnpm 安装
  ```

3. 运行

- 启动

  ```shell
  npm run start
  ```

- 打包

  - 测试环境: `npm run dev`
  - 仿真环境: `npm run simulate`
  - 生产环境: `npm run pord`

4. 其他命令

- 格式化代码

  ```shell
  npm run format
  ```

- 代码重复率检查

  ```shell
  npm run report
  ```

5. 项目别名
   请勿使用多级 `../` 这种格式, 请使用以下别名代替。

- @assets: src/assets
- @communal: src/communal
- @configs: src/communal/configs
- @route: src/route
- @views: src/views
- @components: src/views/components
- @modules: src/view/modules
- @utils: src/communal/utils
- @stores: src/view/stores
- @pages: src/views/pages

6. 代码提交
   请根据需求设计不同的代码提交主题, 具体请参考 `.gitmessage` 文件。

- build: 编译相关的修改，例如发布版本、对项目构建或者依赖的改动
- feat: 新特性、新功能
- fix: 修改 bug
- update: 修改某个功能
- docs: 文档修改
- style: 代码格式修改, 注意不是 css 修改
- refactor: 代码重构
- test: 测试用例修改
- chore: 其他修改, 比如改变构建流程、或者增加依赖库、工具等
- revert: 回滚到上一个版本
- review: 代码检查

* ps: 示例:

```text
  update(): #1458 添加直播列表功能
  1. 添加查询列表(分页)
  2. 添加搜索功能
  3. 添加列表详情
```

- `feat`, `fix`, `update` 需要添加 `#禅道ID号`, 其他的则不需要。
- 其他具体详见 `.gitmessage` 文件

7. 开发规范

- 样式

* 样式统一写到 `.less` 文件中, 请忽在 `.vue` 文件内添加样式。
* 请勿在 `style` 上添加样式。
* 所有页面样式以 `xxx-page` 开头, 以区别页面唯一。
* 页面中请使用 `rem`, 不允许使用 `px`。

- 代码

* 数据存储: 统一使用 `src/communal/utils/utils.ts` 中的方法。
* 发送请求: 发送请求 `统一方法` 已写到 `src/views/stores/api.ts` 中, 请直接调用。
* 公共组件: 请写到 `src/views/components` 目录下。
* 公共模块: 请写到 `src/views/modules` 目录下。
* html: 分段使用 `<!-- -->` 注明标签内容所代码的含义, 包括 `if` 判断。
* 方法: 请使用如下格式, 注明方法的含义及参数的含义

  ```javascript
  /**
     * 生成公共数据
     * @param param1 param1的含义
     * @param param2 param2的含义
     * @param param3 param3的含义
     ...
     */
  function xxx(param1, param2, param3) {}
  ```

- 页面: 当页面行数大于 `1000` 行时, 请拆分页面。
- 事件: 页面事件方法统一以 `on` 开头, 保存请使用 `onSave` 开头, 修改请使用 `onUpdate` 开头，删除请使用 `onDelete` 开头。
- 第三方 `npm` 包: 当第三方包过大时, 请通过在 `index.html` 中直接引入, `index.html` 中 `process.env.NODE_ENV` 表示获取环境, 可以动态引入不同环境的包。

- ps: 请勿到处拷贝代码, 如一块代码多块使用, 可以提取为公共的方法或公共模块或公共组件。

8. 文档
   pinia: https://pinia.vuejs.org/zh/introduction.html
   vant: https://vant-ui.github.io/vant/#/zh-CN
