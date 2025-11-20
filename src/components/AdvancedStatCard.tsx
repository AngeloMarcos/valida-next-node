import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./MiniSparkline";
import { Badge } from "@/components/ui/badge";

interface AdvancedStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: number[];
  progress?: number; // 0-100 for progress bar
  badge?: string;
}

export function AdvancedStatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-primary",
  trend,
  sparklineData,
  progress,
  badge
}: AdvancedStatCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-sm border-border/50 bg-card w-full h-[110px] overflow-hidden">
      <CardContent className="p-2.5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Icon className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">{title}</span>
          </div>
          {badge && (
            <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 leading-none">
              {badge}
            </Badge>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-between gap-2 min-h-0">
          <div className="flex flex-col justify-center min-w-0">
            <div className="text-xl font-bold text-card-foreground leading-none mb-1 truncate">{value}</div>
            {trend && (
              <div className={cn(
                "flex items-center gap-0.5 text-[9px] font-semibold leading-none",
                trend.isPositive ? "text-chart-1" : "text-chart-3"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-2.5 w-2.5 shrink-0" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 shrink-0" />
                )}
                <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end justify-center gap-1 shrink-0">
            {sparklineData && sparklineData.length > 0 && (
              <MiniSparkline 
                data={sparklineData} 
                color={trend?.isPositive ? 'oklch(var(--chart-1))' : 'oklch(var(--chart-3))'} 
                width={60}
                height={18}
              />
            )}
            {progress !== undefined && (
              <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-300 rounded-full",
                    progress >= 70 ? "bg-chart-1" : progress >= 40 ? "bg-chart-4" : "bg-chart-3"
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
