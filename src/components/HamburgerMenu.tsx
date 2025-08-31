import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, History } from 'lucide-react';

const HamburgerMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // Menu sempre fixo no topo, logo abaixo do header
  const menuTop = 68; // ajuste conforme altura do header
  const menuLinks = [
  { label: 'Histórico de Compras', to: '/historico', icon: <History className="h-5 w-5 text-blue-800" /> },
    // Adicione mais links aqui se quiser
  ];
  const drawerHeight = 16 + menuLinks.length * 56 + 32;

  const handleOpenMenu = () => {
    setOpen(true);
  };


  return (
    <>
      <button
        className="ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        aria-label="Abrir menu"
        onClick={handleOpenMenu}
      >
        <Menu className="h-6 w-6" />
      </button>
      {open && (
        <>
          {/* Sem overlay escuro ou desfoque */}
          <aside
            className="fixed right-0 w-72 max-w-full bg-white shadow-2xl flex flex-col animate-slideInRight rounded-l-2xl border-l-2 border-blue-200 z-50"
            style={{
              height: `${drawerHeight + 40}px`,
              top: `${menuTop}px`,
              right: 0,
              left: 'auto',
              bottom: 'auto',
              background: 'linear-gradient(135deg, #f8fbff 0%, #eaf3fa 100%)',
              paddingTop: '16px', // padding top extra
            }}
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-blue-100 bg-white/80 rounded-tl-2xl">
              <span className="font-semibold text-blue-800 text-lg tracking-tight">Menu</span>
              <button className="text-blue-400 hover:text-blue-700 text-2xl font-bold transition" onClick={() => setOpen(false)} aria-label="Fechar menu">×</button>
            </div>
            <nav className="flex flex-col gap-2 px-4 py-4 flex-1">
              {menuLinks.map(link => (
                <button
                  key={link.to}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/80 hover:bg-blue-100 text-blue-800 font-medium text-base transition-all w-full text-left shadow-sm border border-transparent hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => { setOpen(false); navigate(link.to); }}
                >
                  {link.icon && <span>{link.icon}</span>}
                  <span>{link.label}</span>
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
