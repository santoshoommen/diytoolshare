// Centralized listing categories: value ↔ label
// Keep this in sync with the Select options in the listing form.

export const CATEGORIES = [
  { value: 'General_DIY__Home_Improvement', label: 'General DIY & Home Improvement' },
  { value: 'Carpentry__Woodworking', label: 'Carpentry & Woodworking' },
  { value: 'Plumbing__Bathrooms', label: 'Plumbing & Bathrooms' },
  { value: 'Electrical__Lighting', label: 'Electrical & Lighting' },
  { value: 'Garden__Outdoor', label: 'Garden & Outdoor' },
  { value: 'Automotive__Garage', label: 'Automotive & Garage' },
  { value: 'Cleaning__Maintenance', label: 'Cleaning & Maintenance' },
  { value: 'Building__Masonry', label: 'Building & Masonry' },
  { value: 'Craft__Upcycling', label: 'Craft & Upcycling' },
];

export const valueToLabel = new Map(CATEGORIES.map(c => [c.value, c.label]));

export function getCategoryLabel(value) {
  return valueToLabel.get(value) || value || '';
}


