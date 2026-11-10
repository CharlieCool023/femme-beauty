type Titled = {
  customCategory?: string | null;
  service: { name: string };
};

/** What to show in a calendar block, list row or message for an appointment. */
export function appointmentTitle(appointment: Titled) {
  return appointment.customCategory
    ? `Custom · ${appointment.customCategory}`
    : appointment.service.name;
}

export function isCustomRequest(appointment: { customCategory?: string | null }) {
  return Boolean(appointment.customCategory);
}
