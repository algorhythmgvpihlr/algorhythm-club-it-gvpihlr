"use client";

import { useState, useEffect } from "react";
import { EventImage } from "@prisma/client";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function EventGallery({ images }: { images: EventImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Close lightbox on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight' && lightboxIndex !== null) {
        setLightboxIndex((lightboxIndex + 1) % images.length);
      } else if (e.key === 'ArrowLeft' && lightboxIndex !== null) {
        setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
      }
    };
    
    if (lightboxIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, images.length]);

  if (!images || images.length === 0) return null;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div 
            key={img.id} 
            className="aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer"
            onClick={() => setLightboxIndex(idx)}
          >
            <img src={img.url} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform" />
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-50"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          
          {images.length > 1 && (
            <>
              <button 
                className="absolute left-4 md:left-8 text-white/70 hover:text-white bg-black/50 p-3 rounded-full transition-colors z-50"
                onClick={prevImage}
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              
              <button 
                className="absolute right-4 md:right-8 text-white/70 hover:text-white bg-black/50 p-3 rounded-full transition-colors z-50"
                onClick={nextImage}
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div 
            className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={images[lightboxIndex].url} 
              alt={`Gallery image ${lightboxIndex + 1}`} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
