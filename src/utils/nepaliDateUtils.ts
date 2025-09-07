import NepaliDate from 'nepali-datetime';

/**
 * Get the current Nepali fiscal year
 * Fiscal year starts from Shrawan (month 3) and ends in Asar (month 2) of the next year
 * @returns {string} Current fiscal year in format "2080/81"
 */
export const getCurrentNepalieFiscalYear = (): string => {
  try {
    const today = new NepaliDate();
    const currentMonth = today.getMonth(); // 0-based indexing
    const currentYear = today.getYear();
    
    // If current month is Shrawan (3) or later, fiscal year is current/next
    // If current month is before Shrawan (0,1,2), fiscal year is previous/current
    if (currentMonth >= 3) {
      // From Shrawan to Chaitra - fiscal year is current/next year
      const nextYear = (currentYear + 1).toString().slice(-2);
      return `${currentYear}/${nextYear}`;
    } else {
      // From Baisakh to Asar - fiscal year is previous/current year
      const prevYear = currentYear - 1;
      const currentYearShort = currentYear.toString().slice(-2);
      return `${prevYear}/${currentYearShort}`;
    }
  } catch (error) {
    console.error('Error getting current Nepali fiscal year:', error);
    return '2081/82'; // Default fallback
  }
};

/**
 * Generate fiscal year options for dropdowns
 * @param {number} yearsBack - Number of years to go back from current
 * @param {number} yearsForward - Number of years to go forward from current
 * @returns {Array} Array of fiscal year options
 */
export const generateFiscalYearOptions = (yearsBack: number = 5, yearsForward: number = 2) => {
  const options = [];
  const currentFiscalYear = getCurrentNepalieFiscalYear();
  const [currentYear] = currentFiscalYear.split('/').map(y => parseInt(y));
  
  // Add past years
  for (let i = yearsBack; i > 0; i--) {
    const year = currentYear - i;
    const nextYear = (year + 1).toString().slice(-2);
    options.push({
      value: `${year}/${nextYear}`,
      label: `FY ${year}/${nextYear}`
    });
  }
  
  // Add current year
  options.push({
    value: currentFiscalYear,
    label: `FY ${currentFiscalYear}`
  });
  
  // Add future years
  for (let i = 1; i <= yearsForward; i++) {
    const year = currentYear + i;
    const nextYear = (year + 1).toString().slice(-2);
    options.push({
      value: `${year}/${nextYear}`,
      label: `FY ${year}/${nextYear}`
    });
  }
  
  return options;
};

/**
 * Get all available Nepali months with their numbers and names
 * @returns {Array} Array of month objects
 */
export const getAllNepaliMonths = () => {
  return [
    { value: 'all', label: 'All Months', number: 0 },
    { value: '1', label: 'Baisakh (बैशाख)', number: 1 },
    { value: '2', label: 'Jestha (जेष्ठ)', number: 2 },
    { value: '3', label: 'Asar (आषाढ)', number: 3 },
    { value: '4', label: 'Shrawan (श्रावण)', number: 4 },
    { value: '5', label: 'Bhadra (भाद्र)', number: 5 },
    { value: '6', label: 'Aswin (आश्विन)', number: 6 },
    { value: '7', label: 'Kartik (कार्तिक)', number: 7 },
    { value: '8', label: 'Mangsir (मंसिर)', number: 8 },
    { value: '9', label: 'Poush (पौष)', number: 9 },
    { value: '10', label: 'Magh (माघ)', number: 10 },
    { value: '11', label: 'Falgun (फाल्गुन)', number: 11 },
    { value: '12', label: 'Chaitra (चैत्र)', number: 12 }
  ];
};

/**
 * Get Nepali month name from number
 * @param {number} monthNumber - Month number (1-12)
 * @returns {string} Month name in English
 */
export const getNepaliMonthName = (monthNumber: number): string => {
  const months = [
    'Baisakh', 'Jestha', 'Asar', 'Shrawan',
    'Bhadra', 'Aswin', 'Kartik', 'Mangsir',
    'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  
  if (monthNumber >= 1 && monthNumber <= 12) {
    return months[monthNumber - 1];
  }
  return 'Invalid Month';
};

/**
 * Get current Nepali month
 * @returns {string} Current Nepali month number as string
 */
export const getCurrentNepaliMonth = (): string => {
  try {
    const nepaliDate = new NepaliDate();
    return (nepaliDate.getMonth() + 1).toString();
  } catch (error) {
    console.error('Error getting current Nepali month:', error);
    return '1'; // Default to Baisakh
  }
};

/**
 * Format a date to Nepali date string
 * @param {Date} englishDate - JavaScript Date object
 * @param {string} format - Format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted Nepali date string
 */
export const formatToNepaliDate = (englishDate: Date, format: string = 'YYYY-MM-DD'): string => {
  try {
    const nepaliDate = NepaliDate.fromEnglishDate(
      englishDate.getFullYear(),
      englishDate.getMonth(),
      englishDate.getDate()
    );
    return nepaliDate.format(format);
  } catch (error) {
    console.error('Error formatting to Nepali date:', error);
    return 'Invalid Date';
  }
};