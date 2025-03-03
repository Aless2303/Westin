// src/layouts/MainLayout.tsx
import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  // Update this path to where your image actually is
  backgroundImage = '/westin.jpg'  // Keep it in public for simplicity
}) => {
  return (
    <div 
      className="min-h-screen w-full h-full flex items-center justify-center p-4"
      style={{ 
        backgroundImage: `url('${backgroundImage}')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat', 
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(14, 9, 6, 0.4)',
        backgroundBlendMode: 'overlay'
      }}
    >
      {children}
    </div>
  );
};

export default MainLayout;