import { cn } from "@/lib/utils";
import type { Admin } from "@/lib/types";

export function AdminAvatar({
  admin,
  size = "sm",
  className,
}: {
  admin: Admin | null;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeCls =
    size === "xs"
      ? "size-5 text-[9px]"
      : size === "sm"
      ? "size-6 text-[10px]"
      : "size-7 text-[11px]";

  if (!admin) {
    return (
      <span
        data-testid="admin-avatar-unassigned"
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-dashed border-mute/50 text-mute",
          sizeCls,
          className,
        )}
        title="Unassigned"
        aria-label="Unassigned"
      >
        —
      </span>
    );
  }

  return (
    <span
      data-testid={`admin-avatar-${admin.id}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-paper",
        sizeCls,
        className,
      )}
      style={{ backgroundColor: admin.color }}
      title={admin.name}
      aria-label={admin.name}
    >
      {admin.initials}
    </span>
  );
}
