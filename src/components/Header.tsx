import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Store } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const { settings } = useStore();
  const itemCount = getItemCount();
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <>
      {/* Banner acima do header */}

      {settings?.header_banner_url && (
        <div
          className="responsive-banner"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            zIndex: 50,
            background: 'var(--gray-100)',
            margin: 0,
            padding: 0,
          }}
        >
          <img
            src={settings.header_banner_url}
            alt="Banner"
            style={{ width: '100%', minWidth: '100%', display: 'block', objectFit: 'cover', margin: 0, padding: 0 }}
          />
        </div>
      )}

  <header className="w-full bg-white shadow-sm px-4 py-4 pt-4 sticky" style={{ top: 'var(--header-banner-height, 56px)', zIndex: 40, margin: 0, padding: 0 }}>
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
            {/* Cart e Menu */}
            <div className="flex items-center gap-2">
              <Link to="/cart" className="cart-button ml-2">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </Link>
              <HamburgerMenu />
            </div>
            {/* Drawer estilizado */}
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity" onClick={() => setMenuOpen(false)}></div>
                {(() => {
                  const menuLinks = [
                    {
                      label: 'Histórico de Compras',
                      icon: (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M9 6v12m6-12v12M4 6l1.5 14a2 2 0 002 2h9a2 2 0 002-2L20 6"/></svg>
                      ),
                      to: '/purchasehistory',
                    },
                  ];
                  const drawerHeight = 16 + menuLinks.length * 56 + 32; // padding + links + rodapé
                  return (
                    <aside
                      className="fixed top-3 right-0 w-72 max-w-full bg-white shadow-2xl flex flex-col animate-slideInRight rounded-l-2xl border-l border-blue-100 z-50"
                      style={{ height: `${drawerHeight}px` }}
                    >
                      <div className="flex items-center justify-end px-6 py-3 border-b border-gray-100">
                        <button className="text-gray-400 hover:text-blue-600 text-2xl" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">×</button>
                      </div>
                      <nav className="flex flex-col gap-2 px-6 py-2">
                        {menuLinks.map(link => (
                          <button
                            key={link.to}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium text-base transition-colors w-full text-left"
                            onClick={() => { setMenuOpen(false); navigate(link.to); }}
                          >
                            {link.icon}
                            {link.label}
                          </button>
                        ))}
                      </nav>
                      <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">{settings?.store_name}</div>
                    </aside>
                  );
                })()}
                <style>{`
                  @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                  }
                  .animate-slideInRight { animation: slideInRight 0.25s cubic-bezier(.4,0,.2,1); }
                `}</style>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </header>
    </>
  );
}