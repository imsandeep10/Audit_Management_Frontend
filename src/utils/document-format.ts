

export function formatDocumentType(type: string): string {
  return type
    .split('_')
    .map(word => {
      // Handle special acronym cases
      if (word === 'pan') return 'PAN';
      if (word === 'vat') return 'VAT';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}