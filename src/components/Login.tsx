import { FormEvent, useState } from "react"

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>
  onRegister: (username: string, password: string) => Promise<boolean>
  error?: string | null
}

export default function Login({ onLogin, onRegister, error }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    if (mode === "register" && password !== passwordConfirm) {
      setLocalError("Password dan konfirmasi password tidak cocok.")
      return
    }

    setLoading(true)
    if (mode === "login") {
      await onLogin(username, password)
    } else {
      await onRegister(username, password)
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://picsum.photos/1920/1080')" }}
    >
      <div className="flex min-h-screen items-center justify-center bg-black/50 px-4 py-10">
        <div className="w-full max-w-md border border-zinc-800 bg-black/95 p-8 shadow-2xl backdrop-blur">
          <div className="mb-8 text-center">
            <h1 className="uppercase tracking-[0.3em] text-white text-3xl font-bold">
              UISB ASSETS
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-zinc-700"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-zinc-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Masukkan password"
                required
              />
            </div>

            {mode === "register" && (
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-zinc-700"
                  htmlFor="passwordConfirm"
                >
                  Konfirmasi Password
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Ketik ulang password"
                  required
                />
              </div>
            )}

            {(error || localError) && (
              <p className="text-sm text-red-600">{error || localError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-zinc-600 px-4 py-2.5 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Memuat..." : mode === "login" ? "Masuk" : "Daftar"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-zinc-400">
            {mode === "login" ? (
              <>
                {/* Belum punya akun?{" "} */}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-semibold text-white hover:underline cursor-pointer"
                >
                  Buat Akun
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold text-white hover:underline cursor-pointer"
                >
                  Masuk
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
