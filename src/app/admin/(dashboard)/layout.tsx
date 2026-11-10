import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const [pendingCount, queuedCount] = await Promise.all([
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.notification.count({ where: { status: "QUEUED" } }),
  ]);

  return (
    <AdminShell user={user} pendingCount={pendingCount} queuedCount={queuedCount}>
      {children}
    </AdminShell>
  );
}
