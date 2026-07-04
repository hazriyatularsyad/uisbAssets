import { FormEvent, useState } from "react"

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>
  error?: string | null
}

export default function Login({ onLogin, error }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)
    setLoading(true)
    await onLogin(username, password)
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

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {localError && (
              <p className="text-sm text-red-600">{localError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-zinc-600 px-4 py-2.5 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Memuat..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
