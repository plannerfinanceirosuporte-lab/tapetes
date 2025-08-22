import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { supabase, isSupabaseConfigured, Product, Category } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';

export const Home: React.FC = () => {
  const { settings } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    if (!isSupabaseConfigured()) {
      setCategories([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const backgroundStyle = {
    background: settings?.banner_url
      ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${settings.banner_url})`
      : `linear-gradient(135deg, ${settings?.primary_color || '#4f46e5'} 0%, ${settings?.secondary_color || '#06b6d4'} 100%)`,
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
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

      {/* Categorias - horizontal, sem imagem */}
      <section className="modern-container py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Categorias</h2>
        <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center min-w-[120px] justify-center">
              <span className="text-base font-semibold text-gray-700 text-center px-4 py-2 rounded-full bg-gray-100">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Produtos em destaque - grid minimalista */}
      <section className="modern-container py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Produtos em Destaque</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum produto encontrado.</div>
        ) : (
          <div className="products-grid">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/products" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
            Ver todos os produtos <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer simples */}
      <footer className="bg-gray-900 text-gray-200 py-8 mt-12">
        <div className="modern-container text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} {settings?.store_name || 'TechStore'} - Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};