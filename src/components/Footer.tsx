
import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { Store, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { settings } = useStore();
  return (
    <footer className="bg-gray-900 w-full py-12 mt-auto">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="flex flex-row items-center justify-center gap-4 mb-6">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings.store_name} className="h-12 w-auto max-w-48 object-contain" />
          ) : (
            <Store className="h-10 w-10 text-blue-400" />
          )}
          <div className="flex flex-col items-start">
            <span className="text-2xl font-bold text-gray-100 mb-1">{settings?.store_name}</span>
            <p className="text-gray-300 leading-relaxed text-xl">{settings?.store_description}</p>
          </div>
        </div>
        <hr className="border-gray-700 mb-6" />
        <div className="mb-6">
          {(settings?.contact_phone || settings?.contact_email) && (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              {settings?.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span>{settings.contact_phone}</span>
                </div>
              )}
              {settings?.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span>{settings.contact_email}</span>
                </div>
              )}
            </div>
          )}
        </div>
  <p className="text-gray-400 text-lg mb-2">{settings?.footer_text || '© 2025 Tapetes & CO. Todos os direitos reservados. Loja especializada em bem-estar!'}</p>
      </div>
    </footer>
  );
};

export default Footer;
