import { AlertTriangle } from "lucide-react";

import { ModalDialog } from "./ModalDialog";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog({
  cancelLabel = "취소",
  confirmLabel = "삭제",
  description,
  isOpen,
  isPending = false,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalDialog
      closeOnBackdrop={false}
      description={description}
      footer={
        <>
          <button
            className="rounded-lg border border-subtle px-4 py-2 text-sm font-semibold text-text-muted hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-lg border border-danger bg-danger-soft px-4 py-2 text-sm font-semibold text-danger-strong hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </>
      }
      isOpen={isOpen}
      onClose={onCancel}
      showCloseButton={!isPending}
      title={
        <span className="inline-flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </span>
          <span>{title}</span>
        </span>
      }
    />
  );
}
