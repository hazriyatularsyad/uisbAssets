"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var pg_1 = require("pg");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
var cloudinary_1 = require("cloudinary");
var multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
var imageUtils_1 = require("./src/utils/imageUtils");
dotenv_1.default.config({ path: ".env.local" });
// Config Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
var app = (0, express_1.default)();
app.set("trust proxy", true);
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// const pool = new Pool({
//   host: "localhost",
//   port: 5432,
//   database: "uisb_assets",
//   user: "hazriyatularsyad",
//   password: "",
// })
var pool = new pg_1.Pool({
    host: "pgsql-dbas-jkt1-006.sumobase.my.id",
    port: 6432,
    database: "db63a8791421305a54",
    user: "u1dzt7sWX3VNVdsE7.jkt1_006",
    password: "3145a7f02e737a054ffffe6f",
    ssl: false,
});
pool.on('error', function (err) {
    console.error('Unexpected database error:', err);
});
var JWT_SECRET = "uisb_secret_key_2024";
// ensure uploads dir exists
var uploadsDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
console.log("Working Directory :", process.cwd());
console.log("Uploads Directory :", uploadsDir);
console.log("Uploads Exists :", fs_1.default.existsSync(uploadsDir));
// multer setup
var hasCloudinaryConfig = Boolean(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
var storage = hasCloudinaryConfig
    ? new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            folder: "uisb-assets",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
    })
    : multer_1.default.diskStorage({
        destination: uploadsDir,
        filename: function (_req, file, cb) {
            var ext = path_1.default.extname(file.originalname || "");
            var base = path_1.default.basename(file.originalname || "file", ext);
            cb(null, "".concat(Date.now(), "-").concat(base).concat(ext));
        },
    });
var upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
    },
});
var handleMultipartUpload = function (req, res, next) {
    upload.any()(req, res, function (err) {
        if (err) {
            console.error("Multer upload error:", err);
            return res.status(400).json({ error: err.message || "Upload gagal" });
        }
        next();
    });
};
// serve uploaded files (local fallback saat Cloudinary tidak aktif)
if (!hasCloudinaryConfig) {
    app.use("/uploads", express_1.default.static(uploadsDir, { fallthrough: false }));
}
var getPublicReceiptUrl = function (req, file) {
    if (file === null || file === void 0 ? void 0 : file.secure_url)
        return file.secure_url;
    if (typeof (file === null || file === void 0 ? void 0 : file.path) === "string") {
        if (file.path.startsWith("http"))
            return file.path;
        var filename = path_1.default.basename(file.path);
        var host_1 = req.get("host");
        var protocol_1 = req.protocol;
        return "".concat(protocol_1, "://").concat(host_1, "/uploads/").concat(filename);
    }
    var host = req.get("host");
    var protocol = req.protocol;
    return "".concat(protocol, "://").concat(host, "/uploads/").concat((file === null || file === void 0 ? void 0 : file.filename) || "file");
};
app.get("/health", function (_, res) {
    res.json({
        status: "OK",
        uploads: uploadsDir,
    });
});
app.get("/test-image", function (_, res) {
    var files = fs_1.default.readdirSync(uploadsDir);
    if (files.length === 0) {
        return res.status(404).json({
            error: "Belum ada file upload",
        });
    }
    res.sendFile(path_1.default.join(uploadsDir, files[0]));
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, pool.query("ALTER TABLE assets ADD COLUMN IF NOT EXISTS receipt_url TEXT")];
            case 1:
                _a.sent();
                return [4 /*yield*/, pool.query("ALTER TABLE assets ADD COLUMN IF NOT EXISTS images JSONB")];
            case 2:
                _a.sent();
                return [4 /*yield*/, pool.query("\n      UPDATE assets\n      SET images = CASE\n        WHEN receipt_url IS NULL THEN '[]'::jsonb\n        WHEN receipt_url LIKE '[' THEN receipt_url::jsonb\n        ELSE jsonb_build_array(receipt_url)\n      END\n      WHERE images IS NULL\n    ")];
            case 3:
                _a.sent();
                console.log("✅ Asset schema migration completed");
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                console.warn("Failed to ensure asset schema:", err_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); })();
// ==================== MIDDLEWARE AUTH ====================
var authMiddleware = function (req, res, next) {
    var _a;
    var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token tidak ditemukan" });
    }
    try {
        var decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (_b) {
        return res.status(401).json({ error: "Token tidak valid" });
    }
};
// ==================== AUTH ROUTES ====================
// Register user baru
app.post("/api/auth/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, passwordHash, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, username = _a.username, password = _a.password;
                if (!username || !password) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: "Username dan password wajib diisi" })];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 1:
                passwordHash = _b.sent();
                return [4 /*yield*/, pool.query("INSERT INTO users (username, password_hash) VALUES ($1, $2)", [username, passwordHash])];
            case 2:
                _b.sent();
                res.json({ message: "User berhasil dibuat" });
                return [3 /*break*/, 4];
            case 3:
                err_2 = _b.sent();
                if (err_2.code === "23505") {
                    return [2 /*return*/, res.status(400).json({ error: "Username sudah digunakan" })];
                }
                res.status(500).json({ error: "Gagal membuat user" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Login
app.post("/api/auth/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, result, user, isValid, token, err_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, username = _a.username, password = _a.password;
                return [4 /*yield*/, pool.query("SELECT * FROM users WHERE username=$1", [
                        username,
                    ])];
            case 1:
                result = _b.sent();
                user = result.rows[0];
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ error: "Username atau password salah" })];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password_hash)];
            case 2:
                isValid = _b.sent();
                if (!isValid) {
                    return [2 /*return*/, res.status(401).json({ error: "Username atau password salah" })];
                }
                token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "8h" });
                res.json({ token: token, username: user.username });
                return [3 /*break*/, 4];
            case 3:
                err_3 = _b.sent();
                res.status(500).json({ error: "Gagal login" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ==================== ASSET ROUTES (dilindungi auth) ====================
app.use(function (req, res, next) {
    console.log("".concat(req.method, " ").concat(req.originalUrl));
    next();
});
app.get("/api/assets", authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, assets, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT * FROM assets ORDER BY name ASC")];
            case 1:
                result = _a.sent();
                assets = result.rows.map(function (row) {
                    var _a;
                    var imageUrls = (0, imageUtils_1.normalizeImageUrls)((_a = row.images) !== null && _a !== void 0 ? _a : row.receipt_url);
                    var receiptUrl = imageUrls[0] || null;
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
                    };
                });
                res.json(assets);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                res.status(500).json({ error: "Gagal mengambil data" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post("/api/assets", authMiddleware, handleMultipartUpload, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var files, _a, id, name_1, category, purchaseDate, price, location_1, status_1, condition, description, uploadedUrls, imageUrls, receiptValue, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                files = Array.isArray(req.files)
                    ? (req.files.filter(function (file) { var _a; return (_a = file === null || file === void 0 ? void 0 : file.mimetype) === null || _a === void 0 ? void 0 : _a.startsWith("image/"); }))
                    : [];
                _a = req.body, id = _a.id, name_1 = _a.name, category = _a.category, purchaseDate = _a.purchaseDate, price = _a.price, location_1 = _a.location, status_1 = _a.status, condition = _a.condition, description = _a.description;
                uploadedUrls = files.map(function (file) { return getPublicReceiptUrl(req, file); });
                imageUrls = uploadedUrls.length > 0 ? uploadedUrls : [];
                receiptValue = (0, imageUtils_1.buildReceiptValue)(imageUrls);
                return [4 /*yield*/, pool.query("INSERT INTO assets (id, name, category, purchase_date, price, location, status, condition, description, receipt_url, images) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [
                        id,
                        name_1,
                        category,
                        purchaseDate,
                        price,
                        location_1,
                        status_1,
                        condition,
                        description,
                        receiptValue,
                        JSON.stringify(imageUrls),
                    ])];
            case 1:
                _b.sent();
                res.json({ id: id, receiptUrl: imageUrls[0] || null, images: imageUrls });
                return [3 /*break*/, 3];
            case 2:
                err_5 = _b.sent();
                console.error(err_5);
                res.status(500).json({ error: "Gagal menambah aset" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put("/api/assets/:id", authMiddleware, handleMultipartUpload, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, files, _a, name_2, category, purchaseDate, price, location_2, status_2, condition, description, images, existingImages, uploadedUrls, finalImages, receiptValue, fields, query, params, err_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                files = Array.isArray(req.files)
                    ? (req.files.filter(function (file) { var _a; return (_a = file === null || file === void 0 ? void 0 : file.mimetype) === null || _a === void 0 ? void 0 : _a.startsWith("image/"); }))
                    : [];
                _a = req.body, name_2 = _a.name, category = _a.category, purchaseDate = _a.purchaseDate, price = _a.price, location_2 = _a.location, status_2 = _a.status, condition = _a.condition, description = _a.description, images = _a.images;
                existingImages = (0, imageUtils_1.normalizeImageUrls)(images);
                uploadedUrls = files.map(function (file) { return getPublicReceiptUrl(req, file); });
                finalImages = uploadedUrls.length > 0 ? uploadedUrls : existingImages;
                receiptValue = (0, imageUtils_1.buildReceiptValue)(finalImages);
                fields = [
                    name_2,
                    category,
                    purchaseDate,
                    price,
                    location_2,
                    status_2,
                    condition,
                    description,
                ];
                query = "UPDATE assets SET name=$1, category=$2, purchase_date=$3, price=$4, location=$5, status=$6, condition=$7, description=$8";
                params = __spreadArray(__spreadArray([], fields, true), [id], false);
                if (receiptValue) {
                    query += ", receipt_url=$9, images=$10";
                    params.splice(8, 0, receiptValue, JSON.stringify(finalImages));
                }
                else {
                    query += ", images=$9";
                    params.splice(8, 0, JSON.stringify(finalImages));
                }
                query += " WHERE id=$" + params.length;
                return [4 /*yield*/, pool.query(query, params)];
            case 1:
                _b.sent();
                res.json({ success: true, receiptUrl: finalImages[0] || null, images: finalImages });
                return [3 /*break*/, 3];
            case 2:
                err_6 = _b.sent();
                console.error(err_6);
                res.status(500).json({ error: "Gagal update aset" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete("/api/assets/:id", authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, pool.query("DELETE FROM assets WHERE id=$1", [id])];
            case 1:
                _a.sent();
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                err_7 = _a.sent();
                res.status(500).json({ error: "Gagal hapus aset" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
var PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, "0.0.0.0", function () {
    console.log("\u2705 Server running on port ".concat(PORT));
});
// Graceful shutdown
process.on('SIGTERM', function () {
    console.log('SIGTERM received, shutting down...');
    pool.end().then(function () { return process.exit(0); });
});
process.on('uncaughtException', function (err) {
    console.error('Uncaught exception:', err);
    pool.end().then(function () { return process.exit(1); });
});
process.on('unhandledRejection', function (reason, promise) {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
