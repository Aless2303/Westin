import React, { useState } from 'react';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('players');

  const tabs = [
    { id: 'players', label: 'Jucători' }

    //aici mai pot adauga daca vreau alte tabs exact in aceeasi maniera.
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4">
      <div className="bg-metin-dark border-2 border-metin-gold/60 rounded-lg w-full h-full sm:w-11/12 sm:h-5/6 md:w-4/5 md:h-4/5 max-w-6xl overflow-hidden shadow-2xl">
        {/* Header */}
        <header className="bg-gradient-to-r from-metin-brown to-metin-brown/80 px-3 sm:px-6 py-3 flex justify-between items-center border-b border-metin-gold/40">
          <h2 className="text-xl sm:text-2xl font-bold text-metin-gold">Panou Administrare</h2>
          <button
            onClick={onClose}
            className="text-metin-light/80 hover:text-metin-light text-xl p-2"
            aria-label="Închide"
          >
            ✕
          </button>
        </header>

        {/* Main content - Flex column on mobile, row on larger screens */}
        <div className="flex flex-col md:flex-row h-[calc(100%-3.5rem)]">
          {/* Sidebar - Horizontal tabs on mobile, vertical on larger screens */}
          <div className="md:w-64 bg-metin-dark border-b md:border-b-0 md:border-r border-metin-gold/30 overflow-x-auto md:overflow-x-visible">
            <ul className="flex md:flex-col py-1 md:py-2">
              {tabs.map((tab) => (
                <li key={tab.id} className="px-1 py-1 md:px-2">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap w-full text-center md:text-left px-3 py-2 md:px-4 md:py-3 rounded-md text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-metin-gold/20 text-metin-gold'
                        : 'text-metin-light/70 hover:bg-metin-gold/10 hover:text-metin-light'
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-metin-dark/90 p-3 sm:p-4 md:p-6 overflow-auto">
            {activeTab === 'players' && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-metin-gold mb-3 sm:mb-4">Gestionare Jucători</h3>
                <p className="text-metin-light text-sm sm:text-base">
                  Aici veți putea gestiona jucătorii, modifica atribute, bani, experiență, etc.
                  Funcționalitatea va fi implementată în viitor.
                </p>
                
                {/* Sample mobile-friendly player list placeholder */}
                <div className="mt-4 space-y-2">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="bg-metin-brown/30 rounded-md p-3 border border-metin-gold/20">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-metin-gold/90">Jucător {num}</span>
                        <button className="text-xs bg-metin-gold/30 hover:bg-metin-gold/50 text-metin-light px-2 py-1 rounded">
                          Editează
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm mt-2 text-metin-light/80">
                        <div className="grid grid-cols-2 gap-x-2">
                          <span>Nivel: 25</span>
                          <span>Clasa: Războinic</span>
                          <span>Bani: 15,000</span>
                          <span>XP: 12,540/14,000</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 