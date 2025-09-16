import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import NepaliDate from 'nepali-datetime';

// Nepali Functions (complete implementation from the first code)
const NepaliFunctions = (() => {
  const bsCalendarData: { [key: number]: number[] } = {
    1970: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1971: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    1972: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1973: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1974: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1975: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1976: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1977: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
    1978: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1979: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1980: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1981: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1982: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1983: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1984: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1985: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1986: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1987: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1988: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1989: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1990: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1991: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1992: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1993: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1994: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1995: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1996: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1997: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1998: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1999: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2000: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2001: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2002: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2003: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2004: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2005: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2006: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2007: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2008: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2009: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2010: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2011: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2012: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2013: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2014: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2015: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2016: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2017: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2018: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2019: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2020: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2021: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2022: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2023: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2024: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2025: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2026: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2027: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2028: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2029: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2030: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2031: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2032: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2033: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2034: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2035: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2036: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2037: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2038: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2039: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2040: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2041: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2042: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2043: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2044: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2045: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2046: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2047: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2048: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2049: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2050: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2051: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2052: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2053: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2054: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2055: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2056: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2057: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2058: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2059: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2060: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2061: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2062: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2063: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2064: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2065: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2066: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2067: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2068: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2069: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2070: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2071: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2072: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2073: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2074: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2075: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2077: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2078: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2079: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2081: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2083: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2085: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2086: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2087: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2088: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2090: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2091: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2092: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2094: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2095: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2096: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2097: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2098: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2099: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2100: [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30]
  };

  const minDate = { year: 1970, month: 1, day: 1 };
  const maxDate = { year: 2100, month: 12, day: 30 };

  const unicodeDigits: { [key: string]: string } = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };

  const numberDigits: { [key: string]: string } = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };

  const bsMonthsEn = ["Baisakh", "Jestha", "Ashar", "Shrawan", "Bhadra", "Ashoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
  const bsMonthsNp = ["बैशाख", "जेठ", "अषाढ", "श्रावण", "भाद्र", "आश्विन", "कार्तिक", "मङ्सिर", "पौष", "माघ", "फाल्गुन", "चैत्र"];
  const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysNp = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];
  const daysShortEn = ["S", "M", "T", "W", "T", "F", "S"];
  const daysShortNp = ["आ", "सो", "मं", "बु", "बि", "शु", "श"];

  interface NepaliDate {
    year: number;
    month: number;
    day: number;
  }

  const convertToUnicode = (num: number | string): string => {
    return num.toString().split('').map(digit => unicodeDigits[digit] || digit).join('');
  };

  const convertToNumber = (unicodeStr: string): string => {
    return unicodeStr.toString().split('').map(digit => numberDigits[digit] || digit).join('');
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return bsCalendarData[year] ? bsCalendarData[year][month - 1] : 30;
  };

  const getCurrentBsDate = (): NepaliDate => {
    try {
      const nepaliDate = new NepaliDate();
      return {
        year: nepaliDate.getYear(),
        month: nepaliDate.getMonth() + 1, // Convert to 1-based indexing
        day: nepaliDate.getDate()
      };
    } catch (error) {
      console.error('Error getting current BS date:', error);
      // Fallback to current date
      return {
        year: 2081, // Approximate current BS year
        month: 1,
        day: 1
      };
    }
  };

  const ad2bs = (adDate: NepaliDate): NepaliDate => {
    try {
      const nepaliDate = NepaliDate.fromEnglishDate(
        adDate.year,
        adDate.month - 1, // Convert to 0-based indexing
        adDate.day
      );
      return {
        year: nepaliDate.getYear(),
        month: nepaliDate.getMonth() + 1, // Convert to 1-based indexing
        day: nepaliDate.getDate()
      };
    } catch (error) {
      console.error('Error converting AD to BS:', error);
      // Fallback to simple conversion
      return {
        year: adDate.year + 56,
        month: adDate.month + 8 > 12 ? adDate.month - 4 : adDate.month + 8,
        day: adDate.day
      };
    }
  };

  const bs2ad = (bsDate: NepaliDate): NepaliDate => {
    try {
      const nepaliDate = new NepaliDate(bsDate.year, bsDate.month - 1, bsDate.day);
      // Get the timestamp and convert to Date
      const timestamp = nepaliDate.getTime();
      const englishDate = new Date(timestamp);
      return {
        year: englishDate.getFullYear(),
        month: englishDate.getMonth() + 1, // Convert to 1-based indexing
        day: englishDate.getDate()
      };
    } catch (error) {
      console.error('Error converting BS to AD:', error);
      // Fallback to simple conversion
      return {
        year: bsDate.year - 56,
        month: bsDate.month - 8 <= 0 ? bsDate.month + 4 : bsDate.month - 8,
        day: bsDate.day
      };
    }
  };

  const formatDate = (date: NepaliDate, format: string): string => {
    return format
      .replace('YYYY', date.year.toString().padStart(4, '0'))
      .replace('MM', date.month.toString().padStart(2, '0'))
      .replace('DD', date.day.toString().padStart(2, '0'));
  };

  const parseDate = (dateStr: string, format: string): NepaliDate | null => {
    if (!dateStr || !format) return null;

    let year = 0, month = 0, day = 0;
    const cleanStr = convertToNumber(dateStr);
    
    if (format === 'YYYY-MM-DD') {
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      }
    } else if (format === 'MM/DD/YYYY') {
      const parts = cleanStr.split('/');
      if (parts.length === 3) {
        month = parseInt(parts[0]);
        day = parseInt(parts[1]);
        year = parseInt(parts[2]);
      }
    }

    if (year && month && day && isValidBsDate({ year, month, day })) {
      return { year, month, day };
    }
    
    return null;
  };

  const isValidBsDate = (date: NepaliDate): boolean => {
    if (date.year < minDate.year || date.year > maxDate.year) return false;
    if (date.month < 1 || date.month > 12) return false;
    if (date.day < 1 || date.day > getDaysInMonth(date.year, date.month)) return false;
    return true;
  };

  const getFullDay = (date: NepaliDate): string => {
    try {
      const nepaliDate = new NepaliDate(date.year, date.month - 1, date.day);
      // Use the day of week from nepali date directly
      const dayOfWeek = nepaliDate.getDay();
      return daysEn[dayOfWeek];
    } catch (error) {
      console.error('Error getting day of week:', error);
      // Fallback to simple calculation
      const adDate = bs2ad(date);
      const jsDate = new Date(adDate.year, adDate.month - 1, adDate.day);
      return daysEn[jsDate.getDay()];
    }
  };

  const isLikelyBSDate = (dateStr: string): boolean => {
    const cleanStr = convertToNumber(dateStr);
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      return year >= 1970 && year <= 2100;
    }
    return false;
  };

  return {
    convertToUnicode,
    convertToNumber,
    getDaysInMonth,
    getCurrentBsDate,
    ad2bs,
    bs2ad,
    formatDate,
    parseDate,
    isValidBsDate,
    getFullDay,
    isLikelyBSDate,
    minDate,
    maxDate,
    bsMonthsEn,
    bsMonthsNp,
    daysEn,
    daysNp,
    daysShortEn,
    daysShortNp
  };
})();

