import React from "react";

// Ilustração minimalista de carrinho de compras
const CartIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="6" y="10" width="20" height="10" rx="3" fill="#6366f1" />
    <circle cx="10" cy="24" r="2" fill="#6366f1" />
    <circle cx="22" cy="24" r="2" fill="#6366f1" />
    <rect x="8" y="12" width="16" height="6" rx="2" fill="#a5b4fc" />
    <rect x="14" y="8" width="4" height="4" rx="1" fill="#6366f1" />
  </svg>
);

export default CartIllustration;
