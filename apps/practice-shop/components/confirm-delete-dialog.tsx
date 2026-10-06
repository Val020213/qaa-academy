"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// One dialog for every "are you sure?" delete in the app. Because it is
// shared, its buttons always have the same test ids:
// confirm-delete-button and confirm-delete-cancel.
//
// The parent shows it by rendering it, and hides it by not rendering it.
// AlertDialog gives us for free: role="alertdialog", focus kept inside,
// Escape to cancel. Focus returns to the Delete button that opened it
// (see onCloseAutoFocus below).

interface Props {
  /** What will be deleted, shown in the question. */
  name: string
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteDialog({ name, busy, onConfirm, onCancel }: Props) {
  // Remember the button that was focused when the dialog opened (the Delete button).
  // Our dialog has no AlertDialogTrigger, so we give the focus back ourselves.
  const [opener] = useState(() => document.activeElement)

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        // Escape lands here with open = false. Ignore it while deleting.
        if (!open && !busy) onCancel()
      }}
    >
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          if (opener instanceof HTMLElement) opener.focus()
        }}
        data-testid="confirm-delete-dialog"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy} data-testid="confirm-delete-cancel">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={busy}
            onClick={(event) => {
              // Stop AlertDialog closing itself. The parent closes it when the delete is done.
              event.preventDefault()
              onConfirm()
            }}
            data-testid="confirm-delete-button"
          >
            {busy ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
