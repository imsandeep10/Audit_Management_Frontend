import NepaliDate from "nepali-date-converter";

// Types for date formats
type DateFormat = "AD" | "BS";
type DateObject = {
  year: number;
  month: number;
  day: number;
};

/**
 * Prepares a date for sending to the backend
 * @param dateString Date string in format YYYY-MM-DD
 * @returns Date string unchanged (no conversion)
 */
export const prepareDateForBackend = (dateString: string): string => {
  return dateString; // Directly return value without conversion
};

/**
 * Formats an ISO date string to YYYY-MM-DD format for display
 * @param dateString Date string (can be ISO format or YYYY-MM-DD)
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // If it's an ISO date string, convert to YYYY-MM-DD
  if (dateString.includes('T')) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  // If it's a valid date string, try to parse and format
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return dateString; // Return original if can't parse
};

/**
 * Check if a date string is a valid date
 * @param dateString Date string to validate
 * @returns Boolean indicating if date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Convert AD date to BS (Bikram Sambat) date
 * @param adDate JavaScript Date object
 * @returns DateObject with BS year, month, day or null if conversion fails
 */
export const adToBs = (adDate: Date): DateObject | null => {
  try {
    const nepaliDate = new NepaliDate(adDate);
    return {
      year: nepaliDate.getYear(),
      month: nepaliDate.getMonth(),
      day: nepaliDate.getDate(),
    };
  } catch (error) {
    console.warn("Error converting AD to BS:", error);
    return null;
  }
};

/**
 * Convert BS (Bikram Sambat) date to AD date
 * @param bsYear BS year
 * @param bsMonth BS month (0-11)
 * @param bsDay BS day
 * @returns JavaScript Date object or null if conversion fails
 */
export const bsToAd = (bsYear: number, bsMonth: number, bsDay: number): Date | null => {
  try {
    const nepaliDate = new NepaliDate(bsYear, bsMonth, bsDay);
    return nepaliDate.toJsDate();
  } catch (error) {
    console.warn("Error converting BS to AD:", error);
    return null;
  }
};

/**
 * Convert date string to BS date object
 * @param dateString Date string in format YYYY-MM-DD
 * @returns DateObject with BS year, month, day or null if conversion fails
 */
export const stringToBsDate = (dateString: string): DateObject | null => {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null;
    }

    // Convert to JS Date (assuming it's AD format)
    const adDate = new Date(year, month - 1, day);
    return adToBs(adDate);
  } catch (error) {
    console.warn("Error converting string to BS date:", error);
    return null;
  }
};

/**
 * Format BS date object to string
 * @param bsDate BS date object
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const formatBsDate = (bsDate: DateObject): string => {
  const { year, month, day } = bsDate;
  const formattedMonth = (month + 1).toString().padStart(2, "0");
  const formattedDay = day.toString().padStart(2, "0");
  return `${year}-${formattedMonth}-${formattedDay}`;
};

/**
 * Detect if a date string is likely BS format
 * @param dateString Date string in format YYYY-MM-DD
 * @returns Boolean indicating if date is likely BS format
 */
export const isLikelyBSDate = (dateString: string): boolean => {
  const [year] = dateString.split("-").map(Number);
  // BS years are typically between 2000-2100
  // Current BS year is around 2081 (2024 AD), so we need to support a wider range
  // BS dates can be from 2000 onwards for historical data
  return year >= 2000 && year <= 2100;
};

/**
 * Check if a person is at least specified years old based on their date of birth
 * @param dateString Date string in format YYYY-MM-DD
 * @param format Explicitly specify the date format (AD or BS)
 * @param minAge Minimum age requirement (default: 18)
 * @returns Boolean indicating if person meets minimum age requirement
 */
