import { useSwitch } from "@/hook/useSwitch";
import './switch.css'

interface Props {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
  size?: "sm" | "md" | "lg";
};

function Switcher({size = 'md',...restProps}:Props) {
  const { checked, a11yProps, disabled } = useSwitch(restProps);

  return (
    <button
      {...a11yProps}
      className={[
        "switch",
        `switch--${size}`,
        checked ? "is-on" : "is-off",
        disabled ? "is-disabled" : "",
      ].join(" ")}
      type="button"
    >
      <span className="switch__track" />
      <span className="switch__thumb" />
    </button>
  )
}
export default Switcher