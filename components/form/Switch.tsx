interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function Switch({ label, checked, onChange, id }: SwitchProps) {
  const switchId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={switchId}
      className="flex items-center gap-3 text-sm text-label cursor-pointer select-none"
    >
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          checked ? "bg-success" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label}
    </label>
  );
}
