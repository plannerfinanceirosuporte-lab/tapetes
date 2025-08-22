import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Star, Heart, Share2 } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { supabase, isSupabaseConfigured, Product, Category } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import { mockReviews } from '../lib/mockData';

  const { settings } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Galeria de imagens (banner + produtos)
  const galleryImages = [
    settings?.banner_url,
    ...products.slice(0, 3).map((p) => p.image_url)
  ].filter(Boolean);

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

  // Favoritar/Compartilhar (mock)
  const handleFavorite = (id: string) => {
    alert('Produto favoritado!');
  };
  const handleShare = (id: string) => {
    alert('Link do produto copiado!');
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
      {/* Galeria/Carrossel de imagens no topo */}
      {galleryImages.length > 0 && (
        <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center relative overflow-hidden">
          <img src={galleryImages[galleryIndex]} alt="Banner" className="object-cover w-full h-full transition-all duration-500" />
          {galleryImages.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow" onClick={() => setGalleryIndex((galleryIndex - 1 + galleryImages.length) % galleryImages.length)}>
                <ArrowRight className="h-6 w-6 rotate-180" />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow" onClick={() => setGalleryIndex((galleryIndex + 1) % galleryImages.length)}>
                <ArrowRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}

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

      {/* Categorias - horizontal, nome sem quebra, scroll invisível, padding top, título customizado */}
      <section className="modern-container pt-16 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Explore nossas categorias</h2>
        <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center min-w-[120px] justify-center">
              <span className="text-base font-semibold text-gray-700 text-center px-6 py-2 rounded-full bg-gray-100 whitespace-nowrap">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Produtos em destaque - grid 2 linhas, badges minimalistas, favoritar/compartilhar */}
      <section className="modern-container py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Produtos em Destaque</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum produto encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                {/* Badges minimalistas */}
                {product.stock_quantity > 50 && (
                  <span className="absolute top-3 left-3 modern-badge badge-new">Novo</span>
                )}
                {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                  <span className="absolute top-3 right-3 modern-badge badge-low-stock">Últimas unidades</span>
                )}
                {/* Favoritar/Compartilhar */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button className="btn-icon" onClick={() => handleFavorite(product.id)}><Heart className="h-5 w-5" /></button>
                  <button className="btn-icon" onClick={() => handleShare(product.id)}><Share2 className="h-5 w-5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/products" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
            Ver todos os produtos <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Benefícios */}
      <section className="modern-container py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Vantagens da Loja</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 p-6 bg-green-50 rounded-lg border border-green-200">
            <Truck className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-semibold text-green-800 text-base">Frete Grátis</p>
              <p className="text-xs text-green-600">Para todo Brasil</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-800 text-base">Compra Segura</p>
              <p className="text-xs text-blue-600">100% Protegida</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-6 bg-purple-50 rounded-lg border border-purple-200">
            <RotateCcw className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-800 text-base">Troca Fácil</p>
              <p className="text-xs text-purple-600">30 dias</p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos/Reviews */}
      <section className="modern-container py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Depoimentos de Clientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockReviews.slice(0, 3).map((review) => (
            <div key={review.id} className="p-6 bg-white rounded-lg shadow flex flex-col items-center">
              <Star className="h-6 w-6 text-yellow-400 mb-2" />
              <p className="text-gray-700 text-center mb-2">{review.comment}</p>
              <span className="text-sm font-semibold text-gray-900">{review.customer_name}</span>
              <span className="text-xs text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          ))}
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