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

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

dotenv.config({ path: ".env.local" })

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
  ssl: false, // ← wajib
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
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uisb-assets",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  } as any,
})
const upload = multer({ storage })

// serve uploaded files
// app.use(
//   "/uploads",
//   express.static(uploadsDir, {
//     fallthrough: false,
//   }),
// )

const getPublicReceiptUrl = (req: express.Request, filename: string) => {
  const host = req.get("host")
  const protocol = req.protocol
  return `${protocol}://${host}/uploads/${filename}`
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

// ensure receipt_url column exists
;(async () => {
  try {
    await pool.query(
      "ALTER TABLE assets ADD COLUMN IF NOT EXISTS receipt_url TEXT",
    )
  } catch (err) {
    console.warn("Failed to ensure receipt_url column:", err)
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
      const rawReceiptUrl = row.receipt_url || null
      const receiptUrl = rawReceiptUrl
        ? rawReceiptUrl.startsWith("http")
          ? rawReceiptUrl
          : `${req.protocol}://${req.get("host")}${rawReceiptUrl}`
        : null
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
        description: row.description,
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
  upload.single("receipt"),
  async (req, res) => {
    try {
      const file = req.file
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
      } = req.body
      const receiptUrl = file ? getPublicReceiptUrl(req, file.filename) : null
      await pool.query(
        "INSERT INTO assets (id, name, category, purchase_date, price, location, status, condition, description, receipt_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
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
          receiptUrl,
        ],
      )
      res.json({ id, receiptUrl })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Gagal menambah aset" })
    }
  },
)

app.put(
  "/api/assets/:id",
  authMiddleware,
  upload.single("receipt"),
  async (req, res) => {
    try {
      const { id } = req.params
      const file = req.file
      const {
        name,
        category,
        purchaseDate,
        price,
        location,
        status,
        condition,
        description,
      } = req.body
      let receiptUrl = null
      if (file) {
        receiptUrl = getPublicReceiptUrl(req, file.filename)
      }
      const fields = [
        name,
        category,
        purchaseDate,
        price,
        location,
        status,
        condition,
        description,
      ]
      let query =
        "UPDATE assets SET name=$1, category=$2, purchase_date=$3, price=$4, location=$5, status=$6, condition=$7, description=$8"
      const params: any[] = [...fields, id]
      if (receiptUrl) {
        query += ", receipt_url=$9"
        params.splice(8, 0, receiptUrl)
      }
      query += " WHERE id=$" + params.length
      await pool.query(query, params)
      res.json({ success: true, receiptUrl })
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
