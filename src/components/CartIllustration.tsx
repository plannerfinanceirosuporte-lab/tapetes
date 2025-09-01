import React from "react";

// Ilustração SVG para Carrinho de Compras
const CartIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="8" y="16" width="48" height="32" rx="8" fill="#e0e7ff" />
    <rect x="16" y="24" width="32" height="16" rx="4" fill="#6366f1" />
    <circle cx="20" cy="52" r="4" fill="#6366f1" />
    <circle cx="44" cy="52" r="4" fill="#6366f1" />
    <rect x="24" y="28" width="16" height="8" rx="2" fill="#a5b4fc" />
    <rect x="28" y="32" width="8" height="4" rx="1" fill="#e0e7ff" />
  </svg>
);

export default CartIllustration;
