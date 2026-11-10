"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { saveCustomerNotesAction, type ActionState } from "@/app/admin/actions";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-outline btn-sm">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      Save client
    </button>
  );
}

export function CustomerForm({
  customer,
}: {
  customer: { id: string; name: string; email: string | null; notes: string | null };
}) {
  const [state, formAction] = useActionState(saveCustomerNotesAction, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={customer.id} />
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input id="name" name="name" defaultValue={customer.name} className="field" />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" defaultValue={customer.email ?? ""} className="field" />
      </div>
      <div>
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={customer.notes ?? ""}
          className="field min-h-[110px] resize-y"
          placeholder="Cap size, lace type, allergies, colour preferences, what she loved last time…"
        />
      </div>
      {state.success && <p className="text-[11px] text-[#3f6b45]">{state.success}</p>}
      {state.error && <p className="text-[11px] text-rose-deep">{state.error}</p>}
      <Submit />
    </form>
  );
}
