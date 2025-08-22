import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

export const Home: React.FC = () => {
  const { settings } = useStore();
  const backgroundStyle = {
    background: settings?.banner_url
      ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${settings.banner_url})`
      : `linear-gradient(135deg, ${settings?.primary_color || '#4f46e5'} 0%, ${settings?.secondary_color || '#06b6d4'} 100%)`,
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  };
  return (
    <div className="min-h-screen">
      <section
        className="relative text-white py-20 md:py-32 overflow-hidden"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="modern-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {settings?.welcome_message || `Bem-vindo à ${settings?.store_name}`}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              {settings?.store_description}
            </p>
            {settings?.store_slogan && (
              <p className="text-base md:text-lg mb-10 opacity-80 italic max-w-xl mx-auto">
                {`"${settings.store_slogan}"`}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary px-8 py-4 text-lg">
                Explorar Produtos
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/products" className="btn-outline px-8 py-4 text-lg">
                Ver Ofertas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Phone, Mail, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase, Product, Category, isSupabaseConfigured, getSupabaseStatus } from '../lib/supabase';
import { mockProducts, mockCategories } from '../lib/mockData';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';
        </section>
      </div>
    );
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products" className="btn-primary px-8 py-4 text-lg">
                  Explorar Produtos
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/products" className="btn-outline px-8 py-4 text-lg">
          };