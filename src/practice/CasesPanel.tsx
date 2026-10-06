// Panel 2: a list of test cases. You can add a case, mark it as passed,
// delete it and filter the list. The list lives in React state, so it is lost
// when the page reloads.

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type CaseStatus = "pending" | "passed"
type CaseFilter = "all" | CaseStatus

interface TestCase {
  id: number
  title: string
  status: CaseStatus
}

export function CasesPanel() {
  const [cases, setCases] = useState<TestCase[]>([])
  const [nextId, setNextId] = useState(1)
  const [title, setTitle] = useState("")
  const [filter, setFilter] = useState<CaseFilter>("all")

  const visible = cases.filter((item) => filter === "all" || item.status === filter)
  const passed = cases.filter((item) => item.status === "passed").length

  function handleAdd(event: FormEvent) {
    event.preventDefault()
    const clean = title.trim()
    if (!clean) return

    setCases([...cases, { id: nextId, title: clean, status: "pending" }])
    setNextId(nextId + 1)
    setTitle("")
  }

  function setStatus(id: number, checked: boolean) {
    const status: CaseStatus = checked ? "passed" : "pending"
    setCases(cases.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  function remove(id: number) {
    setCases(cases.filter((item) => item.id !== id))
  }

  return (
    <Card data-testid="cases" className="gap-4 p-6">
      <CardHeader className="px-0">
        <CardTitle>
          <h2 className="text-base font-semibold">2. Test case list</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 px-0">
        <form onSubmit={handleAdd} data-testid="cases-form" className="flex items-end gap-3">
          <div className="grid flex-1 gap-1.5">
            <Label htmlFor="cases-title">New case</Label>
            <Input
              id="cases-title"
              type="text"
              name="title"
              autoComplete="off"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              data-testid="cases-input"
            />
          </div>
          <Button type="submit" className="h-8 px-4" data-testid="cases-add">
            Add
          </Button>
        </form>

        <div className="grid max-w-48 gap-1.5">
          <Label htmlFor="cases-filter">Show</Label>
          {/* A native <select>: Playwright's selectOption() works on it. */}
          <NativeSelect
            id="cases-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value as CaseFilter)}
            className="w-full"
            data-testid="cases-filter"
          >
            <NativeSelectOption value="all">All</NativeSelectOption>
            <NativeSelectOption value="pending">Pending</NativeSelectOption>
            <NativeSelectOption value="passed">Passed</NativeSelectOption>
          </NativeSelect>
        </div>

        <ul data-testid="cases-list">
          {visible.map((item) => (
            <li
              key={item.id}
              data-testid="cases-item"
              data-status={item.status}
              className="flex items-center justify-between gap-3 border-b py-2 text-sm"
            >
              <label className="flex items-center gap-2.5">
                {/* A native checkbox: Playwright's check() and toBeChecked() work on it. */}
                <input
                  type="checkbox"
                  checked={item.status === "passed"}
                  onChange={(event) => setStatus(item.id, event.target.checked)}
                  data-testid={`cases-toggle-${item.id}`}
                  className="size-4 shrink-0 cursor-pointer rounded-[4px] accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                <span
                  data-testid="cases-item-title"
                  className={item.status === "passed" ? "text-muted-foreground line-through" : ""}
                >
                  {item.title}
                </span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(item.id)}
                data-testid={`cases-delete-${item.id}`}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>

        <p hidden={visible.length > 0} data-testid="cases-empty" className="text-sm text-muted-foreground">
          There are no cases yet.
        </p>
        <p data-testid="cases-counter" className="font-mono text-[13px] text-muted-foreground">
          {passed} of {cases.length} passed
        </p>
      </CardContent>
    </Card>
  )
}
