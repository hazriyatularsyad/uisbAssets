export const normalizeImageUrls = (value: any) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      // ignore
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export const buildReceiptValue = (images: string[]) => {
  if (!images.length) return null
  return images.length === 1 ? images[0] : JSON.stringify(images)
}
