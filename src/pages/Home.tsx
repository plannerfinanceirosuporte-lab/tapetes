import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Phone, Mail, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase, Product, Category, isSupabaseConfigured, getSupabaseStatus } from '../lib/supabase';
import { mockProducts, mockCategories } from '../lib/mockData';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';

export const Home: React.FC = () => {
  const { settings } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    if (import.meta.env.DEV) {
      console.log('🔧 Supabase Status:', getSupabaseStatus());
      if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase não configurado. Usando dados de demonstração.');
        console.info('📖 Veja SUPABASE_INTEGRATION.md para instruções de configuração.');
      }
    }
  }, []);

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Using mock product data.');
      setProducts(mockProducts);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Using mock category data.');
      setCategories(mockCategories);
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
      console.error('Erro ao buscar categorias:', error);
      setCategories(mockCategories);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category_id === selectedCategory);

  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-skeleton w-32 h-32 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section Moderno */}
      <section 
        className="relative text-white py-20 md:py-32 overflow-hidden"
        style={{
          background: settings?.banner_url 
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${settings.banner_url})`
            : `linear-gradient(135deg, ${settings?.primary_color || '#4f46e5'} 0%, ${settings?.secondary_color || '#06b6d4'} 100%)`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="modern-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ color: settings?.home_title_color || '#fff' }}
            >
              {settings?.welcome_message || `Bem-vindo à ${settings?.store_name}`}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              {settings?.store_description}
            </p>
            {settings?.store_slogan && (
              <p className="text-base md:text-lg mb-10 opacity-80 italic max-w-xl mx-auto">
                "{settings.store_slogan}"
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

      {/* Categorias Modernas */}
      <section className="py-16 bg-white">
        <div className="modern-container">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 text-center">
            Explore por Categoria
          </h2>
          
            <div className="category-pills-scroll" style={{ display: 'flex', gap: 12, padding: '16px 0', width: '100%', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
              <style>{`
                @media (max-width: 767px) {
                  .category-pills-scroll {
                    justify-content: flex-start !important;
                    flex-wrap: nowrap !important;
                    overflow-x: auto !important;
                    white-space: nowrap !important;
                  }
                  .category-pills-scroll::-webkit-scrollbar { display: none; }
                  .category-pills-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                }
                @media (min-width: 768px) {
                  .category-pills-scroll {
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    overflow-x: visible !important;
                    white-space: normal !important;
                  }
                }
              `}</style>
              {/* Mobile: scroll horizontal, Desktop: centralizado */}
              <style>{`
                @media (min-width: 768px) {
                  .category-pills-scroll {
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    overflow-x: visible !important;
                    white-space: normal !important;
                  }
                }
                @media (max-width: 767px) {
                  .category-pills-scroll::-webkit-scrollbar { display: none; }
                  .category-pills-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                }
              `}</style>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              style={{ minWidth: 140, flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Todos os Produtos
            </button>
            {Array.isArray(categories) && categories.length > 0 && categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
                style={{ minWidth: 140, flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-16 bg-gray-50">
        <div className="modern-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubra nossa seleção especial de produtos com a melhor qualidade e preços incríveis
            </p>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Nenhum produto em destaque.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
                {filteredProducts.slice(0, Math.ceil(filteredProducts.length / 2)).map((product) => (
                  <div style={{ minWidth: 270, maxWidth: 350 }}>
                    <ProductCard key={product.id} product={product} />
                  </div>
                ))}
              </div>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pt-2">
                {filteredProducts.slice(Math.ceil(filteredProducts.length / 2), 8).map((product) => (
                  <div style={{ minWidth: 270, maxWidth: 350 }}>
                    <ProductCard key={product.id} product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary px-8 py-4 text-lg">
              Ver Todos os Produtos
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section className="py-16 bg-white">
        <div className="modern-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Qualidade Garantida</h3>
              <p className="text-gray-600">Produtos selecionados com a melhor qualidade do mercado</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">Receba seus produtos em até 7 dias úteis</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compra Segura</h3>
              <p className="text-gray-600">Pagamento 100% seguro e protegido</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Moderno */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="modern-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Informações da Loja */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                {settings?.logo_url ? (
                  <img 
                    src={settings.logo_url} 
                    alt={settings.store_name}
                    className="h-12 w-auto max-w-48 object-contain"
                  />
                ) : (
                  <Store className="h-10 w-10 text-blue-400" />
                )}
                <span className="text-2xl font-bold">{settings?.store_name}</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                {settings?.store_description}
              </p>
              {settings?.contact_address && (
                <p className="text-gray-400">{settings.contact_address}</p>
              )}
            </div>

            {/* Contato */}
            {(settings?.contact_phone || settings?.contact_email || settings?.contact_whatsapp) && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Contato</h3>
                <div className="space-y-4 text-gray-300">
                  {settings?.contact_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-blue-400" />
                      <span>{settings.contact_phone}</span>
                    </div>
                  )}
                  {settings?.contact_email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <span>{settings.contact_email}</span>
                    </div>
                  )}
                  {settings?.contact_whatsapp && (
                    <div className="flex items-center space-x-3">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.703"/>
                      </svg>
                      <span>WhatsApp: {settings.contact_whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Redes Sociais */}
            {(settings?.facebook_url || settings?.instagram_url || settings?.twitter_url) && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Siga-nos</h3>
                <div className="flex space-x-4">
                  {settings?.facebook_url && (
                    <a 
                      href={settings.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {settings?.instagram_url && (
                    <a 
                      href={settings.instagram_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.197-2.25-1.197-3.654 0-1.404.449-2.706 1.197-3.654.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948 1.197 2.25 1.197 3.654 0 1.404-.449 2.706-1.197 3.654-.749.948-1.9 1.559-3.197 1.559zm7.138 0c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.197-2.25-1.197-3.654 0-1.404.449-2.706 1.197-3.654.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948 1.197 2.25 1.197 3.654 0 1.404-.449 2.706-1.197 3.654-.749.948-1.9 1.559-3.197 1.559z"/>
                      </svg>
                    </a>
                  )}
                  {settings?.twitter_url && (
                    <a 
                      href={settings.twitter_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-lg">{settings?.footer_text}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};