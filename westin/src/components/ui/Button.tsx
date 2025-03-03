export default function Button({ children, onClick, type, disabled, className }: { 
    children: React.ReactNode, 
    onClick?: () => void, 
    type?: 'button' | 'submit', 
    disabled?: boolean, 
    className?: string 
  }) {
    return (
      <button
        type={type || 'button'}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-3 rounded-lg shadow-md transition-all duration-300 ${className}`}
      >
        {children}
      </button>
    );
  }