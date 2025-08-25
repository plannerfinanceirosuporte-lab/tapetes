import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const goPrev = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goNext = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  if (total === 0) return null;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full flex justify-center items-center">
        <button
          aria-label="Imagem anterior"
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-white"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <img
          src={images[current]}
          alt={`Imagem ${current + 1}`}
          className="max-h-80 w-auto object-contain rounded-lg shadow-lg"
          style={{ maxWidth: '100%' }}
        />
        <button
          aria-label="Próxima imagem"
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-white"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      <div className="flex gap-2 mt-3 flex-wrap justify-center">
        {images.map((img, idx) => (
          <button
            key={img + idx}
            onClick={() => setCurrent(idx)}
            className={`border rounded w-12 h-12 overflow-hidden focus:outline-none ${current === idx ? 'border-blue-500' : 'border-gray-300'}`}
            aria-label={`Selecionar imagem ${idx + 1}`}
          >
            <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
