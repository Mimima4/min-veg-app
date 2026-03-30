"use client";

type Props = {
  action: () => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
  disabled?: boolean;
};

export default function ResetFamilyStateButton({
  action,
  label = "Reset family setup",
  confirmMessage = "Are you sure you want to reset this family setup? This will remove the current family container and connected child data, but keep your account and access state.",
  disabled = false,
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        const confirmed = window.confirm(confirmMessage);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center justify-center rounded-full border border-red-300 bg-white px-4 py-2 text-sm text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-red-300 disabled:hover:bg-white"
      >
        {label}
      </button>
    </form>
  );
}