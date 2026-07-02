import dotenv from "dotenv"
import { Pool } from "pg"
import { INITIAL_ASSETS } from "../src/data/mockAssets"

dotenv.config({ path: ".env.local" })

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "uisb_assets",
  user: process.env.PGUSER || process.env.USER,
  password: process.env.PGPASSWORD || "",
})

async function ensureSchema() {
  const sql = (await import("fs/promises")).readFileSync(
    "./migrations/create_tables.sql",
    "utf8",
  )
  await pool.query(sql)
}

async function migrate() {
  try {
    console.log("Ensuring schema...")
    const schemaSql = await (
      await import("fs/promises")
    ).readFile("./migrations/create_tables.sql", "utf8")
    await pool.query(schemaSql)

    // Insert categories first
    const categories = Array.from(
      new Set(INITIAL_ASSETS.map((a) => a.category).filter(Boolean)),
    )
    for (const name of categories) {
      const trimmed = String(name).trim()
      const res = await pool.query("SELECT id FROM categories WHERE name=$1", [
        trimmed,
      ])
      if (res.rowCount === 0) {
        await pool.query("INSERT INTO categories (name) VALUES ($1)", [trimmed])
        console.log("Inserted category", trimmed)
      }
    }

    // Insert assets
    for (const a of INITIAL_ASSETS) {
      const exists = await pool.query("SELECT id FROM assets WHERE id=$1", [
        a.id,
      ])
      if (exists.rowCount > 0) {
        console.log("Skipping existing asset", a.id)
        continue
      }
      await pool.query(
        "INSERT INTO assets (id, name, category, purchase_date, price, location, status, condition, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          a.id,
          a.name,
          a.category,
          a.purchaseDate,
          a.price,
          a.location,
          a.status,
          a.condition,
          a.description,
        ],
      )
      console.log("Inserted asset", a.id)
    }

    console.log("Migration complete")
  } catch (err) {
    console.error("Migration failed:", err)
  } finally {
    await pool.end()
  }
}

migrate()
