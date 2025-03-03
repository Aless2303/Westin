export default function Input({ type, value, onChange, placeholder, className }: { 
    type: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    placeholder: string, 
    className?: string 
  }) {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-metin-dark/40 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold focus:ring-2 focus:ring-metin-red transition-all duration-300 hover:border-metin-gold/40 ${className}`}
        placeholder={placeholder}
      />
    );
  }