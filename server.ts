import express from "express"
import { Pool } from "pg"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import multer from "multer"
import path from "path"
import fs from "fs"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { buildReceiptValue, normalizeImageUrls } from "./src/utils/imageUtils"

dotenv.config({ path: ".env.local" })

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express()
app.set("trust proxy", true)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json())

// const pool = new Pool({
//   host: "localhost",
//   port: 5432,
//   database: "uisb_assets",
//   user: "hazriyatularsyad",
//   password: "",
// })

const pool = new Pool({
  host: "pgsql-dbas-jkt1-006.sumobase.my.id",
  port: 6432,
  database: "db63a8791421305a54",
  user: "u1dzt7sWX3VNVdsE7.jkt1_006",
  password: "3145a7f02e737a054ffffe6f",
  ssl: false,
})

pool.on('error', (err) => {
  console.error('Unexpected database error:', err)
})

const JWT_SECRET = "uisb_secret_key_2024"

// ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), "uploads")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

console.log("Working Directory :", process.cwd())
console.log("Uploads Directory :", uploadsDir)
console.log("Uploads Exists :", fs.existsSync(uploadsDir))

// multer setup
const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
)

const storage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "uisb-assets",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      } as any,
    })
  : multer.diskStorage({
      destination: uploadsDir,
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || "")
        const base = path.basename(file.originalname || "file", ext)
        cb(null, `${Date.now()}-${base}${ext}`)
      },
    })

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
})

const handleMultipartUpload = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error("Multer upload error:", err)
      return res.status(400).json({ error: err.message || "Upload gagal" })
    }
    next()
  })
}

// serve uploaded files (local fallback saat Cloudinary tidak aktif)
if (!hasCloudinaryConfig) {
  app.use("/uploads", express.static(uploadsDir, { fallthrough: false }))
}

const getPublicReceiptUrl = (req: express.Request, file: any) => {
  if (file?.secure_url) return file.secure_url
  if (typeof file?.path === "string") {
    if (file.path.startsWith("http")) return file.path
    const filename = path.basename(file.path)
    const host = req.get("host")
    const protocol = req.protocol
    return `${protocol}://${host}/uploads/${filename}`
  }
  const host = req.get("host")
  const protocol = req.protocol
  return `${protocol}://${host}/uploads/${file?.filename || "file"}`
}

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    uploads: uploadsDir,
  })
})

app.get("/test-image", (_, res) => {
  const files = fs.readdirSync(uploadsDir)

  if (files.length === 0) {
    return res.status(404).json({
      error: "Belum ada file upload",
    })
  }

  res.sendFile(path.join(uploadsDir, files[0]))
})

// ensure asset schema exists for upload metadata
;(async () => {
try {
  await pool.query(
    "ALTER TABLE assets ADD COLUMN IF NOT EXISTS receipt_url TEXT",
  )
  await pool.query(
    "ALTER TABLE assets ADD COLUMN IF NOT EXISTS images JSONB",
  )
  await pool.query(
    "ALTER TABLE assets ADD COLUMN IF NOT EXISTS source TEXT",
  )
  await pool.query(`
    UPDATE assets
    SET images = CASE
      WHEN receipt_url IS NULL THEN '[]'::jsonb
      WHEN receipt_url LIKE '[' THEN receipt_url::jsonb
      ELSE jsonb_build_array(receipt_url)
    END
    WHERE images IS NULL
  `)
  await pool.query(`
    UPDATE assets
    SET source = 'Hibah'
    WHERE source IS NULL
  `)
  console.log("✅ Asset schema migration completed")
} catch (err) {
  console.warn("Failed to ensure asset schema:", err)
}
})()

// ==================== MIDDLEWARE AUTH ====================
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: "Token tidak valid" })
  }
}

// ==================== AUTH ROUTES ====================

