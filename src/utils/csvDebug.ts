// Debug helper untuk test CSV parsing
export const testCSVParsing = (csvText: string) => {
  const lines = csvText.split("\n").filter((line) => line.trim())
  
  if (lines.length < 2) {
    return { error: "Kurang dari 2 baris" }
  }

  const headerLine = lines[0]
  const headers = headerLine.split(",").map((h) => h.trim())

  console.log("Headers:", headers)

  const dataRows = lines.slice(1).map((line) => {
    const obj: Record<string, string> = {}
    let values: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ""))
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ""))

    headers.forEach((header, idx) => {
      obj[header] = values[idx] || ""
    })
    
    return obj
  })

  console.log("Data rows:", dataRows)

  return {
    headers,
    dataRows,
    rowCount: dataRows.length,
  }
}
