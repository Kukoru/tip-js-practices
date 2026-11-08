export const variantNumber = 1;
const FILTERS_BY_VARIANT = Object.freeze({ 1: Object.freeze({ completed: false }) });
export function getVariantFilters(number) {
  if (!Number.isInteger(number) || !FILTERS_BY_VARIANT[number]) throw new RangeError("Неверный вариант");
  return { ...FILTERS_BY_VARIANT[number] };
}