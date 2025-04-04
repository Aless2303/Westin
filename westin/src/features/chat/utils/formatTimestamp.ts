/**
 * Formatează un timestamp în format ora:minut sau un format relativ dacă este recent
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  // Dacă e mai recent de 30 secunde
  if (diffInSeconds < 30) {
    return 'Acum';
  }
  
  // Dacă e mai recent de 1 minut
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }
  
  // Dacă e mai recent de 1 oră, arată minutele
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  }
  
  // Dacă e mai recent de 24 ore
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  }
  
  // Pentru mesaje mai vechi de o zi
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // Dacă e din aceeași săptămână
  const today = new Date();
  const dayDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (dayDiff < 7) {
    const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    return `${days[date.getDay()]} ${hours}:${minutes}`;
  }
  
  // Altfel afișează data scurtă
  return `${date.getDate()}/${date.getMonth() + 1} ${hours}:${minutes}`;
}