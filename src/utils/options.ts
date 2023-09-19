const allowedKeys = ['w', 'h', 'format', 'mah', 'maw']

export function buildOptionsString(options: Record<string, string>) {
  return Object.keys(options)
    .sort()
    .filter((key) => allowedKeys.includes(key))
    .map((key) => `${key}=${options[key]}`)
    .join('&')
}
