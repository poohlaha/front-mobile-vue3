import Utils from '@utils/utils'
import { CONSTANT, SYSTEM } from '@configs/index'
import { RouterUrls } from '@route/urls'

// 退出相关
const EXIT = {
  /**
   * 退出
   */
  exit: (props: any) => {
    setTimeout(() => {
      props.history.push({
        pathname: RouterUrls.LOGIN_URL
      })
    }, 300)
  },

  /**
   * 退出登陆
   * @param text 提示文字
   * @param redirectUrl 重定向url
   */
  logout: (text = '', redirectUrl = '') => {
    USER.clearUserInfo()
    PAGE_JUMP.toLoginPage({ text, redirectUrl })
  }
}

// 页面跳转相关
const PAGE_JUMP = {
  /**
   * 跳转到登录页面
   * @param text 提示文字
   * @param url 跳转url
   * @param redirectUrl 重定向url
   * @param isReplace 是否替换
   */
  toLoginPage: ({ text = '', url = '', redirectUrl = '', isReplace = false }) => {
    if (!Utils.isBlank(text)) TOAST.show({ message: text, type: 1 })
    let { beforeAddressUrl, addressUrl } = ADDRESS.getAddress()
    if (!Utils.isBlank(addressUrl) && addressUrl.startsWith('/')) {
      addressUrl = addressUrl.substr(1, addressUrl.length)
    }

    if (!Utils.isBlank(redirectUrl) && redirectUrl.startsWith('/')) {
      redirectUrl = redirectUrl.substr(1, redirectUrl.length)
    }

    if (Utils.isBlank(url)) url = RouterUrls.PERSONAL.BIND_ACCOUNT.URL
    url = `${beforeAddressUrl}${url}?redirectUrl=${Utils.encrypt(
      encodeURIComponent(redirectUrl || addressUrl || window.location.href)
    )}`

    const getUrl = () => (isReplace ? window.location.replace(url) : (window.location.href = url))
    !Utils.isBlank(text) ? setTimeout(() => getUrl(), 500) : getUrl()
  }
}

