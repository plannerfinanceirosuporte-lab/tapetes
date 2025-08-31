
import React from 'react';
import Footer from '../components/Footer';

const Sobre: React.FC = () => {
  const { settings } = useStore();
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="max-w-3xl w-full mx-auto px-4 py-10 flex flex-col items-center">
        {settings?.about_image_url && (
          <img src={settings.about_image_url} alt="Sobre Tapetes & Co." className="mb-8 rounded-xl shadow-lg w-full max-w-md object-cover" />
        )}
        <h1 className="text-4xl font-bold text-blue-900 mb-6 font-serif text-center">Sobre Nós</h1>
        <div className="text-lg text-blue-900 leading-relaxed font-sans bg-white rounded-xl shadow p-6">
          <p className="mb-4">A Tapetes & Co. é a materialização de um sonho que começou a ser tecido há mais de três décadas, com a paixão e o talento de nossa família, a família Silva. Tudo teve início na icônica Rua Augusta, em São Paulo, onde nosso avô, um artesão autodidata, abriu uma pequena oficina de restauração de tapetes. Foi ali, em meio a fibras de seda e lã, que ele não apenas consertava obras de arte, mas também absorvia a história e a alma de cada peça. Essa herança de respeito pelo ofício e pela qualidade inigualável é o DNA da nossa marca.</p>
          <p className="mb-4">Ao longo dos anos, nosso conhecimento se aprofundou e a nossa visão se expandiu. Nossa jornada nos levou a cruzar o globo, de Istambul, berço dos tapetes persas, às remotas aldeias de tecelagem na Índia e no Marrocos. Nessas viagens, construímos parcerias sólidas e de confiança com mestres artesãos que, como nosso avô, dedicam suas vidas à arte de tecer. Isso nos permitiu trazer para o Brasil uma coleção que é a perfeita fusão entre a tradição milenar e as tendências mais contemporâneas.</p>
          <p className="mb-4">Na Tapetes & Co., acreditamos que um tapete é mais do que um objeto de decoração; é o elo que une ambientes e inspira histórias. É por isso que cada tapete em nosso catálogo é escolhido a dedo, seguindo critérios rigorosos de qualidade, sustentabilidade e design. Para nós, cada peça é uma obra de arte que merece ser o coração do seu lar. Nossa missão é oferecer a você uma experiência de compra única e transparente, com a credibilidade de uma família que respira tapetes e o compromisso de levar para sua casa um produto que irá não apenas decorar, mas também enriquecer a sua vida.</p>
        </div>
      </div>
  <Footer />
    </div>
  );
};

export default Sobre;
