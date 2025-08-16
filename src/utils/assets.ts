const PUBLIC_PATH_URL = process.env.PUBLIC_PATH_URL

const loadAsset = (assetPath: string) => {
  return `${PUBLIC_PATH_URL}/${assetPath}`
}

export { loadAsset }
