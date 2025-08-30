import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, Lock, Shield, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createPayment, validateCPF, formatCPF, formatPhone } from '../lib/nivusPay';

export const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerCpf: '',
    customerPhone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'PIX',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'customerCpf') {
      const formatted = formatCPF(value);
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    if (name === 'customerPhone') {
      const formatted = formatPhone(value);
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    if (name === 'zipCode') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    console.log('🚀 Iniciando processo de checkout...');

    // --- TOKEN LOGIC ---
    // Try to get the token from localStorage, or generate a new one if not present
    let orderToken = localStorage.getItem('order_token');
    if (!orderToken) {
      // Generate a UUID v4 (RFC4122 compliant)
      function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      orderToken = uuidv4();
      localStorage.setItem('order_token', orderToken);
    }

    if (!isSupabaseConfigured()) {
      alert('Sistema de pagamento não configurado. Entre em contato com o suporte.');
      setLoading(false);
      return;
    }

    try {
      if (!validateCPF(formData.customerCpf)) {
        throw new Error('CPF inválido');
      }
      
      console.log('📝 Dados do formulário:', formData);
      console.log('🛒 Itens do carrinho:', items);
      console.log('💰 Total:', total);
      
      if (!supabase) {
        throw new Error('Supabase não está configurado');
      }

      console.log('📦 Criando pedido no Supabase...');
      
      const fullAddress = `${formData.street}, ${formData.number}${formData.complement ? ', ' + formData.complement : ''}, ${formData.neighborhood}, ${formData.city} - ${formData.state}, CEP: ${formData.zipCode}`;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          customer_cpf: formData.customerCpf,
          customer_address: fullAddress,
          shipping_cost: 0,
          total_amount: total,
          payment_method: formData.paymentMethod.toLowerCase(),
          status: 'pending',
          order_token: orderToken // <-- vincula o pedido ao token
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Erro ao criar pedido:', orderError);
        throw new Error(`Erro ao criar pedido: ${orderError.message}`);
      }

      console.log('✅ Pedido criado com ID:', orderData.id);

      const orderItemsData = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
      }));

      console.log('📦 Criando itens do pedido:', orderItemsData);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error('❌ Erro ao criar itens do pedido:', itemsError);
        await supabase.from('orders').delete().eq('id', orderData.id).select();
        throw new Error(`Erro ao criar itens do pedido: ${itemsError.message}`);
      }

      console.log('✅ Itens do pedido criados com sucesso');

      console.log('💳 Processando pagamento com Nivus Pay...');
      
      const paymentData = {
        amount: total,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerCpf: formData.customerCpf.replace(/\D/g, ''),
        customerPhone: formData.customerPhone.replace(/\D/g, ''),
        orderId: orderData.id,
        items: items,
        paymentMethod: formData.paymentMethod as 'PIX' | 'CREDIT_CARD' | 'BILLET',
      };

      const paymentResult = await createPayment(paymentData);
      console.log('Resultado do pagamento:', paymentResult);

      if (paymentResult.success) {
        console.log('✅ Pagamento criado com sucesso!');
        
        clearCart();
        
        if (paymentResult.paymentId) {
          await supabase
            .from('orders')
            .update({
              payment_id: paymentResult.paymentId,
              payment_method: formData.paymentMethod.toLowerCase()
            })
            .eq('id', orderData.id);
        }
        
        console.log('🔄 Redirecionando para confirmação com pedido:', orderData.id);
        
        navigate('/order-confirmation', { 
          state: { 
            orderId: orderData.id,
            pixCode: paymentResult.pixCode,
            pixQrCode: paymentResult.pixQrCode,
            paymentId: paymentResult.paymentId,
            paymentMethod: formData.paymentMethod,
            expiresAt: paymentResult.expiresAt
          } 
        });
        return;
      } else {
        const errorMsg = paymentResult.error || 'Erro ao processar pagamento';
        console.error('❌ Erro no pagamento:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Erro completo no checkout:', {
        message: error.message,
        stack: error.stack
      });
      alert(`Erro ao finalizar pedido: ${error.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="modern-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Finalizar Pedido</h1>
          <p className="text-gray-600">Complete suas informações para finalizar a compra</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">
                  <User className="h-6 w-6 text-blue-600" />
                  Dados Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">CPF</label>
                    <input
                      type="text"
                      name="customerCpf"
                      value={formData.customerCpf}
                      onChange={handleInputChange}
                      required
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      placeholder="(11) 99999-9999"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Endereço de Entrega
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group md:col-span-2">
                    <label className="form-label">CEP</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      placeholder="00000-000"
                      maxLength={9}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Rua/Avenida</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      placeholder="Nome da rua"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Número</label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      required
                      placeholder="123"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Complemento</label>
                    <input
                      type="text"
                      name="complement"
                      value={formData.complement}
                      onChange={handleInputChange}
                      placeholder="Apto, casa, etc."
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Bairro</label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      required
                      placeholder="Nome do bairro"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Cidade</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Nome da cidade"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Selecione o estado</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="BA">Bahia</option>
                      <option value="GO">Goiás</option>
                      <option value="PE">Pernambuco</option>
                      <option value="CE">Ceará</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  Método de Pagamento
                </h3>
                
                <div className="space-y-4">
                  {/* PIX */}
                  <div 
                    className={`payment-method ${formData.paymentMethod === 'PIX' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'PIX' })}
                  >
                    <div className="payment-method-content">
                      <div className="payment-method-info">
                        <div className="payment-method-icon pix-icon">
                          PIX
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">PIX</h4>
                          <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                        </div>
                      </div>
                      <div className={`payment-radio ${formData.paymentMethod === 'PIX' ? 'selected' : ''}`}></div>
                    </div>
                  </div>
                </div>
                
                {/* Benefícios do PIX */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Vantagens do PIX</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Pagamento instantâneo 24h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Sem taxas adicionais</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Frete grátis para todo Brasil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Confirmação imediata</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <div className="pix-icon text-xs px-2 py-1 rounded">PIX</div>
                    <span>Finalizar Pedido com PIX</span>
                    <Shield className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="modern-card p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                🛒 Resumo do Pedido
              </h3>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 border-t pt-4">
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
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Segurança */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Compra 100% segura e protegida</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span>Seus dados estão protegidos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};