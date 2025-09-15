import NepaliDate from 'nepali-datetime';

/**
 * Get current Nepali fiscal year
 * Fiscal year starts from Shrawan 1st to next year Asar 31/32
 * @returns {string} Current fiscal year in format "2082/83"
 */
export const getCurrentNepalieFiscalYear = (): string => {
  try {
    const today = new NepaliDate();
    const currentYear = today.getYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    
    // If current month is Shrawan (4) to Chaitra (12), fiscal year is currentYear/nextYear
    // If current month is Baisakh (1) to Asar (3), fiscal year is previousYear/currentYear
    if (currentMonth >= 4) {
      // From Shrawan to Chaitra
      const nextYear = currentYear + 1;
      return `${currentYear}/${String(nextYear).slice(-2)}`;
    } else {
      // From Baisakh to Asar
      const previousYear = currentYear - 1;
      return `${previousYear}/${String(currentYear).slice(-2)}`;
    }
  } catch (error) {
    console.error('Error getting current Nepali fiscal year:', error);
    return '2082/83'; // Default fallback
  }
};

/**
 * Get fiscal year from a given Nepali date
 * @param {Date|NepaliDate|string} date - Date to convert
 * @returns {string|null} Fiscal year in format "2082/83"
 */
export const getFiscalYearFromDate = (date: Date | NepaliDate | string): string | null => {
  try {
    let nepaliDate: NepaliDate;
    
    if (date instanceof NepaliDate) {
      nepaliDate = date;
    } else if (date instanceof Date) {
      nepaliDate = new NepaliDate(date);
    } else if (typeof date === 'string') {
      nepaliDate = new NepaliDate(new Date(date));
    } else {
      throw new Error('Invalid date format');
    }
    
    const year = nepaliDate.getYear();
    const month = nepaliDate.getMonth() + 1;
    
    if (month >= 4) {
      const nextYear = year + 1;
      return `${year}/${String(nextYear).slice(-2)}`;
    } else {
      const previousYear = year - 1;
      return `${previousYear}/${String(year).slice(-2)}`;
    }
  } catch (error) {
    console.error('Error getting fiscal year from date:', error);
    return null;
  }
};

interface FiscalYearDateRange {
  startDate: Date;
  endDate: Date;
  startDateNepali: NepaliDate;
  endDateNepali: NepaliDate;
}

/**
 * Get start and end dates for a fiscal year
 * @param {string} fiscalYear - Fiscal year in format "2082/83"
 * @returns {FiscalYearDateRange|null} Object with start and end dates
 */
export const getFiscalYearDateRange = (fiscalYear: string): FiscalYearDateRange | null => {
  try {
    const [startYear, endYearSuffix] = fiscalYear.split('/');
    const startYearNum = parseInt(startYear);
    const endYearNum = parseInt(`20${endYearSuffix}`);
    
    // Fiscal year starts from Shrawan 1st (month 4, day 1)
    const startDate = new NepaliDate(startYearNum, 3, 1); // Month is 0-indexed in constructor
    
    // Fiscal year ends on Asar 31/32 (month 3, last day)
    // Get the last day of Asar for the end year
    const endDate = new NepaliDate(endYearNum, 2, 32); // Try day 32 first
    try {
      endDate.getYear(); // Test if this date is valid
    } catch {
      // If day 32 is invalid, use day 31
      endDate.setDate(31);
    }
    
    return {
      startDate: startDate.getDateObject(),
      endDate: endDate.getDateObject(),
      startDateNepali: startDate,
      endDateNepali: endDate
    };
  } catch (error) {
    console.error('Error getting fiscal year date range:', error);
    return null;
  }
};

interface FiscalYearOption {
  value: string;
  label: string;
  isCurrentYear: boolean;
}

/**
 * Generate list of fiscal years for dropdown
 * @param {number} yearsBack - Number of years to go back from current
 * @param {number} yearsForward - Number of years to go forward from current
 * @returns {FiscalYearOption[]} Array of fiscal year objects with value and label
 */
export const generateFiscalYearOptions = (yearsBack: number = 10, yearsForward: number = 2): FiscalYearOption[] => {
  try {
    const currentFiscalYear = getCurrentNepalieFiscalYear();
    const [currentStartYear] = currentFiscalYear.split('/');
    const currentStartYearNum = parseInt(currentStartYear);
    
    const fiscalYears: FiscalYearOption[] = [];
    
    for (let i = yearsBack; i >= -yearsForward; i--) {
      const startYear = currentStartYearNum - i;
      const endYear = startYear + 1;
      const fiscalYear = `${startYear}/${String(endYear).slice(-2)}`;
      
      fiscalYears.push({
        value: fiscalYear,
        label: `FY ${fiscalYear}`,
        isCurrentYear: fiscalYear === currentFiscalYear
      });
    }
    
    return fiscalYears;
  } catch (error) {
    console.error('Error generating fiscal year options:', error);
    return [];
  }
};

/**
 * Check if a date falls within a specific fiscal year
 * @param {Date|string} date - Date to check
 * @param {string} fiscalYear - Fiscal year in format "2082/83"
 * @returns {boolean} True if date is within the fiscal year
 */
export const isDateInFiscalYear = (date: Date | string, fiscalYear: string): boolean => {
  try {
    const dateRange = getFiscalYearDateRange(fiscalYear);
    if (!dateRange) return false;
    
    const checkDate = new Date(date);
    return checkDate >= dateRange.startDate && checkDate <= dateRange.endDate;
  } catch (error) {
    console.error('Error checking if date is in fiscal year:', error);
    return false;
  }
};

/**
 * Get Nepali month name from month number
 * @param {number} monthNum - Month number (1-12)
 * @returns {string} Nepali month name
 */
export const getNepaliMonthName = (monthNum: number): string => {
  const months: Record<number, string> = {
    1: 'Baisakh',
    2: 'Jestha', 
    3: 'Ashadh',
    4: 'Shrawan',
    5: 'Bhadra',
    6: 'Ashwin',
    7: 'Kartik',
    8: 'Mangsir',
    9: 'Poush',
    10: 'Magh',
    11: 'Falgun',
    12: 'Chaitra'
  };
  
  return months[monthNum] || 'Unknown';
};

/**
 * Format Nepali date to string
 * @param {NepaliDate|Date} date - Date to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 */
export const formatNepaliDate = (date: NepaliDate | Date, format: string = 'YYYY-MM-DD'): string => {
  try {
    let nepaliDate: NepaliDate;
    
    if (date instanceof NepaliDate) {
      nepaliDate = date;
    } else {
      nepaliDate = new NepaliDate(date);
    }
    
    return nepaliDate.format(format);
  } catch (error) {
    console.error('Error formatting Nepali date:', error);
    return '';
  }
};
