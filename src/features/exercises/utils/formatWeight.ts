/**
 * Formata o peso adicionando "cada lado" quando o exercício é unilateral
 */
type FormatWeightOptions = {
  includeSideLabel?: boolean;
};

export function formatWeight(
  weight: number,
  weightType?: "total" | "per-side",
  options?: FormatWeightOptions,
): string {
  const { includeSideLabel = true } = options ?? {};
  const formattedWeight = `${weight} kg`;

  if (weightType === "per-side" && includeSideLabel) {
    return `${formattedWeight} cada lado`;
  }

  return formattedWeight;
}

