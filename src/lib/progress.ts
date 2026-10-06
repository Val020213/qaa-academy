// The learner's progress: which lessons are marked as completed.
// It is saved in localStorage, so it lives only in this browser.
// The app keeps the list in React state and calls these two functions to
// read it at start-up and to save it after every change.

const STORAGE_KEY = "qaa-academy:completed"

/** The paths of the completed lessons, for example "/lesson/01-programming/05-functions". */
export function loadCompleted(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    // localStorage is blocked or the saved value is broken: start from zero.
    return []
  }
}

export function saveCompleted(lessonPaths: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessonPaths))
  } catch {
    // No storage available: progress is not kept. Not a serious problem.
  }
}

/** How many of these lessons are in the completed list. */
export function countCompleted(lessonPaths: string[], completed: string[]): number {
  return lessonPaths.filter((path) => completed.includes(path)).length
}
