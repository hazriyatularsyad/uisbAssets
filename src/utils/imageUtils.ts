export const normalizeImageUrls = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter((item): item is string => Boolean(item))
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => Boolean(item))
      }
    } catch {
      // ignore invalid JSON and fall back to comma split
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
