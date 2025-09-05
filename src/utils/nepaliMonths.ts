// Nepali month utilities
export const NEPALI_MONTHS = [
  { value: 'all', label: 'All Months' },
  { value: '1', label: 'Baisakh (बैशाख)' },
  { value: '2', label: 'Jestha (जेष्ठ)' },
  { value: '3', label: 'Ashadh (आषाढ)' },
  { value: '4', label: 'Shrawan (श्रावण)' },
  { value: '5', label: 'Bhadra (भाद्र)' },
  { value: '6', label: 'Ashwin (आश्विन)' },
  { value: '7', label: 'Kartik (कार्तिक)' },
  { value: '8', label: 'Mangsir (मंसिर)' },
  { value: '9', label: 'Poush (पौष)' },
  { value: '10', label: 'Magh (माघ)' },
  { value: '11', label: 'Falgun (फाल्गुन)' },
  { value: '12', label: 'Chaitra (चैत्र)' }
] as const;

export const getNepaliMonthName = (monthValue: string): string => {
  const month = NEPALI_MONTHS.find(m => m.value === monthValue);
  return month ? month.label : 'Unknown Month';
};

export const getSelectedMonthLabel = (monthValue: string): string => {
  if (monthValue === 'all') return '';
  return getNepaliMonthName(monthValue);
};