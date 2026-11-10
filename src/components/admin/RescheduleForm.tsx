"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarClock, Loader2 } from "lucide-react";
import { rescheduleAction, type ActionState } from "@/app/admin/actions";
import { formatTime } from "@/lib/time";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary btn-sm">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarClock className="h-3.5 w-3.5" />}
      Move appointment
    </button>
  );
}

export function RescheduleForm({
  id,
  defaultDate,
  defaultMinutes,
}: {
  id: string;
  defaultDate: string;
  defaultMinutes: number;
}) {
  const [state, formAction] = useActionState(rescheduleAction, initial);

  const options = Array.from({ length: 20 }).map((_, index) => 540 + index * 30);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className="label">
            New date
          </label>
          <input id="date" type="date" name="date" defaultValue={defaultDate} className="field" required />
        </div>
        <div>
          <label htmlFor="minutes" className="label">
            New time
          </label>
          <select id="minutes" name="minutes" defaultValue={defaultMinutes} className="field">
            {options.map((minutes) => (
              <option key={minutes} value={minutes}>
                {formatTime(minutes)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="text-[11px] text-rose-deep">{state.error}</p>}
      {state.success && <p className="text-[11px] text-[#3f6b45]">{state.success}</p>}

      <Submit />
    </form>
  );
}
