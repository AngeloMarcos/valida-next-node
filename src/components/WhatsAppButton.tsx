import { useState } from "react";
import whatsappIcon from "@/assets/whatsapp-icon.svg";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppButton({ 
  phoneNumber = "5511999999999", 
  message = "Olá! Gostaria de mais informações." 
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl"
      aria-label="Abrir WhatsApp"
    >
      <img 
        src={whatsappIcon} 
        alt="WhatsApp" 
        className={`h-8 w-8 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
        style={{ filter: 'brightness(0) invert(1)' }}
      />
    </button>
  );
}
