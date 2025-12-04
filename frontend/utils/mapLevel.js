// mapLevel.ts (ou mapLevel.js)

/**
 * Mapeia a pontuação de um usuário para seu nível de ranking (Bronze, Prata, Ouro, Diamante).
 * @param points - A pontuação atual do usuário.
 * @returns O nível do usuário como string.
 */
export function mapLevel(points: number): string {
    if (points >= 700) return 'Diamante';
    if (points >= 400) return 'Ouro';
    if (points >= 200) return 'Prata';
    return 'Bronze';
  }