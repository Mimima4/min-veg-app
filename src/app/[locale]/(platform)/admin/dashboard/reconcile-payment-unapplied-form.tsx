type ReconcilePaymentUnappliedFormProps = {
  action: () => Promise<void>;
};

export default function ReconcilePaymentUnappliedForm({
  action,
}: ReconcilePaymentUnappliedFormProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
      >
        Reconcile payment to billing
      </button>
    </form>
  );
}
