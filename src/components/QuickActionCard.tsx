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
            className="h-10 w-10 rounded-full border-border bg-card hover:bg-accent hover:border-primary transition-all"
          >
            <Icon className="h-4 w-4 text-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
