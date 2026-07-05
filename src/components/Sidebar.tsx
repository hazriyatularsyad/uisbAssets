import {
  LayoutDashboard,
  Box,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserPlus,
} from "lucide-react"
import { useEffect, useState, FormEvent } from "react"

const LOGO_SRC = "/image/uisbLogo.png"
const LOGO_ALT = "Universitas Islam Sumatera Barat"

interface SidebarProps {
  activeTab: "dashboard" | "assets"
  setActiveTab: (tab: "dashboard" | "assets") => void
  userEmail?: string
  onLogout?: () => void
  onRegister?: (username: string, password: string) => Promise<string>
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  userEmail = "admin@office",
  onLogout,
  onRegister,
  isCollapsed: isCollapsedProp,
  setIsCollapsed: setIsCollapsedProp,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true"
  })

  // Use prop if provided, otherwise use internal state
  const isCollapsed = isCollapsedProp ?? internalCollapsed
  const setIsCollapsed = setIsCollapsedProp ?? setInternalCollapsed

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [regUsername, setRegUsername] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("")
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(isCollapsed))
  }, [isCollapsed])

  const menuItems = [
    {
      id: "dashboard" as const,
      label: "Dasbor",
      icon: LayoutDashboard,
    },
    {
      id: "assets" as const,
      label: "Manajemen Aset",
      icon: Box,
    },
  ]

  const handleNav = (tab: "dashboard" | "assets") => {
    setActiveTab(tab)
    setIsOpen(false)
  }

  const initials = userEmail
    ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "AD"

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRegError(null)
    setRegSuccess(null)

    if (regPassword !== regPasswordConfirm) {
      setRegError("Password dan konfirmasi password tidak cocok.")
      return
    }

    if (!onRegister) return

    setRegLoading(true)
    const result = await onRegister(regUsername, regPassword)
    setRegLoading(false)

    if (result) {
      setRegError(result)
    } else {
      setRegSuccess("Akun berhasil dibuat.")
      setRegUsername("")
      setRegPassword("")
      setRegPasswordConfirm("")
    }
  }

  const closeRegisterModal = () => {
    setShowRegisterModal(false)
    setRegError(null)
    setRegSuccess(null)
    setRegUsername("")
    setRegPassword("")
    setRegPasswordConfirm("")
  }

  return (
    <>
      {/* Mobile Header */}
      <header
        id="mobile-header"
        className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden"
      >
        <div className="flex items-center gap-3">
          <img
            src={LOGO_SRC}
            alt={LOGO_ALT}
            className="h-9 w-auto max-w-[160px] object-contain"
          />
        </div>
        <button
          id="toggle-sidebar"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-none border cursor-pointer border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300 transition-all duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "md:w-[72px]" : "w-64 md:w-64"}`}
      >
        {/* Logo/Header */}
        <div
          className={`relative flex border-b border-zinc-900 ${
            isCollapsed
              ? "flex-col items-center gap-3 px-2 py-4"
              : "flex-col gap-2 px-6 py-6"
          }`}
        >
          {isCollapsed ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
              <img
                src={LOGO_SRC}
                alt={LOGO_ALT}
                className="h-10 w-auto max-w-none object-left object-contain"
                title={LOGO_ALT}
              />
            </div>
          ) : (
            <>
              <img
                src={LOGO_SRC}
                alt={LOGO_ALT}
                className="h-12 w-auto max-w-full object-contain"
              />
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Sistem Manajemen Aset
              </p>
            </>
          )}

          <button
            id="toggle-sidebar-collapse"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden cursor-pointer md:flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white ${
              isCollapsed
                ? "h-8 w-8"
                : "absolute right-3 top-1/2 h-7 w-7 -translate-y-1/2"
            }`}
            title={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            aria-label={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav
          id="sidebar-nav"
          className={`flex-1 space-y-1.5 py-6 ${isCollapsed ? "px-2" : "px-4"}`}
        >
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Menu Utama
            </p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                id={`nav-item-${item.id}`}
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
                className={`flex w-full items-center rounded-none text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isCollapsed
                    ? "justify-center px-2 py-3"
                    : "gap-3.5 px-3.5 py-3"
                } ${
                  isActive
                    ? isCollapsed
                      ? "bg-zinc-900 text-white"
                      : "border-l-2 border-white bg-zinc-900 pl-3 text-white"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-zinc-500"}
                />
                {!isCollapsed && item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer Profile */}
        <div
          id="sidebar-footer"
          className={`border-t border-zinc-900  ${isCollapsed ? "p-2" : "p-4"}`}
        >
          <div
            className={`flex items-center rounded-none border border-zinc-900 bg-zinc-900/30 ${
              isCollapsed ? "justify-center p-2" : "gap-3 p-3"
            }`}
            title={isCollapsed ? userEmail : undefined}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-zinc-700 bg-zinc-800 text-sm font-bold text-zinc-200">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  Administrator
                </p>
                <p className="truncate text-[10px] text-zinc-500">
                  {userEmail}
                </p>
              </div>
            )}
          </div>

          {/* Buat Akun Button */}
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-none border cursor-pointer border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white ${
              isCollapsed ? "px-2 py-2" : ""
            }`}
            title={isCollapsed ? "Buat Akun Baru" : undefined}
          >
            <UserPlus size={16} />
            {!isCollapsed && <span>Buat Akun Baru</span>}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className={`mt-1 flex w-full items-center justify-center gap-2 cursor-pointer rounded-none border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white ${
              isCollapsed ? "px-2 py-2" : ""
            }`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Register Modal */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeRegisterModal}
        >
          <div
            className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Buat Akun Baru
              </h2>
              <button
                type="button"
                onClick={closeRegisterModal}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-zinc-400"
                  htmlFor="reg-username"
                >
                  Username
                </label>
                <input
                  id="reg-username"
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                  placeholder="Masukkan username"
                  required
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-zinc-400"
                  htmlFor="reg-password"
                >
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                  placeholder="Masukkan password"
                  required
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-zinc-400"
                  htmlFor="reg-password-confirm"
                >
                  Konfirmasi Password
                </label>
                <input
                  id="reg-password-confirm"
                  type="password"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  className="w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                  placeholder="Ketik ulang password"
                  required
                />
              </div>

              {regError && <p className="text-sm text-red-500">{regError}</p>}
              {regSuccess && (
                <p className="text-sm text-emerald-500">{regSuccess}</p>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className="w-full border border-zinc-700 bg-zinc-800 px-4 py-2.5 cursor-pointer text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
              >
                {regLoading ? "Mendaftarkan..." : "Daftar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