// Date validation utilities
const formatBsDate = (bsDate: { year: number; month: number; day: number }): string => {
  return `${bsDate.year}-${(bsDate.month + 1).toString().padStart(2, '0')}-${bsDate.day.toString().padStart(2, '0')}`;
};

const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Try to parse and reformat other formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr; // Return original if can't parse
  }
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const adToBs = (adDate: Date): { year: number; month: number; day: number } | null => {
  if (isNaN(adDate.getTime())) return null;
  
  const adDateObj = {
    year: adDate.getFullYear(),
    month: adDate.getMonth() + 1,
    day: adDate.getDate()
  };
  
  return NepaliFunctions.ad2bs(adDateObj);
};

// Updated DatePicker Component
interface DatePickerProps {
  name?: string;
  label?: string;
  value?: string;
  onChange?: (date: string) => void;
  inputClassName?: string;
  className?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  options?: {
    calenderLocale?: "ne" | "en";
    valueLocale?: "ne" | "en";
  };
  convertToBS?: boolean;
  minAge?: number;
  type?: string;
}

const DatePicker: React.FC<DatePickerProps> = React.memo(
  ({
    label = "Date",
    value = "",
    onChange,
    type = "form",
    inputClassName = "form-control",
    className = "",
    required = false,
    id = "date",
    disabled = false,
    options = { calenderLocale: "ne", valueLocale: "en" },
    convertToBS = false,
    minAge = 0,
    
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate] = useState(() => NepaliFunctions.getCurrentBsDate());
    const [selectedDates, setSelectedDates] = useState<Array<{ year: number; month: number; day: number }>>([]);
    const [inputValue, setInputValue] = useState(value);
    const [viewYear, setViewYear] = useState(currentDate.year);
    const [viewMonth, setViewMonth] = useState(currentDate.month);
    const [viewMode, setViewMode] = useState<'calendar' | 'months' | 'years'>('calendar');
    const [yearRange, setYearRange] = useState(() => {
      const currentYear = currentDate.year;
      return { start: currentYear - 10, end: currentYear + 10 };
    });
    const [bsDate, setBsDate] = useState<string>("");
    const [isInitialized, setIsInitialized] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevValueRef = useRef<string>(value || "");
    const isUpdatingRef = useRef<boolean>(false);

    const isNepali = options.calenderLocale === 'ne';
    const months = isNepali ? NepaliFunctions.bsMonthsNp : NepaliFunctions.bsMonthsEn;
    const daysShort = isNepali ? NepaliFunctions.daysShortNp : NepaliFunctions.daysShortEn;

    // Memoized conversion function
    const convertToBSDate = useCallback(
      (dateValue: string) => {
        if (!convertToBS || !dateValue) return "";

        try {
          // If the date is already in BS format, don't convert
          if (NepaliFunctions.isLikelyBSDate(dateValue)) {
            return dateValue;
          }

          // Convert AD to BS
          const adDate = new Date(dateValue);
          if (isNaN(adDate.getTime())) return "";

          // Validate minAge if specified
          if (minAge > 0) {
            const today = new Date();
            const minAgeDate = new Date(today);
            minAgeDate.setFullYear(today.getFullYear() - minAge);

            if (adDate > minAgeDate) {
              console.warn(
                `Date does not meet minimum age requirement of ${minAge} years`
              );
            }
          }

          const bsDateObj = adToBs(adDate);
          if (bsDateObj) {
            const formattedBsDate = formatBsDate(bsDateObj);
            setBsDate(formattedBsDate);

            // Format BS date as YYYY-MM-DD for backend
            const bsYear = bsDateObj.year;
            const bsMonth = (bsDateObj.month + 1).toString().padStart(2, "0");
            const bsDay = bsDateObj.day.toString().padStart(2, "0");
            return `${bsYear}-${bsMonth}-${bsDay}`;
          }
        } catch (error) {
          console.warn("Error converting date to BS:", error);
        }

        return dateValue;
      },
      [convertToBS, minAge]
    );

    // Initialize component only once
    useEffect(() => {
      if (!isInitialized) {
        if (value) {
          const formattedValue = formatDateForDisplay(value);
          setInputValue(formattedValue);
          
          // Parse the date for calendar display
          const parsedDate = NepaliFunctions.parseDate(formattedValue, 'YYYY-MM-DD');
          if (parsedDate) {
            setSelectedDates([parsedDate]);
            setViewYear(parsedDate.year);
            setViewMonth(parsedDate.month);
          }
          
          if (convertToBS) {
            if (NepaliFunctions.isLikelyBSDate(formattedValue)) {
              setBsDate(formattedValue);
            } else {
              convertToBSDate(formattedValue);
            }
          }
        } else {
          // If no value provided, show current date
          const currentBsDate = NepaliFunctions.getCurrentBsDate();
          setViewYear(currentBsDate.year);
          setViewMonth(currentBsDate.month);
        }
        setIsInitialized(true);
      }
    }, [value, convertToBSDate, convertToBS, isInitialized]);

    // Handle external value changes
    useEffect(() => {
      if (
        isInitialized &&
        value !== prevValueRef.current &&
        !isUpdatingRef.current
      ) {
        prevValueRef.current = value || "";

        if (value !== inputValue) {
          const formattedValue = formatDateForDisplay(value || "");
          setInputValue(formattedValue);

          // Parse the date for calendar display
          const parsedDate = NepaliFunctions.parseDate(formattedValue, 'YYYY-MM-DD');
          if (parsedDate) {
            setSelectedDates([parsedDate]);
            setViewYear(parsedDate.year);
            setViewMonth(parsedDate.month);
          }

          if (convertToBS && formattedValue) {
            if (NepaliFunctions.isLikelyBSDate(formattedValue)) {
              setBsDate(formattedValue);
            } else {
              convertToBSDate(formattedValue);
            }
          }
        }
      }
    }, [value, convertToBSDate, convertToBS, isInitialized, inputValue]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isUpdatingRef.current) return;
      
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Try to parse the date as user types
      const cleanValue = NepaliFunctions.convertToNumber(newValue);
      const parsedDate = NepaliFunctions.parseDate(cleanValue, 'YYYY-MM-DD');
      
      if (parsedDate && NepaliFunctions.isValidBsDate(parsedDate)) {
        setSelectedDates([parsedDate]);
        setViewYear(parsedDate.year);
        setViewMonth(parsedDate.month);
        
        if (convertToBS) {
          const convertedDate = convertToBSDate(newValue);
          if (onChange && convertedDate) {
            isUpdatingRef.current = true;
            onChange(convertedDate);
            setTimeout(() => { isUpdatingRef.current = false; }, 100);
          }
        } else {
          if (onChange) {
            isUpdatingRef.current = true;
            onChange(newValue);
            setTimeout(() => { isUpdatingRef.current = false; }, 100);
          }
        }
      } else {
        if (onChange) {
          isUpdatingRef.current = true;
          onChange(newValue);
          setTimeout(() => { isUpdatingRef.current = false; }, 100);
        }
      }
    };

    const handleInputFocus = () => {
      setIsOpen(true);
    };

    const isToday = (date: { year: number; month: number; day: number }): boolean => {
      return date.year === currentDate.year && 
             date.month === currentDate.month && 
             date.day === currentDate.day;
    };

    const isSelected = (date: { year: number; month: number; day: number }): boolean => {
      return selectedDates.some(d => 
        d.year === date.year && d.month === date.month && d.day === date.day
      );
    };

    const isDisabled = (date: { year: number; month: number; day: number }): boolean => {
      if (date.year < NepaliFunctions.minDate.year || date.year > NepaliFunctions.maxDate.year) return true;
      
      // Check minAge constraint
      if (minAge > 0) {
        const adDate = NepaliFunctions.bs2ad(date);
        const jsDate = new Date(adDate.year, adDate.month - 1, adDate.day);
        const today = new Date();
        const minAgeDate = new Date(today);
        minAgeDate.setFullYear(today.getFullYear() - minAge);
        
        if (jsDate > minAgeDate) return true;
      }
      
      return false;
    };

    const selectDate = (date: { year: number; month: number; day: number }) => {
      if (isDisabled(date)) return;

      setSelectedDates([date]);
      setIsOpen(false);
      
      const formattedDate = NepaliFunctions.formatDate(date, 'YYYY-MM-DD');
      const displayDate = options.valueLocale === 'ne' ? 
        NepaliFunctions.convertToUnicode(formattedDate) : formattedDate;
      
      setInputValue(displayDate);
      prevValueRef.current = displayDate;
      
      if (convertToBS) {
        const convertedDate = convertToBSDate(formattedDate);
        if (onChange && convertedDate) {
          isUpdatingRef.current = true;
          onChange(convertedDate);
          setTimeout(() => { isUpdatingRef.current = false; }, 100);
        }
      } else {
        if (onChange) {
          isUpdatingRef.current = true;
          onChange(displayDate);
          setTimeout(() => { isUpdatingRef.current = false; }, 100);
        }
      }
    };

    const changeMonth = (delta: number) => {
      let newMonth = viewMonth + delta;
      let newYear = viewYear;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      
      setViewMonth(newMonth);
      setViewYear(newYear);
    };

    const goToToday = () => {
      const today = NepaliFunctions.getCurrentBsDate();
      setViewYear(today.year);
      setViewMonth(today.month);
      setViewMode('calendar');
    };

    const renderCalendar = () => {
      const daysInMonth = NepaliFunctions.getDaysInMonth(viewYear, viewMonth);
      const firstDay = NepaliFunctions.getFullDay({ year: viewYear, month: viewMonth, day: 1 });
      const startDayIndex = NepaliFunctions.daysEn.indexOf(firstDay);
      
      const days = [];
      
      // Empty cells for days before month start
      for (let i = 0; i < startDayIndex; i++) {
        days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
      }
      
      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = { year: viewYear, month: viewMonth, day };
        const isDateToday = isToday(date);
        const isDateSelected = isSelected(date);
        const isDateDisabled = isDisabled(date);
        
        days.push(
          <button
            type="button"
            key={day}
            onClick={() => selectDate(date)}
            disabled={isDateDisabled}
            className={`
              w-8 h-8 text-sm rounded hover:bg-gray-100 transition-colors relative
              ${isDateToday ? 'font-bold text-blue-600' : ''}
              ${isDateSelected ? 'bg-blue-500 text-white' : ''}
              ${isDateDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              hover:bg-gray-100 text-gray-900
            `}
          >
            {options.valueLocale === 'ne' ? NepaliFunctions.convertToUnicode(day) : day}
          </button>
        );
      }
      
      return (
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {daysShort.map((day, index) => (
            <div 
              key={index} 
              className={`w-8 h-8 text-xs font-semibold flex items-center justify-center
                ${index === 6 ? 'text-red-500' : 'text-gray-600'}
              `}
            >
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {days}
        </div>
      );
    };

    const renderMonths = () => {
      return (
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <button
              type="button"
              key={index}
              onClick={() => {
                setViewMonth(index + 1);
                setViewMode('calendar');
              }}
              className={`
                p-2 text-sm rounded hover:bg-gray-100 transition-colors
                ${viewMonth === index + 1 ? 'bg-blue-500 text-white' : ''}
                hover:bg-gray-100 text-gray-900
              `}
            >
              {month}
            </button>
          ))}
        </div>
      );
    };

    const renderYears = () => {
      const years = [];
      for (let year = yearRange.start; year <= yearRange.end; year++) {
        years.push(
          <button
            type="button"
            key={year}
            onClick={() => {
              setViewYear(year);
              setViewMode('months');
            }}
            className={`
              p-2 text-sm rounded hover:bg-gray-100 transition-colors
              ${viewYear === year ? 'bg-blue-500 text-white' : ''}
              hover:bg-gray-100 text-gray-900
            `}
          >
            {options.valueLocale === 'ne' ? NepaliFunctions.convertToUnicode(year) : year}
          </button>
        );
      }
      
      return (
        <div className="grid grid-cols-3 gap-2">
          {years}
        </div>
      );
    };

    const getHeaderText = () => {
      if (viewMode === 'calendar') {
        const monthName = months[viewMonth - 1];
        const yearText = options.valueLocale === 'ne' ? NepaliFunctions.convertToUnicode(viewYear) : viewYear;
        return `${monthName} ${yearText}`;
      } else if (viewMode === 'months') {
        return options.valueLocale === 'ne' ? NepaliFunctions.convertToUnicode(viewYear) : viewYear;
      } else {
        const startYear = options.valueLocale === 'ne' ? NepaliFunctions.convertToUnicode(yearRange.start) : yearRange.start;
        const endYear = options.valueLocale === 'ne' ? NepaliFunctions.convertToUnicode(yearRange.end) : yearRange.end;
        return `${startYear} - ${endYear}`;
      }
    };

    const componentKey = React.useMemo(
      () => `${id}-${isInitialized}`,
      [id, isInitialized]
    );

    return (
      <div className="mb-4 w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className={`relative ${className}`} ref={containerRef}>
          <input
            key={componentKey}
            ref={inputRef}
            type="text"
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="YYYY-MM-DD"
            disabled={disabled}
            className={`${inputClassName} w-full px-3 py-${type === 'form' ? '3' : '2'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm sm:text-base shadow-sm ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          <Calendar 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-500"
          />
          
          {isOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 p-4 rounded-lg shadow-lg border bg-white border-gray-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === 'calendar') changeMonth(-1);
                    else if (viewMode === 'months') setViewYear(viewYear - 1);
                    else setYearRange({ start: yearRange.start - 20, end: yearRange.end - 20 });
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === 'calendar') setViewMode('months');
                    else if (viewMode === 'months') setViewMode('years');
                    else setViewMode('calendar');
                  }}
                  className="px-3 py-1 rounded hover:bg-gray-100 text-sm font-medium text-gray-900"
                >
                  {getHeaderText()}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === 'calendar') changeMonth(1);
                    else if (viewMode === 'months') setViewYear(viewYear + 1);
                    else setYearRange({ start: yearRange.start + 20, end: yearRange.end + 20 });
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content */}
              <div className="min-w-64">
                {viewMode === 'calendar' && renderCalendar()}
                {viewMode === 'months' && renderMonths()}
                {viewMode === 'years' && renderYears()}
              </div>
              
              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={goToToday}
                  className="text-xs px-3 py-1 rounded hover:bg-gray-100 text-gray-600"
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Display BS date if conversion is enabled and we have a BS date */}
        {convertToBS && bsDate && (
          <div className="mt-1 text-xs text-gray-500">BS Date: {bsDate}</div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";


export default DatePicker;