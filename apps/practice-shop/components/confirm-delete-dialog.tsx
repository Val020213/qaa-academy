"use client"

// One dialog for every "are you sure?" delete in the app. Because it is
// shared, its buttons always have the same test ids:
// confirm-delete-button and confirm-delete-cancel.

interface Props {
  /** What will be deleted, shown in the question. */
  name: string
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteDialog({ name, busy, onConfirm, onCancel }: Props) {
  return (
    <div className="overlay">
      <div
        className="card dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        data-testid="confirm-delete-dialog"
      >
        <h2 id="confirm-delete-title">Delete “{name}”?</h2>
        <p className="muted">This cannot be undone.</p>
        <div className="actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onCancel}
            disabled={busy}
            data-testid="confirm-delete-cancel"
          >
            Cancel
          </button>
          <button
            className="button button-danger"
            type="button"
            onClick={onConfirm}
            disabled={busy}
            data-testid="confirm-delete-button"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
