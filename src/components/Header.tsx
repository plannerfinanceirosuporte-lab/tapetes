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
        <div className="w-full sticky top-0 z-50">
          <img
            src={settings.header_banner_url}
            alt="Banner"
            className="responsive-banner"
            style={{ maxHeight: '48px' }}
          />
        </div>
      )}

      <header className="modern-header py-2">
        <div className="modern-container px-2">
          <div className="header-content gap-2" style={{ minHeight: '48px' }}>
            {/* Logo */}
            <Link to="/" className="logo-container">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name}
                  className="logo-image"
                  style={{ maxHeight: '32px', maxWidth: '80px' }}
                />
              ) : (
                <Store className="h-6 w-6 text-blue-600" />
              )}
              <span className="logo-text hidden sm:block text-base">
                {settings?.store_name}
              </span>
            </Link>

            {/* Busca */}
            <div className="search-container hidden md:block" style={{ minWidth: '120px' }}>
              <Search className="search-icon h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="search-input text-sm px-2 py-1"
                style={{ height: '28px', fontSize: '0.95rem' }}
              />
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
              {/* Busca Mobile */}
              <button className="md:hidden cart-button p-1">
                <Search className="h-4 w-4" />
              </button>
              {/* Carrinho */}
              <Link to="/cart" className="cart-button p-1">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="cart-badge text-xs px-1 py-0.5">
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
};