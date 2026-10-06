// Routing without a library. The "page" is the part of the URL after `#`,
// for example `#/lesson/01-programming/05-functions` gives
// "/lesson/01-programming/05-functions". The hook returns it and renders again
// when it changes.

import { useEffect, useState } from "react"

function readPath(): string {
  return decodeURI(location.hash.replace(/^#/, "")) || "/"
}

export function useHashPath(): string {
  const [path, setPath] = useState(readPath)

  useEffect(() => {
    const update = () => setPath(readPath())
    window.addEventListener("hashchange", update)
    return () => window.removeEventListener("hashchange", update)
  }, [])

  return path
}
