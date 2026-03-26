"use client";

type Props = {
  action: () => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
};

export default function ResetFamilyStateButton({
  action,
  label = "Reset family setup",
  confirmMessage = "Are you sure you want to reset this family setup? This will remove the current family container and connected child data, but keep your account and access state.",
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(confirmMessage);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full border border-red-300 bg-white px-4 py-2 text-sm text-red-700 transition hover:border-red-400 hover:bg-red-50"
      >
        {label}
      </button>
    </form>
  );
}