import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function QuickActionCard({ title, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <Card 
      className={cn(
        "p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
        "hover:border-primary group"
      )}
      onClick={onClick}
    >
      <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
        {title}
      </span>
    </Card>
  );
}
