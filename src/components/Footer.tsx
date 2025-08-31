import React from 'react';
import { useStore } from '../contexts/StoreContext';

const Footer: React.FC = () => {
  const { settings } = useStore();
  return (
    <footer className="bg-gray-900 w-full py-8 mt-auto">
      <div className="max-w-md mx-auto px-4 text-center">
        {settings?.logo_url && (
          <img src={settings.logo_url} alt="Logo Tapetes & Co." className="mx-auto mb-4 h-10" />
        )}
        <p className="text-gray-200 text-base mb-4">
          {settings?.store_slogan || 'Tapetes & CO: Conforto e design aos seus pés.'}
        </p>
        <hr className="border-gray-700 mb-4" />
        <p className="text-gray-300 text-sm">
          {settings?.footer_text || '© 2025 Tapetes & CO. Todos os direitos reservados. Loja especializada em bem-estar!'}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