export const isAtLeast18YearsOld = (dateString: string, format?: DateFormat, minAge: number = 18): boolean => {
  try {
    if (!dateString || dateString.trim() === "") return false;

    let birthDate: Date;
    const [year, month, day] = dateString.split("-").map(Number);

    // Use explicit format if provided, otherwise use detection logic
    const isBSFormat = format === "BS" || (format === undefined && isLikelyBSDate(dateString));

    if (isBSFormat) {
      // Convert BS to AD first
      const adDate = bsToAd(year, month - 1, day);
      if (!adDate) {
        console.warn("Failed to convert BS date to AD:", dateString);
        return false;
      }
      birthDate = adDate;
    } else {
      birthDate = new Date(year, month - 1, day);
    }

    if (isNaN(birthDate.getTime())) {
      console.warn("Invalid date format:", dateString);
      return false;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge;
  } catch (error) {
    console.warn("Error checking age:", error);
    return false;
  }
};

/**
 * Check if a date is not in the future
 * @param dateString Date string in format YYYY-MM-DD
 * @param format Explicitly specify the date format (AD or BS)
 * @returns Boolean indicating if date is not in the future
 */
export const isNotFutureDate = (dateString: string, format?: DateFormat): boolean => {
  try {
    if (!dateString || dateString.trim() === "") return false;

    let checkDate: Date;
    const [year, month, day] = dateString.split("-").map(Number);

    // Use explicit format if provided, otherwise use detection logic
    const isBSFormat = format === "BS" || (format === undefined && isLikelyBSDate(dateString));

    if (isBSFormat) {
      // Convert BS to AD first
      const adDate = bsToAd(year, month - 1, day);
      if (!adDate) return false;
      checkDate = adDate;
    } else {
      checkDate = new Date(year, month - 1, day);
    }

    if (isNaN(checkDate.getTime())) return false;

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    return checkDate <= today;
  } catch (error) {
    console.warn("Error checking future date:", error);
    return false;
  }
};

/**
 * Check if a date is in the future
 * @param dateString Date string in format YYYY-MM-DD
 * @param format Explicitly specify the date format (AD or BS)
 * @returns Boolean indicating if date is in the future
 */
export const isFutureDate = (dateString: string, format?: DateFormat): boolean => {
  try {
    if (!dateString || dateString.trim() === "") return false;

    let checkDate: Date;
    const [year, month, day] = dateString.split("-").map(Number);

    // Use explicit format if provided, otherwise use detection logic
    const isBSFormat = format === "BS" || (format === undefined && isLikelyBSDate(dateString));

    if (isBSFormat) {
      // Convert BS to AD first
      const adDate = bsToAd(year, month - 1, day);
      if (!adDate) return false;
      checkDate = adDate;
    } else {
      checkDate = new Date(year, month - 1, day);
    }

    if (isNaN(checkDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    return checkDate > today;
  } catch (error) {
    console.warn("Error checking future date:", error);
    return false;
  }
};

/**
 * Validate a date string based on specific criteria
 * @param dateString Date string to validate
 * @param format Explicitly specify the date format (AD or BS)
 * @param options Validation options
 * @returns Validation result with success flag and error message
 */
export const validateDate = (
  dateString: string,
  format?: DateFormat,
  options: {
    required?: boolean;
    minAge?: number;
    maxAge?: number;
    allowFuture?: boolean;
    requireFuture?: boolean;
    minDate?: string;
    maxDate?: string;
  } = {}
): { isValid: boolean; message?: string } => {
  const { required = true, minAge, maxAge, allowFuture = false, requireFuture = false, minDate, maxDate } = options;

  // Check if required
  if (required && (!dateString || dateString.trim() === "")) {
    return { isValid: false, message: "Date is required" };
  }

  // Skip validation if not required and empty
  if (!required && (!dateString || dateString.trim() === "")) {
    return { isValid: true };
  }

  try {
    let checkDate: Date;
    const [year, month, day] = dateString.split("-").map(Number);

    // Use explicit format if provided, otherwise use detection logic
    const isBSFormat = format === "BS" || (format === undefined && isLikelyBSDate(dateString));

    if (isBSFormat) {
      // Convert BS to AD for validation
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return { isValid: false, message: "Invalid date format" };
      }

      const adDate = bsToAd(year, month - 1, day);
      if (!adDate) {
        return { isValid: false, message: "Invalid Nepali date" };
      }
      checkDate = adDate;
    } else {
      checkDate = new Date(year, month - 1, day);
      if (isNaN(checkDate.getTime())) {
        return { isValid: false, message: "Invalid date format" };
      }
    }

    // Check if date is in the future
    if (!allowFuture && !requireFuture) {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (checkDate > today) {
        return { isValid: false, message: "Date cannot be in the future" };
      }
    }

    // Check if date is required to be in the future
    if (requireFuture) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      if (checkDate <= today) {
        return { isValid: false, message: "Date must be in the future" };
      }
    }

    // Check min/max age if provided
    if (minAge !== undefined || maxAge !== undefined) {
      const today = new Date();
      let age = today.getFullYear() - checkDate.getFullYear();
      const monthDiff = today.getMonth() - checkDate.getMonth();

      // Adjust age if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < checkDate.getDate())) {
        age--;
      }

      if (minAge !== undefined && age < minAge) {
        return { isValid: false, message: `Age must be at least ${minAge} years` };
      }

      if (maxAge !== undefined && age > maxAge) {
        return { isValid: false, message: `Age must be less than ${maxAge} years` };
      }
    }

    // Check min date if provided
    if (minDate) {
      let minCheckDate: Date;

      if (format === "BS") {
        const [year, month, day] = minDate.split("-").map(Number);
        const adMinDate = bsToAd(year, month - 1, day);
        if (!adMinDate) {
          return { isValid: false, message: "Invalid minimum date" };
        }
        minCheckDate = adMinDate;
      } else {
        minCheckDate = new Date(minDate);
      }

      if (checkDate < minCheckDate) {
        return { isValid: false, message: `Date must be after ${minDate}` };
      }
    }

    // Check max date if provided
    if (maxDate) {
      let maxCheckDate: Date;

      if (format === "BS") {
        const [year, month, day] = maxDate.split("-").map(Number);
        const adMaxDate = bsToAd(year, month - 1, day);
        if (!adMaxDate) {
          return { isValid: false, message: "Invalid maximum date" };
        }
        maxCheckDate = adMaxDate;
      } else {
        maxCheckDate = new Date(maxDate);
      }

      if (checkDate > maxCheckDate) {
        return { isValid: false, message: `Date must be before ${maxDate}` };
      }
    }

    return { isValid: true };
  } catch (error) {
    console.warn("Error validating date:", error);
    return { isValid: false, message: "Invalid date" };
  }
};