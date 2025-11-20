import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  iconColor?: "primary" | "muted" | "warning";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, description, iconColor = "muted", trend }: StatCardProps) {
  const iconColorClass = {
    primary: "text-primary",
    muted: "text-muted-foreground",
    warning: "text-warning"
  }[iconColor];

  return (
    <Card className="transition-all duration-200 hover:shadow-md border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
        <CardTitle className="text-xs font-medium text-card-foreground">{title}</CardTitle>
        <Icon className={cn("h-3.5 w-3.5", iconColorClass)} />
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-1">
        <div className="text-lg font-bold text-card-foreground">{value}</div>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{description}</p>
        )}
        {trend && (
          <p className={`text-[10px] mt-0.5 leading-tight ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
