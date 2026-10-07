// Draws the Markdown of a lesson, and lets the reader enlarge its images and
// put its clips in full screen.
//
// This is the ONLY place in the app that uses dangerouslySetInnerHTML. It is
// safe here because the HTML comes from our own Markdown files in content/,
// written by the course authors. Never do this with text typed by a user.

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Maximize, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { renderMarkdown } from "@/lib/content"
import { currentLocale, t } from "@/lib/i18n"

interface ViewerImage {
  src: string
  alt: string
  caption: string
  svg: boolean
}

interface ClipControl {
  key: string
  video: HTMLVideoElement
  host: HTMLDivElement
}

export function LessonBody({ markdown }: { markdown: string }) {
  // Keep enhanced images and portal hosts intact when viewer state changes.
  const html = useMemo(() => ({ __html: renderMarkdown(markdown) }), [markdown])
  const locale = currentLocale()
  const root = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLImageElement>(null)
  const [image, setImage] = useState<ViewerImage | null>(null)
  const [clips, setClips] = useState<ClipControl[]>([])

  useEffect(() => {
    const content = root.current
    if (!content) return
    setImage(null)
    content.querySelectorAll<HTMLImageElement>(".shot > img").forEach((shot) => {
      shot.tabIndex = 0
      shot.setAttribute("role", "button")
      shot.setAttribute("aria-haspopup", "dialog")
      shot.setAttribute("aria-label", t("media.enlarge", { caption: shot.alt }))
      shot.dataset.testid = "lesson-image"
    })
    const controls: ClipControl[] = []
    if (document.fullscreenEnabled) {
      content.querySelectorAll<HTMLVideoElement>(".clip > video").forEach((video) => {
        if (typeof video.requestFullscreen !== "function") return
        const host = document.createElement("div")
        host.className = "clip-actions"
        video.after(host)
        controls.push({ key: `${video.src}-${controls.length}`, video, host })
      })
    }
    setClips(controls)
    return () => {
      controls.forEach(({ host }) => host.remove())
    }
  }, [html, locale])

  useEffect(() => {
    const viewer = dialog.current
    if (!image || !viewer) return
    const previousOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    const source = opener.current
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    viewer.showModal()
    closeButton.current?.focus()
    return () => {
      viewer.close()
      document.documentElement.style.overflow = previousOverflow
      document.body.style.overflow = previousBodyOverflow
      if (source?.isConnected) source.focus({ preventScroll: true })
    }
  }, [image])

  function openImage(target: EventTarget | null) {
    if (!(target instanceof HTMLImageElement) || !target.matches(".shot > img")) return
    opener.current = target
    setImage({
      src: target.currentSrc || target.src,
      alt: target.alt,
      caption: target.closest("figure")?.querySelector("figcaption")?.textContent ?? "",
      svg: new URL(target.src).pathname.endsWith(".svg"),
    })
  }

  async function fullscreen(clip: ClipControl) {
    try {
      await clip.video.requestFullscreen()
    } catch {
      // A browser or embedding policy can reject fullscreen despite exposing the API.
      setClips((current) => current.filter((item) => item !== clip))
    }
  }

  return (
    <>
      <div
        ref={root}
        className="typeset typeset-docs lesson-prose"
        data-testid="lesson-content"
        dangerouslySetInnerHTML={html}
        onClick={(event) => openImage(event.target)}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") &&
            event.target instanceof HTMLImageElement && event.target.matches(".shot > img")) {
            event.preventDefault()
            openImage(event.target)
          }
        }}
      />
      {clips.map((clip) => createPortal(
        <Button
          type="button"
          variant="outline"
          className="h-10"
          data-testid="clip-fullscreen"
          onClick={() => void fullscreen(clip)}
        >
          <Maximize aria-hidden="true" />
          {t("media.fullscreen")}
        </Button>,
        clip.host,
        clip.key
      ))}
      <dialog
        ref={dialog}
        className="media-viewer"
        data-testid="media-viewer"
        aria-label={t("media.viewer")}
        aria-describedby={image?.caption ? "media-caption" : undefined}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return
          const stops = event.currentTarget.querySelectorAll<HTMLElement>("button, [tabindex='0']")
          const first = stops[0]
          const last = stops[stops.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last?.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first?.focus()
          }
        }}
        onCancel={(event) => {
          event.preventDefault()
          setImage(null)
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setImage(null)
        }}
      >
        <div className="media-viewer-toolbar">
          <Button
            ref={closeButton}
            type="button"
            variant="outline"
            className="media-viewer-close h-11"
            data-testid="media-viewer-close"
            onClick={() => setImage(null)}
          >
            <X aria-hidden="true" />
            {t("media.close")}
          </Button>
        </div>
        {image && <>
          <div className="media-viewer-image" onClick={() => setImage(null)}>
            <img
              data-testid="media-viewer-image"
              className={image.svg ? "media-svg" : undefined}
              src={image.src}
              alt={image.alt}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
          <p id="media-caption" className="media-viewer-caption" tabIndex={image.caption ? 0 : undefined}>
            {image.caption}
          </p>
        </>}
      </dialog>
    </>
  )
}
