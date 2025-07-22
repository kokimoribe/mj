import { Badge } from "@/components/ui/badge";

interface ActivityIndicatorProps {
  lastPlayed: string;
  className?: string;
}

export function ActivityIndicator({
  lastPlayed,
  className,
}: ActivityIndicatorProps) {
  const daysSinceLastGame = Math.floor(
    (Date.now() - new Date(lastPlayed).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getActivityStatus = () => {
    if (daysSinceLastGame <= 10) {
      return { status: "active", color: "bg-green-500", text: "🟢" };
    } else if (daysSinceLastGame <= 28) {
      return { status: "idle", color: "bg-yellow-500", text: "🟡" };
    } else {
      return { status: "inactive", color: "bg-red-500", text: "🔴" };
    }
  };

  const activity = getActivityStatus();

  return (
    <Badge variant="outline" className={className}>
      <span className="text-sm">{activity.text}</span>
    </Badge>
  );
}
