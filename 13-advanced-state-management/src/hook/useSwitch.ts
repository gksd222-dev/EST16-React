import { useId } from "react";

type UseSwitchOptions = {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (next: boolean) => void;
  id?: string;
  disabled?: boolean;
};

export function useSwitch(opts: UseSwitchOptions = {}) {
  const {
    defaultChecked = false,
    checked,
    onChange,
    id,
    disabled = false,
  } = opts;

  const reactId = useId();

  const isChecked = false;
  const setChecked = (_next: boolean) => {};
  const toggle = () => {};

  const a11yProps = {
    id: id ?? reactId,
    role: "switch" as const,
    "aria-checked": isChecked,
    "aria-disabled": disabled || undefined,
    tabIndex: disabled ? -1 : 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "ArrowLeft") setChecked(false);
      if (e.key === "ArrowRight") setChecked(true);
    },
    onClick: () => toggle(),
  };

  return { checked: isChecked, setChecked, toggle, a11yProps, disabled };
}
