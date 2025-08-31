import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu } from 'lucide-react';

const HamburgerMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuLinks = [
    { label: 'Histórico de Compras', to: '/historico' },
    // Adicione mais links aqui se quiser
  ];
  const drawerHeight = 16 + menuLinks.length * 56 + 32;
  return (
    <>
      <button
        className="ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity" onClick={() => setOpen(false)}></div>
          <aside
            className="fixed right-0 w-72 max-w-full bg-white shadow-2xl flex flex-col animate-slideInRight rounded-l-2xl border-l border-blue-100 z-50"
            style={{
              height: `${drawerHeight}px`,
              bottom: '16px',
              top: 'auto',
            }}
          >
            <div className="flex items-center justify-end px-6 py-3 border-b border-gray-100">
              <button className="text-gray-400 hover:text-blue-600 text-2xl" onClick={() => setOpen(false)} aria-label="Fechar menu">×</button>
            </div>
            <nav className="flex flex-col gap-2 px-6 py-2">
              {menuLinks.map(link => (
                <button
                  key={link.to}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium text-base transition-colors w-full text-left"
                  onClick={() => { setOpen(false); navigate(link.to); }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </aside>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slideInRight { animation: slideInRight 0.25s cubic-bezier(.4,0,.2,1); }
          `}</style>
        </>
      )}
    </>
  );
};

export default HamburgerMenu;
