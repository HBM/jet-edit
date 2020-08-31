import flatten from 'flat'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const flatObject = (value: any) => {
  if (typeof value === 'object') {
    return flatten(value)
  } else {
    return {
      '': value
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const unflatObject = (value: any) => {
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 1 && keys[0] === '') {
      return value['']
    }
  }
  return flatten.unflatten(value)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const flatToNameValue = (flat: any) => {
  return Object.keys(flat)
    .sort(function (a, b) {
      if (a > b) {
        return 1
      } else if (a < b) {
        return -1
      }
      return 0
    })
    .map(function (key) {
      return { name: key, value: flat[key] }
    })
}

export const toHex = (number: number): string => {
  const hex = Math.abs(number).toString(16).slice(-8)
  const zeros = 8 - Math.min(hex.length, 8)
  const hex8 = '0'.repeat(zeros) + hex
  const bytes = []
  for (let i = 0; i < 8; i = i + 2) {
    bytes.push(hex8.substr(i, 2))
  }
  return '0x ' + bytes.join(' ')
}

export const isInt = (number: string | number): boolean => {
  return parseInt(`${number}`) === number
}
