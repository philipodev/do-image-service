const allowedKeys = ['w', 'h', 'mah', 'maw']

export function buildOptionsString(options: Record<string, string>) {
  return Object.keys(options)
    .sort()
    .filter((key) => allowedKeys.includes(key))
    .map((key) => `${key}-${options[key]}`)
    .join('_')
}

export function getImageFormat(acceptHeader: string, queryFormat?: string) {
  if (queryFormat && queryFormat !== 'auto') {
    return queryFormat
  }

  // if (acceptHeader.includes('image/avif')) {
  //   return 'avif'
  // }

  if (acceptHeader.includes('image/webp')) {
    return 'webp'
  }

  return 'base'
}
