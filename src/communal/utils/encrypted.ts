/**
 文件加减密
 */
import Utils from '@utils/utils'

class EncryptedHandler {
  static ASCII_FREQ = Array.from({ length: 128 }, (_, i) => {
    // 常见字符赋高频率
    if (i >= 97 && i <= 122) return { char: String.fromCharCode(i), weight: 50 } // a-z
    if (i >= 65 && i <= 90) return { char: String.fromCharCode(i), weight: 30 } // A-Z
    if (i >= 48 && i <= 57) return { char: String.fromCharCode(i), weight: 20 } // 0-9
    // if (i === 32) return { char: ' ', weight: 80 }; // 空格
    return { char: String.fromCharCode(i), weight: 5 } // 其他字符
  }).filter(Boolean)

  static UNICODE_FREQ = [
    ...EncryptedHandler.ASCII_FREQ,
    // 中文常用字符 U+4E00 - U+9FFF
    ...Array.from({ length: 0x9fff - 0x4e00 + 1 }, (_, i) => {
      const code = 0x4e00 + i
      return { char: String.fromCharCode(code), weight: 10 }
    })
  ]

  /**
   * 构建树
   */
  static build() {
    let heap: any = this.UNICODE_FREQ.filter(f => f.weight > 0).map(f => ({ ...f }))
    while (heap.length > 1) {
      heap.sort((a, b) => a.weight - b.weight)
      let left: { [K: string]: any } = heap.shift() || {}
      let right: { [K: string]: any } = heap.shift() || {}
      heap.push({
        weight: left.weight + right.weight,
        left,
        right
      })
    }
    return heap[0]
  }

  /**
   * 生成编码表
   */
  static generate(tree) {
    let codes = {}
    const traverse = (node, prefix) => {
      if (node.char !== undefined) {
        codes[node.char] = prefix
      } else {
        traverse(node.left, prefix + '0')
        traverse(node.right, prefix + '1')
      }
    }

    traverse(tree, '')
    return codes
  }

  /**
   * 编码
   */
  static encode(str = '', CODE_TABLE = {}) {
    if (Utils.isBlank(str || '')) return ''

    // 支持中文、emoji
    return Array.from(str)
      .map(ch => CODE_TABLE[ch] || '')
      .join('')
  }

  /**
   * 解码
   */
  static decode(str = '', REVERSE_TABLE = {}) {
    if (Utils.isBlank(str || '')) return ''
    let result = ''
    let buffer = ''
    for (let bit of str) {
      buffer += bit
      if (REVERSE_TABLE[buffer]) {
        result += REVERSE_TABLE[buffer]
        buffer = ''
      }
    }
    return result
  }
}

const HUFFMAN_TREE = EncryptedHandler.build()
const CODE_TABLE = EncryptedHandler.generate(HUFFMAN_TREE)
const REVERSE_TABLE = Object.fromEntries(Object.entries(CODE_TABLE).map(([ch, code]) => [code, ch]))

const encode = (str = '') => {
  return EncryptedHandler.encode(str, CODE_TABLE)
}

const decode = (str = '') => {
  return EncryptedHandler.decode(str, REVERSE_TABLE)
}

export { encode, decode }
