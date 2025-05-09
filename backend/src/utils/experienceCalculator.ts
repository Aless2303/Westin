/**
 * Calculează experiența necesară pentru a avansa la nivelul următor.
 * Folosește o formulă exponențială care face avansarea mai dificilă cu fiecare nivel.
 * 
 * @param level Nivelul curent al caracterului
 * @returns Experiența necesară pentru a avansa la nivelul următor
 */
export const calculateRequiredExp = (level: number): number => {
  // Baza de start - experiența necesară pentru avansarea de la nivelul 1 la 2
  const baseExp = 100;
  
  // Factorul de creștere - face avansarea din ce în ce mai dificilă
  const scaleFactor = 1.15;
  
  // Formula: baseExp * (scaleFactor^(level-1))
  // Acest lucru face ca experiența necesară să crească exponențial
  // Nivelurile inițiale sunt relativ ușoare, dar devin din ce în ce mai dificile
  const requiredExp = Math.round(baseExp * Math.pow(scaleFactor, level - 1));
  
  return requiredExp;
};

/**
 * Calculează procentul de experiență acumulat către nivelul următor.
 * 
 * @param currentExp Experiența curentă acumulată de la ultimul nivel
 * @param level Nivelul curent al caracterului
 * @returns Procentul de experiență (0-100) către nivelul următor
 */
export const calculateExpPercentage = (currentExp: number, level: number): number => {
  const requiredExp = calculateRequiredExp(level);
  const percentage = Math.min(100, Math.max(0, Math.floor((currentExp / requiredExp) * 100)));
  return percentage;
};

/**
 * Verifică dacă un caracter trebuie să avanseze nivel și actualizează datele.
 * 
 * @param currentExp Experiența curentă totală a caracterului
 * @param level Nivelul curent al caracterului
 * @returns Object cu nivelul actualizat și experiența rămasă
 */
export const checkLevelUp = (currentExp: number, level: number): { 
  newLevel: number, 
  remainingExp: number,
  justLeveledUp: boolean 
} => {
  let newLevel = level;
  let remainingExp = currentExp;
  let justLeveledUp = false;
  
  // Verifică dacă experiența este suficientă pentru avansare
  let requiredForNextLevel = calculateRequiredExp(newLevel);
  
  // Cât timp avem destulă experiență pentru avansare, continuăm să creștem nivelul
  while (remainingExp >= requiredForNextLevel) {
    remainingExp -= requiredForNextLevel;
    newLevel++;
    justLeveledUp = true;
    requiredForNextLevel = calculateRequiredExp(newLevel);
  }
  
  return {
    newLevel,
    remainingExp,
    justLeveledUp
  };
}; 