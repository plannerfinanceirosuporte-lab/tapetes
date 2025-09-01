import React from 'react';
import CartIllustration from '../components/CartIllustration';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';

export const Cart: React.FC = () => {
  const { items, total, updateQuantity, removeFromCart } = useCart();
  const { settings } = useStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="modern-card p-12 text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {settings?.message_empty_cart_text || 'Seu carrinho está vazio'}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Adicione alguns produtos incríveis para começar suas compras!
          </p>
          <Link to="/" className="btn-primary px-8 py-4">
            Explorar Produtos
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="modern-container">
        <div className="mb-8 flex items-center gap-4">
          <CartIllustration className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Carrinho de Compras</h1>
            <p className="text-gray-600">Revise seus itens antes de finalizar a compra</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2">
            <div className="modern-card">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Seus Produtos ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="cart-item-image"
                    />
                    
                    <div className="cart-item-content">
                      <h3 className="cart-item-title line-clamp-2">{item.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="quantity-btn"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                        <div className="text-right">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 transition-colors mt-1"
                            title="Remover item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="modern-card p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                📋 Resumo do Pedido
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frete:</span>
                  <span className="font-semibold text-green-600">Grátis</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="btn-success w-full py-4 text-center text-lg"
                >
                  {settings?.button_checkout_text || 'Finalizar Pedido'}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                
                <Link
                  to="/"
                  className="btn-secondary w-full py-3 text-center"
                >
                  {settings?.button_continue_shopping_text || 'Continuar Comprando'}
                </Link>
              </div>
              
              {/* Benefícios */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Frete grátis para todo Brasil</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Entrega em até 7 dias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};