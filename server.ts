import express from "express"
import { Pool } from "pg"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

dotenv.config({ path: ".env.local" })

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "uisb_assets",
  user: "hazriyatularsyad",
  password: "",
})

const JWT_SECRET = "uisb_secret_key_2024"

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

app.get("/api/assets", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM assets ORDER BY name ASC")
    const assets = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      purchaseDate: row.purchase_date,
      price: row.price,
      location: row.location,
      status: row.status,
      condition: row.condition,
      description: row.description,
    }))
    res.json(assets)
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data" })
  }
})

app.post("/api/assets", authMiddleware, async (req, res) => {
  try {
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
    await pool.query(
      "INSERT INTO assets (id, name, category, purchase_date, price, location, status, condition, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
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
      ],
    )
    res.json({ id })
  } catch (err) {
    res.status(500).json({ error: "Gagal menambah aset" })
  }
})

app.put("/api/assets/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
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
    await pool.query(
      "UPDATE assets SET name=$1, category=$2, purchase_date=$3, price=$4, location=$5, status=$6, condition=$7, description=$8 WHERE id=$9",
      [
        name,
        category,
        purchaseDate,
        price,
        location,
        status,
        condition,
        description,
        id,
      ],
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Gagal update aset" })
  }
})

app.delete("/api/assets/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    await pool.query("DELETE FROM assets WHERE id=$1", [id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Gagal hapus aset" })
  }
})

const PORT = 4000
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`),
)
