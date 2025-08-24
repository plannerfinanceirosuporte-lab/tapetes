import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockReviews } from '../lib/mockData';

interface ProductCardFullProps {
  product: Product;
}

export const ProductCardFull: React.FC<ProductCardFullProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

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
    <div className="product-card fade-in">
  <div className="relative overflow-hidden rounded-xl shadow-md border border-gray-200 bg-white p-3 flex flex-col h-full">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock_quantity > 50 && (
            <span className="modern-badge badge-new" style={{padding: '2px 10px', fontSize: '11px', borderRadius: '12px'}}>
              Novo
            </span>
          )}
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <span className="badge-low-stock">Últimas unidades</span>
          )}
        </div>
      </div>
      <div className="product-content">
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
        <div className="flex items-center justify-between mt-auto mb-2" style={{minWidth: 0}}>
          <span className="modern-badge badge-stock" style={{padding: '2px 10px', fontSize: '11px', borderRadius: '12px', marginLeft: '8px', whiteSpace: 'nowrap'}}>
            Em estoque
          </span>
        </div>
        <div className="product-actions mb-2">
          <button
            onClick={handleAddToCart}
            className="btn-primary flex-1"
          >
            <ShoppingCart className="h-4 w-4" />
            Adicionar
          </button>
        </div>
        <p className="product-description line-clamp-2 mt-2">
          {product.description}
        </p>
      </div>
    </div>
  );
};
