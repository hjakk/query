function stringify(data: any, prevKey?: string | null): string {
  let _q = ''
  for (const key in data) {
    if (!data.hasOwnProperty(key)) continue

    const _v: any = data[key]
    const _k: string = prevKey ? `${ prevKey }[${ Array.isArray(data) ? '' : key }]` : key
    if (_v !== undefined && _v !== '') {
      if (_q) _q += '&'
      if (typeof _v === 'object' && _v !== null) {
        _q += stringify(_v, `${ _k }`)
      }
      else {
        _q += encodeURIComponent(_k)
        _q += `=${ encodeURIComponent(_v) }`
      }
    }
  }
  return _q
}

function handleNum(value: any): string | number {
  return /^\d+$/.test(value) ? Number(value) : value
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
      if (index) params[_rootKey][index[1]] = handleNum(_value)
      else params[_rootKey].push(_value)
    }
    else if (/\[(.+)\]$/.test(_key)) {
      const _rootKey: string = _key.replace(/\[(.+)\]$/, '')
      if (!params[_rootKey]) params[_rootKey] = {}
      const _k: string[] | null = _key.match(/\[(.+)\]$/)
      if (_k) params[_rootKey][_k[1]] = handleNum(_value)
    }
    else {
      params[_key] = handleNum(_value)
    }
  }
  return params
}

export default {
  stringify,
  parse,
}
