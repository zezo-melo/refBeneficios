// utils/formatName.js

/**
 * Formata o nome do usuário:
 * 1. Capitaliza a primeira letra de cada palavra.
 * 2. Retorna no máximo o primeiro e o segundo nome.
 * * Exemplo: "luiz otavio silveira dos santos" -> "Luiz Otavio"
 */
export function formatName(name) {
  if (!name) return "";

  // 1. Capitaliza cada palavra do nome
  const capitalizedNames = name
    .trim()
    .split(/\s+/) // Usa regex para lidar com múltiplos espaços
    .filter(Boolean) // Remove strings vazias resultantes de múltiplos espaços
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

  // 2. Limita o array a um máximo de 2 elementos (primeiro e segundo nome)
  const limitedNames = capitalizedNames.slice(0, 2);

  // 3. Junta as palavras limitadas de volta em uma string
  return limitedNames.join(" ");
}