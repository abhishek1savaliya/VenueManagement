import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }) {
  return (
    <Badge variant={status === "active" ? "success" : "warning"}>
      {status}
    </Badge>
  );
}
