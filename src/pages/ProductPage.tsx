import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Plus, Minus, Heart, Share2, Truck, Shield, RotateCcw, Zap } from 'lucide-react';
import { supabase, Product, Review, isSupabaseConfigured } from '../lib/supabase';
import ImageGallery from '../components/ImageGallery';
import { mockProducts, mockReviews } from '../lib/mockData';
import { useCart } from '../contexts/CartContext';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Scroll para o topo ao abrir a página do produto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    if (product) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsFavorited(wishlist.includes(product.id));
    }
  }, [product]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      window.prompt('Copie o link do produto:', window.location.href);
    }
  };

  const handleFavorite = () => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updated;
    if (wishlist.includes(product.id)) {
      updated = wishlist.filter((id: string) => id !== product.id);
      setIsFavorited(false);
    } else {
      updated = [...wishlist, product.id];
      setIsFavorited(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Using mock product data.');
      const mockProduct = mockProducts.find(p => p.id === id);
      if (mockProduct) {
        setProduct(mockProduct);
      }
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
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Using mock reviews data.');
      const productReviews = mockReviews.filter(r => r.product_id === id);
      setReviews(productReviews);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setQuantity(1);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-skeleton w-32 h-32 rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="modern-card p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
          <p className="text-gray-600 mb-6">O produto que você está procurando não existe.</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Ver Todos os Produtos
          </button>
        </div>
      </div>
    );
  }

  // Simular múltiplas imagens para demonstração
  // Usar imagens do produto (image_urls: string[]), fallback para image_url
  const productImages = Array.isArray((product as any).image_urls) && (product as any).image_urls.length > 0
    ? (product as any).image_urls
    : product.image_url
    ? [product.image_url]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="modern-container">
        <div className="modern-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
            {/* Galeria de Imagens */}
            <div className="product-images-layout">
              <ImageGallery images={productImages} />
            </div>

            {/* Detalhes do Produto */}
            <div className="space-y-8">
              {/* Cabeçalho */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {product.stock_quantity > 50 && (
                    <span className="modern-badge badge-new" style={{padding: '2px 10px', fontSize: '11px', borderRadius: '12px'}}>
                      Novo
                    </span>
                  )}
                  <span className="modern-badge badge-stock" style={{padding: '2px 10px', fontSize: '11px', borderRadius: '12px'}}>
                    Em Estoque
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`star ${star <= averageRating ? 'filled' : 'empty'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {averageRating.toFixed(1)} ({reviews.length} avaliações)
                  </span>
                </div>
                <p className="modern-price-large mb-6">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              </div>

              {/* Descrição */}

              {/* Controle de Quantidade */}
              <div className="flex items-center gap-6">
                <div>
                  <label className="filter-label mb-2">Quantidade:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="quantity-btn"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="quantity-display text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="quantity-btn"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{product.stock_quantity} unidades</span> disponíveis
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-4">
                <button
                  onClick={() => {
                    addToCart(product);
                    navigate('/checkout');
                  }}
                  className="btn-success w-full py-4 text-lg"
                >
                  Comprar Agora
                  <Zap className="h-5 w-5" />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="btn-primary py-3"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Adicionar ao Carrinho
                  </button>
                  <button
                    className={`btn-secondary py-3 ${isFavorited ? 'bg-pink-100 text-pink-600' : ''}`}
                    onClick={handleFavorite}
                  >
                    <Heart className="h-5 w-5" />
                    {isFavorited ? 'Favoritado' : 'Favoritar'}
                  </button>
                </div>
                <button
                  className="btn-outline w-full py-3 mt-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                  Compartilhar Produto
                </button>
              </div>

              {/* Descrição abaixo dos botões */}
              <div className="bg-gray-50 rounded-lg p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Descrição do Produto</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Benefícios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Truck className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Frete Grátis</p>
                    <p className="text-xs text-green-600">Todo Brasil</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">Compra Segura</p>
                    <p className="text-xs text-blue-600">100% Protegida</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <RotateCcw className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-800 text-sm">Troca Fácil</p>
                    <p className="text-xs text-purple-600">30 dias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Avaliações */}
          <div className="border-t border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              ⭐ Avaliações dos Clientes
            </h3>
            
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Seja o primeiro a avaliar este produto!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="modern-card-minimal p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {review.customer_name && review.customer_name.trim() ? review.customer_name : 'Cliente'}
                      </h4>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`star ${star <= review.rating ? 'filled' : 'empty'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed mb-3">
                        "{review.comment}"
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};