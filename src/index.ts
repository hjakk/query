type StringifyOptions = {
  overrides: { [key: string]: any }
}

function toString(data: any, prevKey?: string | null, options?: StringifyOptions): string {
  let _q = ''
  for (const key in data) {
    if (!data.hasOwnProperty(key)) continue

    let _v: any = data[key]
    let _f = false
    if (options) {
      if (options.overrides && String(_v) in options.overrides) {
        _v = options.overrides[String(_v)]
        _f = true
      }
    }

    const _k: string = prevKey ? `${ prevKey }[${ Array.isArray(data) ? '' : key }]` : key
    if (_f || (_v !== undefined && _v !== '')) {
      if (_q) _q += '&'
      if (typeof _v === 'object' && _v !== null) {
        _q += toString(_v, `${ _k }`, options)
      }
      else {
        _q += encodeURIComponent(_k)
        _q += `=${ encodeURIComponent(_v) }`
      }
    }
  }
  return _q
}

function stringify(data: any, options?: StringifyOptions): string {
  return toString(data, null, options)
}

function handleValue(value: any): string | number | boolean | null | undefined {
  if (/^[1-9]+$/.test(value)) return Number(value)
  if (value === 'false') return false
  if (value === 'true') return true
  if (value === 'null') return null
  if (value === 'undefined') return undefined
  return value
}

function parse(str: string): { [key: string]: any } | null {
  str = str.replace(/^\?/, '')
  if (!str) return null
  const params: any = {}
  const arr: string[] = str.split('&')
  let i = -1
  while (++i < arr.length) {
    let [_key, _value] = arr[i].split('=')
    _key = decodeURIComponent(_key)
    _value = decodeURIComponent(_value)
    if (/\[\]$|\[(\d+)\]$/.test(_key)) {
      const _rootKey: string = _key.replace(/\[\]$|\[(\d+)\]$/, '')
      if (!params[_rootKey]) params[_rootKey] = []
      const index: string[] | null = _key.match(/\[(\d+)\]/)
      if (index) params[_rootKey][index[1]] = handleValue(_value)
      else params[_rootKey].push(_value)
    }
    else if (/\[(.+)\]$/.test(_key)) {
      const _rootKey: string = _key.replace(/\[(.+)\]$/, '')
      if (!params[_rootKey]) params[_rootKey] = {}
      const _k: string[] | null = _key.match(/\[(.+)\]$/)
      if (_k) params[_rootKey][_k[1]] = handleValue(_value)
    }
    else {
      params[_key] = handleValue(_value)
    }
  }
  return params
}

export default {
  stringify,
  parse,
}
