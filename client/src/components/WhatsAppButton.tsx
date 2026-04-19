'use client';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppButtonProps {
  number?: string;
}

export default function WhatsAppButton({ number = '9136543329' }: WhatsAppButtonProps) {
  const cleanNumber = number.replace(/\D/g, '');
  const href = `https://wa.me/${cleanNumber}?text=Hi%20Pratik%2C%20I%20would%20like%20to%20discuss%20a%20project.`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-green-500/40 transition-all duration-300 hover:scale-110"
    >
      <FaWhatsapp size={26} />
    </a>
  );
}
