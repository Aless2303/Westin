/**
 * Formatează un timestamp în format ora:minut sau "Acum" dacă este foarte recent
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  // Dacă e mai recent de 1 minut
  if (diffInSeconds < 60) {
    return 'Acum';
  }
  
  // Dacă e mai recent de 1 oră, arată minutele
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minut' : 'minute'}`;
  }
  
  // Pentru mesaje din aceeași zi, arăta ora:minute
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // Dacă e din aceeași zi
  const today = new Date();
  if (date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()) {
    return `${hours}:${minutes}`;
  }
  
  // Altfel afișează data scurtă
  return `${date.getDate()}/${date.getMonth() + 1}, ${hours}:${minutes}`;
} 