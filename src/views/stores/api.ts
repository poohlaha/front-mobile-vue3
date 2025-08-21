/**
 * 发送请求
 */
import SmCrypto from 'sm-crypto'
import { HttpRequest } from '@bale-web/request'
import WasmUtils from '../../communal/utils/wasm'
import Utils from '@utils/utils'
import { TOAST, USER } from '@utils/base'
import { CONSTANT, SYSTEM } from '@configs/index'

const API_DATA = {
  localIp: '127.0.0.1',
  version: '1.0',
  appVersion: '1.0',
  opStation: 'NA',
  appId: '',
  channel: 'web'
}

const tokenName: string = 'xxxxxx'

const wasmUtils = new WasmUtils()

/**
 * 判断是否支持 wasm
 */
const isSupportWasm = () => {
  if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
    // 浏览器支持WebAssembly
    console.log('WebAssembly is supported')
    return true
  }

  // 浏览器不支持WebAssembly
  console.log('WebAssembly is not supported')
  return false
}

/**
 * sm2加密
 */
const sm2Encrypt = (str: string = '') => {
  if (Utils.isBlank(str)) return ''
  let publicKey = process.env.VUE_SM2_PUBLIC_KEY || ''
  if (!publicKey.startsWith('04')) {
    publicKey = `04${publicKey}`
  }

  // 1: C1C3C2 0: C1C2C3
  return SmCrypto.sm2.doEncrypt(str, publicKey, 1)
}

/**
 * sm2解密
 */
const sm2EDecrypt = (str: string = '') => {
  if (Utils.isBlank(str)) return ''
  let privateKey = process.env.VUE_SM2_PRIVATE_KEY || ''

  // 1: C1C3C2 0: C1C2C3
  return SmCrypto.sm2.doDecrypt(str, privateKey, 1, { output: 'string' })
}

/**
 * 发送请求
 * options: {
 *   url: '',
 *   success: () -> {},
 *   fail: () => {}
 * }
 */
const send = async (
  options: { [K: string]: any } = {},
  needSend: boolean = true,
  headers: { [K: string]: any } = {}
) => {
  if (Utils.isObjectNull(options)) {
    console.warn('options is empty !')
    return
  }

  if (Utils.isBlank(options.url)) {
    console.warn('url is empty !')
    return
  }

  let requestUrl = options.url || ''
  if (!requestUrl.startsWith('https://') && !requestUrl.startsWith('http://')) {
    requestUrl = process.env.VUE_APP_API_ROOT + requestUrl
  }

  let localToken = `${(await USER.getToken()) || ''}_${new Date().getTime()}` || ''
  let token = sm2Encrypt(localToken)
  console.log('token: ', await USER.getToken())

  if (process.env.APP_NODE_ENV !== 'prod') {
    let tokenDecrypt = sm2EDecrypt(token)
    console.log('send token decrypt: ', tokenDecrypt)
  }

  let requestHeaders = {}
  if (!Utils.isObjectNull(headers)) {
    requestHeaders = headers
  }

  let type = options.responseStream ? '3' : '0'

  let params: any = {
    url: requestUrl,
    method: options.method || 'post',
    data: {
      ...API_DATA,
      requestId: Utils.generateUUID(),
      requestTime: Utils.formatDateStr(new Date(), 'yyyyMMddHHmmss'),
      data: {
        ...options.data
      }
    },
    headers: {
      [tokenName]: token || '',
      ...requestHeaders
    },
    success: async (data: any = {}) => {
      if (type !== '0') {
        return options.success?.(data.body || null)
      }

      let body = data.body || {}
      if (body.code !== '0' && body.code !== 0) {
        // token 过期
        if (body.code === SYSTEM.TOKEN_EXPIRED_CODE) {
          await USER.clearUserInfo()
          TOAST.show({
            message: CONSTANT.TOKEN_EXPIRED_ERROR,
            type: 2
          })
          return
        }

        let whenCodeNoZeroOpenDialog = options.whenCodeNoZeroOpenDialog
        if (whenCodeNoZeroOpenDialog === null || whenCodeNoZeroOpenDialog === undefined) {
          whenCodeNoZeroOpenDialog = true
        }
        if (whenCodeNoZeroOpenDialog) {
          TOAST.show({
            message: body.codeInfo || body.errMsg || CONSTANT.ERROR_MESSAGE || '',
            type: 4
          })
        }

        return options.fail?.(body || {})
      }

      return options.success?.(body.data || {}, body)
    },
    failed: async (res: any = {}) => {
      if (res.code === SYSTEM.TOKEN_EXPIRED_CODE) {
        // await this.getLoginUrl()
      } else {
        options.fail?.(res)
      }
    },
    type: '0',
    responseType: type
  }

  if (!needSend) {
    return params
  }

  // 判官是否支持 wasm
  if (isSupportWasm()) {
    const fallbackModule = await import('@bale-wasm/http')
    let response = await fallbackModule.send(params, null)
    return wasmUtils.onHandleResult(params, response)
  }

  return await HttpRequest.send(params)
}

/**
 * 批量发送
 * @param queue
 */
const batchSend = async (queue: Array<any> = []) => {
  if (queue.length === 0) {
    console.log('batch send queue is empty!')
    return []
  }

  let results = (await Promise.all(queue)) || []
  if (results.length === 0) return []

  let data: Array<any> = []
  for (let result of results) {
    if (result === null || result === undefined) {
      result = {}
    }

    let status = result.status
    let body = result.body || {}
    let errorMsg = body.error || body.codeInfo || CONSTANT.ERROR_MESSAGE || ''
    if (status !== 200) {
      TOAST.show({ message: errorMsg, type: 4 })
      return []
    }

    let d = body.data
    let extendData = body.extendData
    data.push({
      data: d,
      extendData
    })
  }

  return data
}

export default {
  send,
  batchSend
}
