export function formatBp(systolic: number, diastolic: number) {
  return `${systolic}/${diastolic}`;
}

export function formatDateTime(value: string | number | Date) {
  return new Date(value).toLocaleString();
}

export function formatShortDate(value: string | number | Date) {
  return new Date(value).toLocaleDateString();
}
