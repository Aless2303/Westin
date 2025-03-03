import React from 'react';
import Image from 'next/image';



interface ItemType {
  name: string;
  image: string;
  level: number;
  stats: {
    attack?: number;
    defense?: number;
  };
}

interface EquipmentSlotProps {
  type: string;
  item: ItemType | null;
  slotName: string;
  size: 'small' | 'medium' | 'large';
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ type, item, slotName, size }) => {
  // Determină dimensiunile slotului bazate pe proprietatea size
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-16 h-16';
      case 'medium':
        return 'w-32 h-32';
      case 'large':
        return 'w-32 h-48';
      default:
        return 'w-16 h-16';
    }
  };

  return (
    <div 
      className={`relative ${getSizeClasses()} bg-metin-brown/40 border border-metin-gold/30 rounded-md overflow-hidden group`}
      title={item ? item.name : `Slot gol pentru ${slotName}`}
    >
      {/* Etichetă slot */}
      <div className="absolute top-0 left-0 right-0 bg-metin-dark/70 text-metin-light/70 text-xs text-center py-0.5 z-10">
        {slotName}
      </div>
      
      {/* Item imagine */}
      {item ? (
        <div className="absolute inset-0 flex items-center justify-center pt-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-contain p-1"
            />
          </div>
          
          {/* Nivel item */}
          <div className="absolute bottom-0 right-0 bg-metin-dark/80 text-metin-gold text-xs px-1 rounded-tl">
            LvL {item.level}
          </div>
        </div>
      ) : (
        // Slot gol cu iconiță de tip transparentă
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pt-4">
          <div className="text-metin-gold/50 text-4xl">+</div>
        </div>
      )}
      
      {/* Tooltip cu detalii - apare la hover */}
      {item && (
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 z-20">
          <p className="text-metin-gold text-xs font-medium">{item.name}</p>
          <div className="mt-1 text-metin-light/80 text-xs">
            {item.stats.attack ? <p>Atac: +{item.stats.attack}</p> : null}
            {item.stats.defense ? <p>Apărare: +{item.stats.defense}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentSlot;