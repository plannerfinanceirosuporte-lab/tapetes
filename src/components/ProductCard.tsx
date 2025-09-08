import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockReviews } from '../lib/mockData';

interface ProductCardProps {
  product: Product;
}

import { useNavigate } from 'react-router-dom';

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductRating();
  }, [product.id]);

  const fetchProductRating = async () => {
    if (!isSupabaseConfigured()) {
      const productReviews = mockReviews.filter(r => r.product_id === product.id);
      if (productReviews.length > 0) {
        const average = productReviews.reduce((acc, review) => acc + review.rating, 0) / productReviews.length;
        setAverageRating(average);
        setReviewCount(productReviews.length);
      } else {
        const mockRating = 4 + Math.random();
        const mockCount = Math.floor(Math.random() * 10) + 5;
        setAverageRating(mockRating);
        setReviewCount(mockCount);
      }
      return;
    }

    try {
      const { data: reviews, error } = await supabase!
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id);

      if (error) throw error;

      if (reviews && reviews.length > 0) {
        const average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        setAverageRating(average);
        setReviewCount(reviews.length);
      } else {
        const mockRating = 4 + Math.random();
        const mockCount = Math.floor(Math.random() * 10) + 5;
        setAverageRating(mockRating);
        setReviewCount(mockCount);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      const mockRating = 4 + Math.random();
      const mockCount = Math.floor(Math.random() * 10) + 5;
      setAverageRating(mockRating);
      setReviewCount(mockCount);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div
      className="product-card fade-in cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/product/${product.id}`); }}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.stock_quantity > 50 && (
            <span className="modern-badge badge-new" style={{padding: '2px 10px', fontSize: '11px', borderRadius: '12px'}}>
              Novo
            </span>
          )}
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <span className="modern-badge badge-low-stock" style={{padding: '2px 10px', fontSize: '11px', borderRadius: '12px'}}>Últimas unidades</span>
          )}
        </div>
        {/* Botão de Favorito */}
        <button
          className="absolute top-3 right-3 z-20 bg-white/80 rounded-full p-2 shadow hover:bg-white"
          style={{ border: isFavorite ? '2px solid #4f46e5' : '2px solid #e5e7eb' }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsFavorite((fav) => !fav);
          }}
        >
          <Heart className={isFavorite ? 'text-primary' : 'text-gray-400'} fill={isFavorite ? '#4f46e5' : 'none'} />
        </button>
      </div>
      <div className="product-content flex flex-col">
        <h3 className="product-title line-clamp-2">
          {product.name}
        </h3>
        {/* Rating */}
        {reviewCount > 0 && (
          <div className="rating-stars">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`star ${star <= averageRating ? 'filled' : 'empty'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {averageRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto mb-2">
          <span className="product-price">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <span className="modern-badge badge-stock" style={{padding: '2px 10px', fontSize: '11px', borderRadius: '12px'}}>
            Em estoque
          </span>
        </div>
        <div className="product-actions mb-2 flex">
          <button
            onClick={e => {
              e.stopPropagation();
              if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
                (window as any).gtag('event', 'conversion', {'send_to': 'AW-17476381584/cDpeCLyQ-pIbEJDXsY1B'});
              }
              handleAddToCart(e);
            }}
            className="btn-primary flex-1"
          >
            <ShoppingCart className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};