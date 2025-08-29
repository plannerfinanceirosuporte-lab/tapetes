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
        <div
          className="responsive-banner mb-0 md:mb-4"
          style={{ position: 'relative', zIndex: 50 }}
        >
          <img
            src={settings.header_banner_url}
            alt="Banner"
            style={{ width: '100%', minWidth: '100%', display: 'block', objectFit: 'cover' }}
          />
        </div>
      )}

  <header className="w-full bg-white shadow-sm px-4 py-4 pt-4 sticky top-0 z-40">
    <div className="modern-container">
      <div className="flex flex-row items-center justify-between w-full" style={{minHeight: '56px', paddingTop: '8px', paddingBottom: '8px'}}>
        {/* Desktop layout: logo left, search center, cart right */}
        <div className="w-full flex items-center justify-between">
          {/* Desktop: Centralize logo and cart, increase logo size, remove search */}
          <div className="hidden md:flex w-full items-center justify-center gap-16">
            <div className="flex w-full items-center justify-between px-8" style={{gap: '0'}}>
              <Link to="/" className="logo-container flex items-center" style={{alignItems: 'center'}}>
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={settings.store_name}
                    className="logo-image"
                    style={{width: '120px', maxHeight: '40px', objectFit: 'contain'}}
                    srcSet={`${settings.logo_url} 1x, ${settings.logo_url} 2x`}
                    sizes="(max-width: 768px) 120px, 220px"
                  />
                ) : (
                  <Store style={{width: '120px', maxHeight: '40px'}} className="w-auto text-blue-600 md:!w-[220px] md:!max-h-[56px]" />
                )}
                <span className="logo-text hidden sm:block ml-4 text-2xl lg:text-3xl">
                  {settings?.store_name}
                </span>
              </Link>
              <Link to="/cart" className="cart-button flex items-center">
                <ShoppingCart className="h-8 w-8" style={{verticalAlign: 'middle'}} />
                {itemCount > 0 && (
                  <span className="cart-badge text-lg" style={{verticalAlign: 'middle'}}>
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          {/* Mobile: keep previous layout */}
          <div className="flex md:hidden flex-row items-center justify-between w-full">
            {/* Logo */}
            <Link to="/" className="logo-container flex items-center justify-center">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name}
                  className="logo-image h-8 sm:h-10"
                />
              ) : (
                <Store className="h-8 sm:h-10 w-auto text-blue-600" />
              )}
              <span className="logo-text hidden sm:block ml-2">
                {settings?.store_name}
              </span>
            </Link>
            {/* Cart */}
            <Link to="/cart" className="cart-button ml-4">
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
    </div>
  </header>
    </>
  );
}