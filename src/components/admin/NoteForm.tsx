"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { saveNoteAction, type ActionState } from "@/app/admin/actions";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-outline btn-sm">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      Save note
    </button>
  );
}

export function NoteForm({ id, note }: { id: string; note: string | null }) {
  const [state, formAction] = useActionState(saveNoteAction, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="internalNote"
        defaultValue={note ?? ""}
        placeholder="Private note — lace type, cap size, what she liked last time…"
        className="field min-h-[96px] resize-y"
      />
      {state.success && <p className="text-[11px] text-[#3f6b45]">{state.success}</p>}
      {state.error && <p className="text-[11px] text-rose-deep">{state.error}</p>}
      <Submit />
    </form>
  );
}
