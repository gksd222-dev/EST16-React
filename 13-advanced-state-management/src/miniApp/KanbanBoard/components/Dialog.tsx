import { useEffect } from "react";

interface DialogState {
  title: string;
  description: string;
}

interface Props {
  ref: React.RefObject<HTMLDialogElement | null>;
  label: string;
  color: string;
  state: DialogState;
  open?: boolean;
  onInput?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSave?: React.FormEventHandler<HTMLFormElement>;
  onClose?: () => void;
}

function Dialog({ ref, label, open, color, state, onInput, onSave, onClose }: Props) {
  useEffect(() => {
    const dialog = ref.current;
    let focusableElements: HTMLElement[] = [];

    const handleKeyTrap = (e: KeyboardEvent) => {
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const pressedShiftKey = e.shiftKey;
      const pressedTabKey = e.key === "Tab";
      const target = e.target as Element | null;

      if (!target) return;

      if (Object.is(target, first) && pressedShiftKey && pressedTabKey) {
        e.preventDefault();
        last.focus();
      }

      if (Object.is(target, last) && !pressedShiftKey && pressedTabKey) {
        e.preventDefault();
        first.focus();
      }
    };

    if (dialog && open) {
      const inputs = dialog.querySelectorAll("input, textarea");
      inputs.forEach((el) => {
        if ( el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ) {
          el.value = "";
        }
      });

      focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled)"
        )
      );

      dialog.addEventListener("keydown", handleKeyTrap);
    }

    return () => {
      dialog?.removeEventListener("keydown", handleKeyTrap);
    };
  }, [open, ref]);

  return (
    <dialog
      ref={ref}
      open={open}
      aria-modal="true"
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      className="shadow-xl p-5 rounded-xl border border-slate-200 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <h3 className="text-lg mb-2">
        <span className={`font-bold ${color}`}>{label}</span> 입력 폼
      </h3>
      <form
        method="dialog"
        className="flex flex-col gap-5 w-[360px] py-2"
        onSubmit={onSave}
      >
        <div className="flex gap-2 items-center justify-start">
          <label htmlFor="taskTitle">제목</label>
          <input
            type="text"
            id="taskTitle"
            name="title"
            className="p-1 border border-slate-300 rounded-md flex-1 hover:border-slate-500"
            defaultValue={state.title}
            onChange={onInput}
          />
        </div>
        <div className="flex gap-2 items-start justify-start">
          <label htmlFor="taskDescription" className="translate-y-0.5">
            설명
          </label>
          <textarea
            id="taskDescription"
            name="description"
            className="p-1 border border-slate-300 rounded-md flex-1 hover:border-slate-500"
            defaultValue={state.description}
            onChange={onInput}
          />
        </div>
        <div className="flex gap-2 items-center justify-end">
          <button
            type="submit"
            className="py-1 px-2 border border-slate-300 rounded-md hover:border-slate-500"
          >
            저장
          </button>
          <button
            type="reset"
            className="py-1 px-2 border border-slate-300 rounded-md hover:border-slate-500"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </form>
    </dialog>
  );
}
export default Dialog;
