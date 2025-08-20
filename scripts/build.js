/**
 * @fileOverview frontend 项目打包
 * @date 2023-04-12
 * @author poohlaha
 */
const webpack = require('webpack')
const { Paths, Utils } = require('@bale-tools/utils')
const { WebpackCompiler, WebpackDllCompiler } = require('@bale-tools/mutate-service')
const chalk = require('chalk')
const fsExtra = require('fs-extra')
const { performance } = require('node:perf_hooks')
const path = require('node:path')
const { VueLoaderPlugin } = require('vue-loader')
const UselessFile = require('useless-files-webpack5-plugin')

const LoggerPrefix = chalk.cyan('[Bale Chat Compiler]:')

class ProjectBuilder {
  _SCRIPTS = ['start', 'dev', 'simulate', 'prod'] // scripts
  _script = ''
  _appRootDir = ''
  _dllDir = ''
  _copyDir = ''
  _projectUrl = ''
  _args = []
  _copyDestDir = ''

  constructor() {
    this._args = process.argv.slice(2) || []
    this._script = this._getScript()
    this._projectUrl = this._getProjectUrl()
    this._copyDestDir = 'mobile'
    this._appRootDir = Paths.getAppRootDir() || ''
    this._dllDir = path.join(this._appRootDir, '.vendor')
    this._copyDir = path.resolve(this._appRootDir, 'node_modules', '@bale-sprint/react')
  }

  _getProjectUrl() {
    const commands = this._args.filter(x => x.startsWith('--projectUrl=')) || []
    if (commands.length === 0) return ''
    const command = commands[0] || ''
    return command.replace('--projectUrl=', '')
  }

  _getScript() {
    const commands = this._args.filter(x => !x.startsWith('--')) || []
    if (commands.includes(this._SCRIPTS[0])) {
      return this._SCRIPTS[0]
    }

    if (commands.includes(this._SCRIPTS[2])) {
      return this._SCRIPTS[2]
    }

    if (commands.includes(this._SCRIPTS[3])) {
      return this._SCRIPTS[3]
    }

    return this._SCRIPTS[1]
  }

  // 获取 webpack 插件
  _getWebpackPlugins() {
    const plugins = []

    // 添加全局 http
    plugins.push(
      new webpack.ProvidePlugin({
        $http: [path.resolve('src/communal/request/index.ts'), 'default']
      })
    )

    plugins.push(
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true), // 是否启用选项式 API
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false), // 生产环境是否启用 devtools
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false) // 生产环境是否启用不匹配详情
      })
    )

    // 添加 vue-loader
    plugins.push(new VueLoaderPlugin())

    /*
    plugins.push(
      AutoImport.default({
        resolvers: [VantResolver()],
      })
    )

    // 添加 vant4
    plugins.push(
      ComponentsPlugin.default({
        resolvers: [VantResolver()],
      })
    )
     */

    new UselessFile({
      webpack: '5',
      root: path.join(this._appRootDir, 'src'),
      out: path.join(this._appRootDir, 'unusedFile.json'),
      clean: false,
      exclude: /node_modules/
    })

    return plugins
  }

  // build dll
  _buildDll(needBuild = true) {
    console.log(LoggerPrefix, `Starting ${chalk.cyan('build dll')} ...`)
    const startTime = performance.now()

    WebpackDllCompiler(this._script, {
      entry: {
        //vendor: ['vue', 'vue-router'],
        // other: ['crypto-js'],
      },
      output: {
        path: this._dllDir
      },
      done: () => {
        const endTime = performance.now()
        console.log(
          LoggerPrefix,
          `Finished ${chalk.cyan('build dll')} after ${chalk.magenta(`${endTime - startTime} ms`)}`
        )
        if (needBuild) this._build()
      }
    })
  }

  // build
  _build() {
    console.log(`${LoggerPrefix} Starting ${chalk.cyan('build')} ...`)
    const startTime = performance.now()

    const options = {
      script: this._script,
      opts: {
        languages: ['vue'],
        entry: path.resolve(this._appRootDir, 'src/communal/app/index.ts'),
        plugins: this._getWebpackPlugins(),
        externals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          vant: 'vant'
        },
        /* // 自动注入 vant4 需要引入
        alias: {
          'vant/es': 'vant/lib',
        },
         */
        loaders: [
          {
            test: /\.css$/i,
            use: [
              { loader: 'style-loader' },
              { loader: 'css-loader' },
              { loader: 'postcss-loader' }
            ]
          }
        ],
        settings: {
          usePurgecssPlugin: false,
          usePwaPlugin: false,
          useMinimize: true,
          experiments: false,
          generateReport: false,
          useTerserWebpackPlugin: true,
          providePlugin: {},
          useCssLoader: false,
          compress: {
            enable: false,
            deleteOutput: true,
            suffix: '.zip'
          }
        },
        clean: true
      },
      done: () => {
        const endTime = performance.now()
        // 删除根目录下的 .vendor 文件
        fsExtra.removeSync(this._dllDir)

        // 根据环境删除 vue 文件
        if (this._script === this._SCRIPTS[1]) {
          fsExtra.removeSync(path.join(this._appRootDir, 'build', 'vue.min.js'))
        }

        if (this._script === this._SCRIPTS[2] || this._SCRIPTS[3]) {
          fsExtra.removeSync(path.join(this._appRootDir, 'dist', 'vue.development.js'))
          fsExtra.removeSync(path.join(this._appRootDir, 'dist', 'vue.development.js.gz'))
        }

        console.log(LoggerPrefix, `Finished ${chalk.cyan('build')} after ${chalk.magenta(`${endTime - startTime} ms`)}`)
      }
    }

    if (this._script !== this._SCRIPTS[0]) {
      // 读取 .vendor 目录下的 manifest 文件
      const dllDir = this._dllDir
      if (fsExtra.pathExistsSync(dllDir)) {
        const files = (Paths.getFileList(dllDir) || []).filter(file => path.extname(file) === '.json')
        const manifestList = files.map(file => file.replace('.json', ''))
        options.opts.dllSettings = {
          dllOutput: this._dllDir,
          manifestList
        }

        options.opts.clean = true
      }
    }

    if (!Utils.isBlank(this._projectUrl)) {
      options.opts.settings.definePlugin = {
        PROJECT_URL: this._projectUrl
      }
    }

    WebpackCompiler(options)
  }

  // instance
  instance() {
    // 删除 webpack 缓存
    const cacheDir = path.join(this._appRootDir, 'node_modules', '.cache')
    if (fsExtra.pathExistsSync(cacheDir)) {
      fsExtra.removeSync(cacheDir)
    }

    if (this._script === this._SCRIPTS[0]) {
      // start
      return this._build()
    }

    return this._buildDll()
  }
}

module.exports = ProjectBuilder
