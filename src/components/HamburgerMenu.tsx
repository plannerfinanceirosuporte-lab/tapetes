import React, { useState, useRef, useEffect } from 'react';
import { Menu, History, Percent, Mail, X } from 'lucide-react';
import clsx from 'clsx';

interface MenuLink {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const menuLinks: MenuLink[] = [
  { label: 'Histórico de Compras', to: '/historico', icon: <History className="h-5 w-5" /> },
  { label: 'Ofertas', to: '/ofertas', icon: <Percent className="h-5 w-5" /> },
  { label: 'Contato', to: '/contato', icon: <Mail className="h-5 w-5" /> },
  // Adicione mais links facilmente aqui
];

const HamburgerMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuTop, setMenuTop] = useState(0);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Ao abrir, detecta a altura do header e posiciona o menu logo abaixo
  const handleOpen = () => {
    const header = document.querySelector('header');
    if (header) {
      const rect = header.getBoundingClientRect();
      setMenuTop(rect.bottom + window.scrollY);
    } else {
      setMenuTop(0);
    }
    setOpen(true);
  };

  return (
    <>
      <button
        className="ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Abrir menu"
        onClick={handleOpen}
      >
        <Menu className="h-6 w-6" />
      </button>
      {/* Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
          {/* Menu lateral */}
          <div
            ref={menuRef}
            className={clsx(
              'fixed right-0 z-50 bg-white shadow-2xl flex flex-col',
              'transition-transform duration-300 ease-in-out',
              'w-4/5 max-w-xs',
              open ? 'translate-x-0' : 'translate-x-full',
              'sm:w-[320px]'
            )}
            style={{ maxWidth: 320, top: menuTop, height: `calc(100vh - ${menuTop}px)` }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="font-semibold text-blue-800 text-lg tracking-tight">Menu</span>
              <button
                className="text-blue-400 hover:text-blue-700 text-2xl font-bold transition focus:outline-none"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-7 w-7" />
              </button>
            </div>
            <nav className="flex flex-col gap-2 px-4 py-6 flex-1">
              {menuLinks.map(link => (
                <a
                  key={link.to}
                  href={link.to}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700 transition-colors w-full"
                  tabIndex={0}
                >
                  <span className="text-blue-700">{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default HamburgerMenu;
