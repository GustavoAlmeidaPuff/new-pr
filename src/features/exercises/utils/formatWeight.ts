/**
 * Formata o peso adicionando "cada lado" quando o exercício é unilateral
 */
export function formatWeight(weight: number, weightType?: "total" | "per-side"): string {
  const formattedWeight = `${weight} kg`;
  return weightType === "per-side" ? `${formattedWeight} cada lado` : formattedWeight;
}

