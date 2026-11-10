"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { quoteCustomRequestAction, type ActionState } from "@/app/admin/actions";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-rose btn-sm">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      Save quote & request deposit
    </button>
  );
}

export function QuoteForm({
  id,
  price,
  deposit,
}: {
  id: string;
  price: number;
  deposit: number;
}) {
  const [state, formAction] = useActionState(quoteCustomRequestAction, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="quote-price" className="label">
            Quoted price (₦)
          </label>
          <input
            id="quote-price"
            name="price"
            type="number"
            min={0}
            step={500}
            defaultValue={price || ""}
            className="field"
            placeholder="e.g. 65000"
            required
          />
        </div>
        <div>
          <label htmlFor="quote-deposit" className="label">
            Deposit to confirm (₦)
          </label>
          <input
            id="quote-deposit"
            name="depositDue"
            type="number"
            min={0}
            step={500}
            defaultValue={deposit || ""}
            className="field"
            placeholder="e.g. 20000"
          />
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-muted">
        A message with the quote and your bank details is queued in the Outbox.
      </p>
      {state.error && <p className="text-[11px] text-rose-deep">{state.error}</p>}
      {state.success && <p className="text-[11px] text-[#3f6b45]">{state.success}</p>}
      <Submit />
    </form>
  );
}
