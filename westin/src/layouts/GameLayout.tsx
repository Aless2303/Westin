// src/layouts/GameLayout.tsx
import React from 'react';

interface GameLayoutProps {
  children: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  return (
    <div className="w-full h-screen overflow-hidden">
      {children}
    </div>
  );
};

export default GameLayout;