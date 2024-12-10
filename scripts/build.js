const { WebpackCompiler } = require('@bale-tools/mutate-service')
const MutateVersion = require('@bale-tools/mutate-version')
const path = require('path')
const webpack = require('webpack')
const { VantResolver } = require('@vant/auto-import-resolver');
const AutoImport = require('unplugin-auto-import/webpack');
const ComponentsPlugin = require('unplugin-vue-components/webpack');

const resolve = dir => path.join(__dirname, '../', dir)
const command = process.argv || []
const cmds = command.filter(x => !x.startsWith('--')) || []
const scripts = ['start', 'build', 'simulate', 'prod']

// script
function getScript(cmds = []) {
  if (cmds.length === 0) return scripts[1] // default dev
  if (cmds.includes(scripts[0])) return scripts[0]
  if (cmds.includes(scripts[1])) return scripts[1]
  if (cmds.includes(scripts[2])) return scripts[2]
  if (cmds.includes(scripts[3])) return scripts[3]
  return scripts[1]
}

// 获取 webpack 插件
function getWebpackPlugins() {
  const plugins = []

  // 添加全局 http
  plugins.push(
      new webpack.ProvidePlugin({
        $http: [resolve('src/communal/request/index.js'), 'default']
      })
  )

 plugins.push(
   AutoImport.default({
     resolvers: [VantResolver()],
   })
 )

  // 添加 vant4
  plugins.push(ComponentsPlugin.default({
    resolvers: [VantResolver()]
  }))

  return plugins
}

function copyFiles() {
  new MutateVersion({language: 'vue', babelImportPluginName: ''}).copy()
}

function compiler() {
  WebpackCompiler({
    script: getScript(cmds),
    opts: {
      entry: './src/communal/app/index.ts',
      plugins: getWebpackPlugins(),
      externals: {},
      alias: {
        'vant/es': 'vant/lib',
      },
      loaders: [],
      settings: {
        usePurgecssPlugin: false,
        usePwaPlugin: false,
        useMinimize: false,
        experiments: false,
        generateReport: false,
        compress: {
          enable: false,
          deleteOutput: true,
          suffix: '.zip'
        }
      },
    },
    done: () => {
      console.log('All Done.')
    }
  })
}

function run() {
  // copyFiles()
  compiler()
}

run()

