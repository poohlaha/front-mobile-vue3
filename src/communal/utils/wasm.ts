/**
 * @fileOverview wasm handle result
 * @date 2023-08-28
 * @author poohlaha
 */
import Utils from './utils'

export default class WasmUtils {
  /**
   * 处理 body, 转换 map 为 json
   */
  onHandleBody(body: Map<any, any>, requestType: string = '0') {
    if (!body) return {}

    let res: any = {}
    // @ts-ignore

    const convertJson = (value: any) => {
      if (value instanceof Map) {
        return Object.fromEntries(
          // @ts-ignore
          Array.from(value, ([key, val]) => [
            convertJson(key), // 递归处理键
            convertJson(val) // 递归处理值
          ])
        )
      }

      // 如果是数组，递归处理每个元素
      if (Array.isArray(value)) {
        return value.map(convertJson)
      }

      // 如果是对象，递归处理对象的每个属性
      if (typeof value === 'object' && value !== null) {
        return Object.fromEntries(
          // @ts-ignore
          Object.entries(value).map(([key, val]) => [
            convertJson(key), // 递归处理键
            convertJson(val) // 递归处理值
          ])
        )
      }

      // 如果是基本类型，直接返回
      return value || null
    }

    // @ts-ignore
    for (const [key, value] of body) {
      // 封闭
      if (value instanceof Map || Array.isArray(value)) {
        // 判断是不是二进制返回
        if (requestType === '3') {
          // @ts-ignore
          const binaryArray = new Uint8Array(value)
          res = new Blob([binaryArray])
        } else {
          res[key] = convertJson(value)
        }
      } else {
        res[key] = value ?? null
      }
    }

    console.log('wasm handle result: ', res)
    return res
  }

  /**
   * 处理返回结果类型
   */
  onHandleResult(request: { [K: string]: any } = {}, response: { [K: string]: any } = {}) {
    let httpResponse: { [K: string]: any } = {
      status: 200,
      headers: new Map(),
      body: null,
      error: ''
    }

    if (response.status_code !== 200 || Utils.isObjectNull(response || {})) {
      httpResponse.status = response.status_code
      httpResponse.error = `response error, status code: ${response.status_code}, status text: ${
        response.statusText || ''
      } !`
      this.executeFn(request.failed, httpResponse)
      return httpResponse
    }

    const res = this.onHandleBody(response.body || null, request.responseType ?? '0') || {}
    console.log('res', res)
    httpResponse.body = res
    httpResponse.headers = response.headers || {}
    httpResponse.error = response.error || ''
    this.executeFn(request.success, httpResponse)
    return httpResponse
  }

  /**
   * 执行函数
   */
  private executeFn(fn: Function | undefined | null, httpResponse: { [K: string]: any } = {}) {
    if (fn !== undefined && fn !== null) {
      if (typeof fn === 'function') {
        fn(httpResponse)
      } else {
        console.error('execute function error, `fn` is not a `function` !')
      }
    }
  }
}
