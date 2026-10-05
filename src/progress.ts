// The learner's progress: which lessons are marked as completed.
// It is saved in localStorage, so it lives only in this browser.

const STORAGE_KEY = "qaa-academy:completed"

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    // localStorage is blocked or the saved value is broken: start from zero.
    return new Set()
  }
}

export function isCompleted(lessonPath: string): boolean {
  return read().has(lessonPath)
}

/** Flips the state of the lesson and returns the new value. */
export function toggleCompleted(lessonPath: string): boolean {
  const completed = read()
  if (completed.has(lessonPath)) completed.delete(lessonPath)
  else completed.add(lessonPath)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
  } catch {
    // No storage available: progress is not kept. Not a serious problem.
  }
  return completed.has(lessonPath)
}

export function completedCount(lessonPaths: string[]): number {
  const completed = read()
  return lessonPaths.filter((path) => completed.has(path)).length
}
