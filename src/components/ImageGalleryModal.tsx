import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface ImageGalleryModalProps {
  images: string[]
  assetName: string
  initialIndex?: number
  onClose: () => void
}

export default function ImageGalleryModal({
  images,
  assetName,
  initialIndex = 0,
  onClose,
}: ImageGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useEffect(() => {
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  if (images.length === 0) return null

  const currentImage = images[activeIndex]

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] bg-black/95 h-screen flex flex-col overflow-hidden"
      onClick={handleBackdropClick}
    >

      {/* Header */}
      <div className="relative z-10 flex shrink-0 items-center justify-between px-4 py-4">
        <div className="min-w-0 flex-1 pr-4">
          <p className="truncate text-sm font-semibold text-white">{assetName}</p>
          {images.length > 1 && (
            <p className="mt-0.5 text-xs text-zinc-300">
              {activeIndex + 1} / {images.length}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="shrink-0 rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-white/30"
          title="Tutup"
        >
          <X size={20} />
        </button>
      </div>

      {/* Image area */}
      <div
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden px-4 min-h-0"
        onClick={handleBackdropClick}
      >
        <img
          src={currentImage}
          alt={`${assetName} - gambar ${activeIndex + 1}`}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-2 sm:left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition hover:bg-black/60"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition hover:bg-black/60"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail bar */}
      {images.length > 1 && (
        <div className="relative z-10 shrink-0 px-4 py-4">
          <div className="flex gap-2 justify-center overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={`thumb-${index}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex(index)
                }}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition ${
                  index === activeIndex
                    ? "border-white"
                    : "border-transparent opacity-55 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // Render ke document.body via Portal untuk hindari stacking context parent
  return createPortal(modalContent, document.body)
}