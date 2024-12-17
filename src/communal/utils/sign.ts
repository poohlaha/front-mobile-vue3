import { CONSTANT, SYSTEM } from '@configs/index'
import Utils from './utils'

/**
 * 签名
 */
const Signature = {}

/**
 * 设置请求头
 */
const setHeaders = (config: any = {}) => {
  if (!config) return {} // 校验 config
  if (!config.url) return {} // 校验 url

  let type = config.type || CONSTANT.REQUEST.DEFAULT_URL_FORMAT
  if (type.toUpperCase() === CONSTANT.REQUEST.DEFAULT_URL_FORMAT) {
    type = CONSTANT.REQUEST.DEFAULT_CONTENT_TYPE
  } else if (type.toUpperCase() === 'FORM') {
    type = undefined
  } else {
    type = CONSTANT.REQUEST.DEFAULT_FORM_URLENCODED
  }

  let headers = config.headers || {}
  // @ts-ignore
  headers[CONSTANT.REQUEST.X_REQUESTED_WITH] = CONSTANT.REQUEST.DEFAULT_X_REQUESTED_WITH
  // @ts-ignore
  if (SYSTEM.NEED_TOKEN) {
    headers[SYSTEM.TOKEN_NAME] = Utils.getLocal(`${SYSTEM.OPEN_ID}_${SYSTEM.LOCAL_TOKEN}`) || ''
  }

  if (type) {
    // @ts-ignore
    headers[CONSTANT.REQUEST.CONTENT_TYPE_NAME] = type
  }

  return headers
}

/**
 * 设置token
 */
const setToken = (response: any) => {
  let headers = response.headers
  if (!headers) return

  let header = null
  try {
    header = headers.get(SYSTEM.TOKEN_NAME)
    if (!header) {
      header = headers.get(SYSTEM.TOKEN_NAME.toLowerCase())
    }
  } catch (e) {
    try {
      header = headers[SYSTEM.TOKEN_NAME]
      if (!header) {
        header = headers[SYSTEM.TOKEN_NAME.toLowerCase()]
      }
    } catch (e) {
      header = null
    }
  }

  if (!header) {
    return
  }

  // 保存 TOKEN
  Utils.removeLocal(`${SYSTEM.OPEN_ID}_${SYSTEM.LOCAL_TOKEN}`)
  Utils.setLocal(`${SYSTEM.OPEN_ID}_${SYSTEM.LOCAL_TOKEN}`, header)
}

export { Signature, setToken, setHeaders }
