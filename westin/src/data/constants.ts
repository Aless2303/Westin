export const APP_NAME = 'Westin';
export const APP_SUBTITLE = 'Unde Vestul întâlnește Orientul';

// Constants for form validation
export const MIN_PASSWORD_LENGTH = 6;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Constante pentru sistemul de atribute
export const ATTRIBUTE_BASE_VALUES = {
  VITALITY_HP_BONUS: 15,        // +15 HP per punct de vitalitate
  INTELLIGENCE_CRIT_CHANCE: 0.1, // +0.1% șansă de critical per punct de inteligență
  INTELLIGENCE_CRIT_DAMAGE: 1,   // +1% damage critical per punct de inteligență
  STRENGTH_ATTACK_BONUS: 15,     // +15 attack per punct de strength
  DEXTERITY_DEFENSE_BONUS: 10    // +10 defense per punct de dexteritate
};

// Multiplicatori specifici claselor (cu 25% mai mare pentru clasa specializată)
export const CLASS_MULTIPLIERS = {
  Warrior: {
    vitality: 1.25,
    intelligence: 1.0,
    strength: 1.0,
    dexterity: 1.0
  },
  Saman: {
    vitality: 1.0,
    intelligence: 1.25,
    strength: 1.0,
    dexterity: 1.0
  },
  Sura: {
    vitality: 1.0,
    intelligence: 1.0,
    strength: 1.25,
    dexterity: 1.0
  },
  Ninja: {
    vitality: 1.0,
    intelligence: 1.0,
    strength: 1.0,
    dexterity: 1.25
  }
};