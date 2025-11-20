import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function QuickActionCard({ title, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className="h-8 w-8 rounded-full border-border/50 bg-card hover:bg-accent hover:border-primary/50 transition-all shadow-sm"
          >
            <Icon className="h-3.5 w-3.5 text-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[10px]">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
