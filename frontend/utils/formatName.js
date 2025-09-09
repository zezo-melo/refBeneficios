// utils/formatName.js

/**
 * Formata o nome do usuário deixando a primeira letra
 * de cada palavra em maiúscula e o resto em minúscula.
 * 
 * Exemplo: "roberto melo" -> "Roberto Melo"
 */
export function formatName(name) {
    if (!name) return "";
    
    return name
      .trim()
      .split(" ")
      .filter(Boolean) // remove espaços extras
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  }
  