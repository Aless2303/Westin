import React from 'react';

interface FormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({ children, title, subtitle }) => {
  return (
    <div className="relative w-full max-w-md p-8 bg-metin-dark/90 backdrop-blur-lg rounded-xl border-2 border-metin-gold/30 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slide-up">
      {/* Decorative elements */}
      <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-metin-gold/60 rounded-tl-lg"></div>
      <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-metin-gold/60 rounded-tr-lg"></div>
      <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-metin-gold/60 rounded-bl-lg"></div>
      <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-metin-gold/60 rounded-br-lg"></div>
      
      <div className="text-center mb-6">
        <h1 className="text-4xl font-serif text-metin-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse-slow">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-metin-light/80 font-medium italic text-lg">
            {subtitle}
          </p>
        )}
        <div className="mx-auto mt-4 w-16 h-16 bg-metin-red/30 rounded-full border border-metin-gold/50 flex items-center justify-center animate-spin-slow overflow-hidden">
          <span className="text-metin-gold text-2xl font-bold">⚔</span>
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default FormContainer;