import React from 'react';
import { Link } from 'react-router-dom';

// Placeholders para imagens e dados
const categories = [
  { id: 1, name: 'Tapetes', image: 'https://placehold.co/300x200?text=Tapetes' },
  { id: 2, name: 'Capachos', image: 'https://placehold.co/300x200?text=Capachos' },
  { id: 3, name: 'Passadeiras', image: 'https://placehold.co/300x200?text=Passadeiras' },
];
const products = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: `Produto ${i + 1}`,
  image: 'https://placehold.co/300x300?text=Produto',
  price: (99.9 - i * 5).toFixed(2),
  promo: i === 0 || i === 1,
}));

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/NAVBAR é importado como componente global */}

      {/* HERO / Banner principal */}
      <section className="relative flex flex-col items-center justify-center text-center py-16 md:py-28 bg-gradient-to-br from-blue-600 to-blue-400 text-white">
        <img src="https://placehold.co/1200x400?text=Banner" alt="Banner principal" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Sua casa mais bonita começa aqui</h1>
          <p className="text-lg md:text-2xl mb-6 opacity-90">Tapetes, capachos e passadeiras para todos os estilos</p>
          <p className="italic opacity-80 mb-8">"+5k clientes satisfeitos em todo o Brasil"</p>
          <Link to="/products" className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-lg shadow-lg text-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 transition">Ver todos os produtos</Link>
        </div>
      </section>

      {/* CATEGORIAS PRINCIPAIS */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Categorias Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl shadow-md flex flex-col items-center p-6">
                <img src={cat.image} alt={cat.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-semibold mb-2">{cat.name}</h3>
                <Link to="/products" className="mt-auto btn-primary px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700">Ver produtos</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUTOS EM DESTAQUE */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Produtos em Destaque</h2>
            <Link to="/products" className="text-blue-600 hover:underline font-medium">Ver todos</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="bg-white rounded-xl shadow-md flex flex-col items-center p-4 relative group">
                <img src={prod.image} alt={prod.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                {prod.promo && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Promoção</span>}
                <h3 className="text-lg font-semibold mb-1 text-center">{prod.name}</h3>
                <span className="text-blue-700 font-bold text-lg mb-2">R$ {prod.price}</span>
                <button className="w-full btn-primary bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700">Adicionar ao carrinho</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL / BENEFÍCIOS */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center">
            <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 w-full md:w-1/3">
              <span className="text-3xl mb-2">🎉</span>
              <h4 className="font-bold text-lg mb-1">+5k clientes satisfeitos</h4>
              <p className="text-gray-600 text-center">Atendimento e qualidade aprovados em todo o Brasil</p>
            </div>
            <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 w-full md:w-1/3">
              <span className="text-3xl mb-2">🚚</span>
              <h4 className="font-bold text-lg mb-1">Frete grátis</h4>
              <p className="text-gray-600 text-center">Para compras acima de R$ 199 em todo o país</p>
            </div>
            <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 w-full md:w-1/3">
              <span className="text-3xl mb-2">⚡</span>
              <h4 className="font-bold text-lg mb-1">Entrega rápida</h4>
              <p className="text-gray-600 text-center">Receba seu pedido em poucos dias úteis</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Sobre nós</h3>
            <p className="text-gray-300 mb-4">Tapetes & Co. - Deixe sua casa mais aconchegante com nossos produtos exclusivos.</p>
            <div className="flex space-x-3 mt-2">
              <a href="#" aria-label="Instagram" className="hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.86.7-1.45.92-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41-.59-.22-1.01-.48-1.45-.92-.44-.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.634 2.2 15.25 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07 5.77.128 4.86.312 4.05.54c-.82.23-1.5.54-2.18 1.22-.68.68-.99 1.36-1.22 2.18-.228.81-.412 1.72-.47 3C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.28.242 2.19.47 3 .23.82.54 1.5 1.22 2.18.68.68 1.36.99 2.18 1.22.81.228 1.72.412 3 .47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.28-.058 2.19-.242 3-.47.82-.23 1.5-.54 2.18-1.22.68-.68.99-1.36 1.22-2.18.228-.81.412-1.72.47-3C23.988 15.668 24 15.264 24 12c0-3.264-.012-3.668-.07-4.948-.058-1.28-.242-2.19-.47-3-.23-.82-.54-1.5-1.22-2.18-.68-.68-1.36-.99-2.18-1.22-.81-.228-1.72-.412-3-.47C15.668.012 15.264 0 12 0z"/><path d="M12 5.838A6.162 6.162 0 1 0 12 18.162 6.162 6.162 0 1 0 12 5.838zm0 10.162A3.999 3.999 0 1 1 12 8.001a3.999 3.999 0 0 1 0 7.999zm7.2-11.162a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg></a>
              <a href="#" aria-label="Facebook" className="hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg></a>
              <a href="#" aria-label="WhatsApp" className="hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.703"/></svg></a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contato</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Email: <a href="mailto:contato@tapetesco.com" className="hover:underline">contato@tapetesco.com</a></li>
              <li>Telefone: <a href="tel:+5511999999999" className="hover:underline">(11) 99999-9999</a></li>
              <li>WhatsApp: <a href="#" className="hover:underline">(11) 98888-8888</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Links úteis</h3>
            <ul className="text-gray-300 space-y-2">
              <li><Link to="/about" className="hover:underline">Sobre nós</Link></li>
              <li><Link to="/contact" className="hover:underline">Contato</Link></li>
              <li><Link to="/privacy" className="hover:underline">Política de Privacidade</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Formas de pagamento</h3>
            <div className="flex space-x-3 mt-2">
              <img src="https://placehold.co/40x24?text=Visa" alt="Visa" className="rounded shadow" />
              <img src="https://placehold.co/40x24?text=MC" alt="Mastercard" className="rounded shadow" />
              <img src="https://placehold.co/40x24?text=Pix" alt="Pix" className="rounded shadow" />
              <img src="https://placehold.co/40x24?text=Boleto" alt="Boleto" className="rounded shadow" />
            </div>
          </div>
        </div>
        <div className="text-center text-gray-400 mt-8 text-sm">© {new Date().getFullYear()} Tapetes & Co. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
};