import React from 'react';
import { Link } from 'react-router-dom';

const Faq: React.FC = () => (
  <div className="bg-gray-50 min-h-screen flex flex-col">
    <div className="max-w-3xl w-full mx-auto px-4 py-10 flex flex-col items-center">
  <h1 className="text-4xl font-bold text-blue-900 mb-6 font-serif text-center">FAQ / Perguntas Frequentes</h1>
      <div className="text-lg text-blue-900 leading-relaxed font-sans bg-white rounded-xl shadow p-6 mb-6">
        <p>Encontre aqui as respostas para as dúvidas mais frequentes sobre nossa loja e nossos produtos. Nossa missão é tornar a sua experiência de compra a mais transparente e agradável possível.</p>

  </div>
  <h2 className="text-xl font-semibold mt-8 mb-2">Sobre Nossos Produtos</h2>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">Como é a qualidade dos tapetes da Tapetes & Co.?</p>
      <p>Nossos tapetes são fruto de uma curadoria rigorosa, baseada em anos de experiência no mercado de tapeçaria. Trabalhamos apenas com fornecedores e artesãos que compartilham nosso compromisso com a excelência. Cada tapete é produzido com materiais de alta qualidade, garantindo não apenas beleza e conforto, mas também durabilidade e resistência ao desgaste do dia a dia.</p>
    </div>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">Como escolher o tamanho ideal do meu tapete?</p>
      <p>A escolha do tamanho perfeito faz toda a diferença no ambiente. Para a sala de estar, o ideal é que o tapete seja grande o suficiente para que, no mínimo, os pés dianteiros do sofá e das poltronas fiquem sobre ele. Em salas de jantar, o tapete deve acomodar todas as cadeiras, mesmo quando afastadas. Para quartos, posicione o tapete de forma que ele se estenda por baixo da cama, deixando uma área confortável para pisar ao se levantar. Recomendamos sempre medir o espaço antes de finalizar a compra.</p>
    </div>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">Como faço a limpeza e manutenção do meu tapete?</p>
      <p>Para a limpeza diária, um aspirador de pó com bocal de escova é suficiente para remover poeira e detritos. Para manchas, o ideal é agir rapidamente: utilize um pano limpo e úmido com sabão neutro, aplicando-o suavemente sobre a mancha de fora para dentro. Para limpezas mais profundas, indicamos a contratação de profissionais especializados. Evite alagamentos e o uso de produtos químicos agressivos.</p>
    </div>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">Os tapetes da Tapetes & Co. são antiderrapantes?</p>
      <p>A maioria dos nossos tapetes é projetada para ter boa aderência ao piso. No entanto, para garantir a máxima segurança, especialmente em pisos lisos como porcelanato e mármore, recomendamos o uso de uma base antiderrapante, disponível em nossa loja. Isso evita acidentes e mantém o tapete sempre no lugar.</p>
    </div>

  <h2 className="text-xl font-semibold mt-8 mb-2">Sobre a Compra e o Pagamento</h2>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">Quais são as formas de pagamento aceitas?</p>
      <p>Para sua comodidade, aceitamos pagamentos via cartão de crédito, com a possibilidade de parcelamento em até 12 vezes sem juros, e Pix, que garante a confirmação da compra de forma instantânea e segura.</p>
    </div>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">O frete é grátis?</p>
      <p>Sim! Na Tapetes & Co., oferecemos frete grátis para todo o Brasil, sem valor mínimo de compra. Queremos que você tenha acesso aos nossos produtos de forma fácil e acessível, independentemente de onde esteja.</p>
    </div>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">É seguro comprar na Tapetes & Co.?</p>
      <p>Sua segurança é nossa prioridade. Utilizamos as mais modernas tecnologias de criptografia e proteção de dados para garantir que todas as suas informações pessoais e de pagamento estejam seguras. Além disso, seguimos rigorosamente a LGPD, garantindo total transparência no tratamento dos seus dados.</p>
    </div>

  <h2 className="text-xl font-semibold mt-8 mb-2">Sobre Envio, Entrega e Devolução</h2>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">Qual o prazo de entrega?</p>
      <p>O prazo de entrega é de 7 dias úteis após a confirmação do pagamento. Embalamos o seu pedido com o máximo de cuidado para que ele chegue em perfeitas condições.</p>
    </div>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">Como faço para rastrear meu pedido?</p>
      <p>Assim que seu pedido for despachado, você receberá um e-mail com o código de rastreamento e um link para acompanhar a entrega em tempo real, desde a nossa central até o seu endereço.</p>
    </div>
  <div className="mb-4 bg-white rounded-xl shadow p-4">
      <p className="font-bold">Qual a política de troca e devolução?</p>
      <p>Oferecemos uma política de troca e devolução estendida para garantir sua total satisfação. Se você não ficar 100% satisfeito(a), tem um prazo de 60 dias corridos após o recebimento do produto para solicitar a troca ou devolução, seja por arrependimento ou por defeito de fabricação. Para mais detalhes, acesse nossa <Link to="/politicadevolucao" className="text-blue-700 underline">Política de Troca e Devolução</Link>.</p>
      </div>
    </div>
  </div>
);

export default Faq;