// Register user baru
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username dan password wajib diisi" })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, passwordHash],
    )
    res.json({ message: "User berhasil dibuat" })
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Username sudah digunakan" })
    }
    res.status(500).json({ error: "Gagal membuat user" })
  }
})

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body
    const result = await pool.query("SELECT * FROM users WHERE username=$1", [
      username,
    ])
    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ error: "Username atau password salah" })
    }
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ error: "Username atau password salah" })
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "8h" },
    )
    res.json({ token, username: user.username })
  } catch (err) {
    res.status(500).json({ error: "Gagal login" })
  }
})

// ==================== ASSET ROUTES (dilindungi auth) ====================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
})

app.get("/api/assets", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM assets ORDER BY name ASC")
    const assets = result.rows.map((row) => {
    const imageUrls = normalizeImageUrls(row.images ?? row.receipt_url)
    const receiptUrl = imageUrls[0] || null
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      purchaseDate: row.purchase_date,
      price: row.price,
      location: row.location,
      status: row.status,
      condition: row.condition,
      receipt_url: receiptUrl,
      images: imageUrls,
      description: row.description,
      source: row.source,
    }
    })
    res.json(assets)
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data" })
  }
})

app.post(
  "/api/assets",
  authMiddleware,
  handleMultipartUpload,
  async (req, res) => {
    try {
      const files = Array.isArray((req as any).files)
        ? (((req as any).files as Express.Multer.File[]).filter((file) =>
            file?.mimetype?.startsWith("image/"),
          ))
        : []
      const {
        id,
        name,
        category,
        purchaseDate,
        price,
        location,
        status,
        condition,
        description,
        source,
      } = req.body
      const uploadedUrls = files.map((file) => getPublicReceiptUrl(req, file))
      const imageUrls = uploadedUrls.length > 0 ? uploadedUrls : []
      const receiptValue = buildReceiptValue(imageUrls)
      await pool.query(
        "INSERT INTO assets (id, name, category, purchase_date, price, location, status, condition, description, receipt_url, images, source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
        [
          id,
          name,
          category,
          purchaseDate,
          price,
          location,
          status,
          condition,
          description,
          receiptValue,
          JSON.stringify(imageUrls),
          source || "Hibah",
        ],
      )
      res.json({ id, receiptUrl: imageUrls[0] || null, images: imageUrls })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Gagal menambah aset" })
    }
  },
)

app.put(
  "/api/assets/:id",
  authMiddleware,
  handleMultipartUpload,
  async (req, res) => {
    try {
      const { id } = req.params
      const files = Array.isArray((req as any).files)
        ? (((req as any).files as Express.Multer.File[]).filter((file) =>
            file?.mimetype?.startsWith("image/"),
          ))
        : []
      const {
        name,
        category,
        purchaseDate,
        price,
        location,
        status,
        condition,
        description,
        images,
        source,
      } = req.body
      const existingImages = normalizeImageUrls(images)
      const uploadedUrls = files.map((file) => getPublicReceiptUrl(req, file))
      const finalImages = uploadedUrls.length > 0 ? uploadedUrls : existingImages
      const receiptValue = buildReceiptValue(finalImages)
      const fields = [
        name,
        category,
        purchaseDate,
        price,
        location,
        status,
        condition,
        description,
        source || "Hibah",
      ]
      let query =
        "UPDATE assets SET name=$1, category=$2, purchase_date=$3, price=$4, location=$5, status=$6, condition=$7, description=$8, source=$9"
      const params: any[] = [...fields, id]
      if (receiptValue) {
        query += ", receipt_url=$10, images=$11"
        params.splice(9, 0, receiptValue, JSON.stringify(finalImages))
      } else {
        query += ", images=$10"
        params.splice(9, 0, JSON.stringify(finalImages))
      }
      query += " WHERE id=$" + params.length
      await pool.query(query, params)
      res.json({ success: true, receiptUrl: finalImages[0] || null, images: finalImages })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Gagal update aset" })
    }
  },
)

app.delete("/api/assets/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    await pool.query("DELETE FROM assets WHERE id=$1", [id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Gagal hapus aset" })
  }
})

const PORT = Number(process.env.PORT) || 4000

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...')
  pool.end().then(() => process.exit(0))
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  pool.end().then(() => process.exit(1))
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
})
