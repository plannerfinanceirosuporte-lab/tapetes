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
  const [menuTop, setMenuTop] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Ao abrir, detecta a altura do header fixo e posiciona o menu logo abaixo
  const handleOpen = () => {
    const header = document.querySelector('header');
    if (header) {
      const rect = header.getBoundingClientRect();
      setMenuTop(rect.top);
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
            className="fixed inset-0 z-[9998] bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
          {/* Menu lateral */}
          <div
            ref={menuRef}
            className={clsx(
              'fixed right-0 z-[99999] bg-white flex flex-col',
              'transition-transform duration-300 ease-in-out',
              'w-4/5 max-w-xs',
              'px-5 pb-8', // padding interno
              'rounded-bl-3xl rounded-tl-none', // apenas canto inferior esquerdo arredondado
              'shadow-xl', // sombra mais suave
              'border-l border-blue-100', // borda sutil à esquerda
              open ? 'translate-x-0' : 'translate-x-full',
              'sm:w-[320px]'
            )}
            style={{ maxWidth: 320, top: menuTop, height: `calc(100vh - ${menuTop}px)` }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-blue-100 pt-[48px]">
              <span className="font-bold text-blue-900 text-xl tracking-tight font-serif">Menu</span>
              <button
                className="text-blue-400 hover:text-blue-700 text-2xl font-bold transition focus:outline-none"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-7 w-7" />
              </button>
            </div>
            <nav className="flex flex-col gap-3 flex-1">
              {menuLinks.map(link => (
                <a
                  key={link.to}
                  href={link.to}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-semibold text-blue-900 font-sans shadow-sm hover:bg-blue-100 hover:text-blue-800 transition-colors w-full border border-transparent hover:border-blue-200"
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
