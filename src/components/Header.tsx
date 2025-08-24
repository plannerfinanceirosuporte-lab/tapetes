import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Store } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';

export const Header: React.FC = () => {
  const { getItemCount } = useCart();
  const { settings } = useStore();
  const itemCount = getItemCount();

  return (
    <>
      {/* Banner acima do header */}
      {settings?.header_banner_url && (
        <div className="responsive-banner" style={{position: 'relative', zIndex: 50}}>
          <img
            src={settings.header_banner_url}
            alt="Banner"
            style={{width: '100%', minWidth: '100%', display: 'block', objectFit: 'cover'}}
          />
        </div>
      )}

  <header className="w-full bg-white shadow-sm px-4 py-4 pt-4 sticky top-0 z-40">
    <div className="modern-container">
      <div className="flex flex-row items-center justify-between w-full">
        {/* Esquerda: Logo */}
        <div className="flex items-center">
          <Link to="/" className="logo-container flex items-center">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.store_name}
                className="logo-image h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16"
              />
            ) : (
              <Store className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-auto text-blue-600" />
            )}
            <span className="logo-text hidden sm:block ml-2">
              {settings?.store_name}
            </span>
          </Link>
        </div>

        {/* Centro: Busca */}
        <div className="search-container hidden md:flex flex-1 items-center justify-center">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="search-input"
          />
        </div>

        {/* Direita: Carrinho */}
        <div className="flex items-center justify-end">
          <Link to="/cart" className="cart-button ml-6">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="cart-badge">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  </header>
    </>
  );
}