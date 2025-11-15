import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function WhatsAppFloatingButton() {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => navigate("/whatsapp")}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Abrir WhatsApp</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
