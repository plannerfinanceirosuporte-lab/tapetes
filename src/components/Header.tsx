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

      <header className="modern-header">
        <div className="modern-container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo-container">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url} 
                  alt={settings.store_name}
                  className="logo-image"
                />
              ) : (
                <Store className="h-8 w-8 text-blue-600" />
              )}
              <span className="logo-text hidden sm:block">
                {settings?.store_name}
              </span>
            </Link>

            {/* Busca */}
            <div className="search-container hidden md:block">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="search-input"
              />
            </div>

            {/* Ações */}
            <div className="flex items-center gap-4">
              {/* Busca Mobile */}
              {/* Ícone de busca removido no mobile */}
              
              {/* Carrinho */}
              <Link to="/cart" className="cart-button">
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
};