// 地址栏相关
const ADDRESS = {
  /**
   * 根据 window.location.href 获取前缀和后缀 URL
   */
  getAddress: (url: string = '') => {
    let address = url || window.location.href

    // 判断有没有项目名
    let projectUrl = process.env.PROJECT_URL || '/'
    if (projectUrl !== '/') {
      let addresses = address.split(projectUrl) || []
      if (addresses.length === 2) {
        return {
          beforeAddressUrl: addresses[0] + projectUrl,
          addressUrl: addresses[1]
        }
      }
    }

    let addressReg = /^(https?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)(\/#)?$/
    if (address.substr(address.length - 1, address.length) === '/') {
      address = address.substr(0, address.length - 1)
    }

    // 如果只有协议和端口
    if (addressReg.test(address)) {
      console.log('address:', '')
      console.log('beforeAddressUrl:', address)
      return {
        addressUrl: '',
        beforeAddressUrl: address
      }
    }

    // 判断是否有?
    let qIndex = address.indexOf('?')
    let param = ''
    if (qIndex !== -1) {
      let addressNoParamUrl = address.substr(0, qIndex)
      param = address.substr(qIndex, address.length)
      address = addressNoParamUrl
    }

    // 判断最后一个字符是否是 `\`
    let lastChar = address.substr(address.length - 1, address.length)
    if (lastChar.endsWith('/') || lastChar.endsWith('\\')) {
      address = address.substr(0, address.length)
    }

    let lastIndex = address.lastIndexOf('/')
    let beforeAddressUrl = address.substr(0, lastIndex) // 前缀
    let spec = beforeAddressUrl.indexOf('#') // #
    if (spec !== -1) {
      beforeAddressUrl = beforeAddressUrl.substr(0, spec) + '#'
    }
    let addressUrl = address.substr(lastIndex, address.length) // 后缀
    console.log('addressUrl:', addressUrl)
    console.log('beforeAddressUrl:', beforeAddressUrl)
    console.log('param:', param)
    return {
      addressUrl,
      beforeAddressUrl,
      param,
      params: ADDRESS.getUrlString(param)
    }
  },

  /**
   * 解析 props query
   */
  getQueryString: (props: any) => {
    if (!props) return null
    return ADDRESS.getUrlString(props.history.location.search)
  },

  /**
   * 获取 URL 参数
   */
  getUrlString: (url: string) => {
    if (!url) return {}

    let obj: any = {}
    const getQueryParams = (url: string = '') => {
      let params: any = {}
      if (!url) return params

      let spec = '?'
      let specIndex = url.indexOf(spec)
      if (specIndex === -1) return params

      url = url.substring(specIndex, url.length)
      const t = url.substring(0, 1)
      const query = t === '?' ? url.substring(1, url.length).split('&') : url.split('&')
      if (!query.length) return null
      query.forEach((item: string) => {
        if (item) {
          const data: Array<string> = item.split('=')
          params[data[0]] = data[1] || ''
        }
      })

      return params
    }
    // 判断是否有redirectUrl
    let redirectStr: string = 'redirectUrl='
    const redirectIndex: number = url.indexOf(redirectStr)
    if (redirectIndex !== -1) {
      let item = url.substr(redirectIndex + redirectStr.length, url.length)
      let prefixUrl = url.substr(0, redirectIndex)
      obj[redirectStr.substr(0, redirectStr.length - 1)] = item
      let otherParams = getQueryParams(prefixUrl)
      return {
        ...obj,
        ...otherParams
      }
    }

    return getQueryParams(url)
  },

  /**
   * 根据名称获取浏览器参数
   */
  getAddressQueryString: (name: string) => {
    if (!name) return null
    let after = window.location.search
    after = after.substr(1) || window.location.hash.split('?')[1]
    if (!after) return null
    if (after.indexOf(name) === -1) return null
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    let r = decodeURI(after).match(reg)
    if (!r) return null
    return r[2]
  }
}

// 用户相关
const USER = {
  /**
   * 获取用户信息
   */
  getUserInfo: () => {
    const mobile = Utils.getLocal(SYSTEM.USER_PHONE_NAME) || ''
    if (Utils.isBlank(mobile || '')) {
      return {}
    }

    const key = `${SYSTEM.USER_TOKEN_NAME}_${Utils.encrypt(mobile)}`
    let userInfo = Utils.getLocal(key)
    if (!userInfo) return {}

    if (typeof userInfo === 'string') {
      try {
        userInfo = JSON.parse(userInfo) || {}
      } catch (_) {
        userInfo = {}
      }
    }

    return userInfo
  },

  /**
   * 保存用户信息
   * @param userInfo 用户数据, JSON对象
   */
  setUserInfo: (userInfo: { [K: string]: any } = {}) => {
    if (Utils.isObjectNull(userInfo || {})) return

    const token = userInfo[SYSTEM.TOKEN_NAME] // 从用户信息中获取 TOKEN
    delete userInfo[SYSTEM.TOKEN_NAME]

    const mobile = userInfo.mobile || ''

    // 设置手机号码
    Utils.removeLocal(SYSTEM.USER_PHONE_NAME)
    Utils.setLocal(SYSTEM.USER_PHONE_NAME, mobile)

    // 设置用户信息
    Utils.removeLocal(`${SYSTEM.USER_TOKEN_NAME}_${Utils.encrypt(mobile)}`)
    Utils.setLocal(`${SYSTEM.USER_TOKEN_NAME}_${Utils.encrypt(mobile)}`, JSON.stringify(userInfo))

    // 保存 TOKEN
    Utils.removeLocal(SYSTEM.LOCAL_TOKEN_NAME)
    Utils.setLocal(SYSTEM.LOCAL_TOKEN_NAME, token)
  },

  /**
   * 清除用户信息
   */
  clearUserInfo: () => {
    // 清除 Token
    Utils.removeLocal(SYSTEM.LOCAL_TOKEN_NAME)

    // 清除手机号码
    Utils.removeLocal(SYSTEM.USER_PHONE_NAME)

    // 清除用户信息
    Utils.removeLocal(SYSTEM.USER_TOKEN_NAME)
  },

  /**
   * 获取 Token
   */
  getToken: () => {
    return Utils.getLocal(SYSTEM.LOCAL_TOKEN_NAME) || ''
  },

  /**
   * 获取手机号
   */
  getMobile: async () => {
    return Utils.getLocal(SYSTEM.USER_PHONE_NAME) || ''
  }
}

// Toast
const TOAST = {
  /**
   * Toast 弹出提示
   * @param message -- 内容
   * @param duration -- 时间 0 为不关闭, 默认 2000 ms
   * @param type --- 1 默认提示 2 成功 3 失败 4 loading
   * @param needTime -- 是否延迟加载
   * @param maskClickable -- 背景是否可点击
   * @param className --- 遮罩层样式
   * @param onClose -- 关闭时的回调函数
   * @param onOpened -- 完全展示后的回调函数
   */
  show: ({
    message = '',
    type = 1,
    needTime = false,
    duration = 2000,
    maskClickable = true,
    className = '',
    onClose = () => {},
    onOpened = () => {}
  }) => {
    const getToast = () => {
      if (type === 2) {
        // 成功
        window.vant.showToast({
          type: 'success',
          message,
          forbidClick: maskClickable,
          duration,
          className,
          onClose: () => onClose?.(),
          onOpened: () => onOpened?.()
        })
      } else if (type === 3) {
        // 失败
        window.vant.showToast({
          type: 'fail',
          message,
          forbidClick: maskClickable,
          duration,
          className,
          onClose: () => onClose?.(),
          onOpened: () => onOpened?.()
        })
      } else if (type === 4) {
        // loading
        window.vant.showToast({
          type: 'loading',
          message: message || CONSTANT.LOADING,
          forbidClick: maskClickable,
          loadingType: 'spinner',
          duration,
          className,
          onClose: () => onClose?.(),
          onOpened: () => onOpened?.()
        })
      } else {
        window.vant.showToast({
          type: 'html',
          message,
          forbidClick: maskClickable,
          duration,
          className,
          onClose: () => onClose?.(),
          onOpened: () => onOpened?.()
        })
      }
    }

    needTime ? setTimeout(() => getToast(), 350) : getToast()
  },

  /**
   * 隐藏所有提示
   */
  hide() {
    TOAST.hide()
  }
}

// 公共模块相关
const COMMON = {}

export { EXIT, PAGE_JUMP, ADDRESS, USER, TOAST, COMMON }
