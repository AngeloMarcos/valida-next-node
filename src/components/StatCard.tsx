import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";

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
  sparklineData?: Array<{ value: number }>;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  iconColor = "muted", 
  trend,
  sparklineData 
}: StatCardProps) {
  const iconColorClass = {
    primary: "text-primary",
    muted: "text-muted-foreground",
    warning: "text-warning"
  }[iconColor];

  // Generate placeholder sparkline data if none provided
  const defaultSparkline = Array.from({ length: 7 }, (_, i) => ({
    value: Math.random() * 100 + 50
  }));

  const chartData = sparklineData || defaultSparkline;

  return (
    <Card className="transition-all duration-200 hover:shadow-md min-w-[170px] h-[110px] flex flex-col">
      <CardContent className="p-3 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", iconColorClass)} />
            <h3 className="text-[11px] font-medium text-muted-foreground truncate">{title}</h3>
          </div>
          {trend && (
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"} 
              className="h-4 px-1 text-[9px] font-semibold flex-shrink-0"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
          )}
        </div>
        
        <div className="text-xl font-bold tracking-tight">{value}</div>
        
        <div className="space-y-0.5">
          <div className="h-6 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {description && (
            <p className="text-[10px] text-muted-foreground truncate">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
