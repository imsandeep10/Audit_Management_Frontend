"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react";
import NepaliDate from "nepali-date-converter";

type CalendarType = "BS" | "AD";
type SelectedDate = {
  year: number;
  month: number;
  day: number;
};

const nepaliMonths = [
  "बैशाख",
  "जेष्ठ",
  "आषाढ़",
  "श्रावण",
  "भाद्र",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
];
const nepaliWeekdays = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

const engMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const engWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_MIN_BS_YEAR = 1980;
const DEFAULT_MAX_BS_YEAR = 2180;
const DEFAULT_MIN_AD_YEAR = 1924;
const DEFAULT_MAX_AD_YEAR = 2124;

function toNepaliDigits(num: number): string {
  const nepDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num)
    .split("")
    .map((d) => nepDigits[Number.parseInt(d)] || d)
    .join("");
}

function adToBs(adDate: Date): SelectedDate | null {
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
}

function getMonthLengthsBS(year: number): number[] {
  try {
    const monthLengths = [];
    for (let month = 0; month < 12; month++) {
      const nepaliDate = new NepaliDate(year, month, 1);
      const nextMonth =
        month === 11
          ? new NepaliDate(year + 1, 0, 1)
          : new NepaliDate(year, month + 1, 1);
      const currentMonthStart = nepaliDate.toJsDate().getTime();
      const nextMonthStart = nextMonth.toJsDate().getTime();
      const daysInMonth = Math.round(
        (nextMonthStart - currentMonthStart) / (1000 * 60 * 60 * 24)
      );
      monthLengths.push(daysInMonth);
    }
    return monthLengths;
  } catch (error) {
    console.warn("Error getting BS month lengths:", error);
    return [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
  }
}

function getFirstWeekdayBS(year: number, month: number): number {
  try {
    const nepaliDate = new NepaliDate(year, month, 1);
    const jsDate = nepaliDate.toJsDate();
    return jsDate.getDay();
  } catch (error) {
    console.warn("Error getting BS first weekday:", error);
    return 0;
  }
}

interface AuditCalendarProps {
  onDateSelect?: (date: SelectedDate, type: CalendarType) => void;
  initialCalendarType?: CalendarType;
  minYear?: number;
  maxYear?: number;
}

export default function AuditCalendar({
  onDateSelect,
  initialCalendarType = "AD",
  minYear,
  maxYear,
}: AuditCalendarProps) {
  const [calendarType, setCalendarType] =
    useState<CalendarType>(initialCalendarType);
  const [currentYearBS, setCurrentYearBS] = useState<number>(2081);
  const [currentMonthBS, setCurrentMonthBS] = useState<number>(0);
  const [currentDateAD, setCurrentDateAD] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);
  const [todayBS, setTodayBS] = useState<SelectedDate | null>(null);
  const [todayAD, setTodayAD] = useState<Date>(new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const MIN_BS_YEAR =
    minYear && calendarType === "BS" ? minYear : DEFAULT_MIN_BS_YEAR;
  const MAX_BS_YEAR =
    maxYear && calendarType === "BS" ? maxYear : DEFAULT_MAX_BS_YEAR;
  const MIN_AD_YEAR =
    minYear && calendarType === "AD" ? minYear : DEFAULT_MIN_AD_YEAR;
  const MAX_AD_YEAR =
    maxYear && calendarType === "AD" ? maxYear : DEFAULT_MAX_AD_YEAR;

  useEffect(() => {
    const today = new Date();
    setTodayAD(today);

    const todayNepali = adToBs(today);
    setTodayBS(todayNepali);

    if (calendarType === "BS" && todayNepali) {
      setCurrentYearBS(todayNepali.year);
      setCurrentMonthBS(todayNepali.month);
    } else {
      setCurrentDateAD(today);
    }
  }, [calendarType]);

  const navigateMonth = (direction: "prev" | "next") => {
    if (calendarType === "BS") {
      let newYear = currentYearBS;
      let newMonth = currentMonthBS;

      if (direction === "next") {
        if (currentMonthBS === 11) {
          newMonth = 0;
          newYear = currentYearBS + 1;
        } else {
          newMonth = currentMonthBS + 1;
        }
      } else {
        if (currentMonthBS === 0) {
          newMonth = 11;
          newYear = currentYearBS - 1;
        } else {
          newMonth = currentMonthBS - 1;
        }
      }

      if (newYear >= MIN_BS_YEAR && newYear <= MAX_BS_YEAR) {
        setCurrentYearBS(newYear);
        setCurrentMonthBS(newMonth);
      }
    } else {
      const newDate = new Date(currentDateAD);
      if (direction === "next") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }

      const newYear = newDate.getFullYear();
      if (newYear >= MIN_AD_YEAR && newYear <= MAX_AD_YEAR) {
        setCurrentDateAD(newDate);
      }
    }
  };

  const handleDateSelect = (year: number, month: number, day: number) => {
    const newDate = { year, month, day };
    setSelectedDate(newDate);
    onDateSelect?.(newDate, calendarType);
  };

  const handleYearSelect = (year: number) => {
    if (calendarType === "BS") {
      if (year >= MIN_BS_YEAR && year <= MAX_BS_YEAR) {
        setCurrentYearBS(year);
      }
    } else {
      if (year >= MIN_AD_YEAR && year <= MAX_AD_YEAR) {
        const newDate = new Date(currentDateAD);
        newDate.setFullYear(year);
        setCurrentDateAD(newDate);
      }
    }
    setShowYearSelector(false);
  };

  const handleMonthSelect = (month: number) => {
    if (calendarType === "BS") {
      setCurrentMonthBS(month);
    } else {
      const newDate = new Date(currentDateAD);
      newDate.setMonth(month);
      setCurrentDateAD(newDate);
    }
    setShowMonthSelector(false);
  };

  const generateYearOptions = () => {
    const years = [];
    const currentYear =
      calendarType === "BS" ? currentYearBS : currentDateAD.getFullYear();
    const minYear = calendarType === "BS" ? MIN_BS_YEAR : MIN_AD_YEAR;
    const maxYear = calendarType === "BS" ? MAX_BS_YEAR : MAX_AD_YEAR;

    // Show more years in dropdown for better navigation
    const startYear = Math.max(minYear, currentYear - 50);
    const endYear = Math.min(maxYear, currentYear + 50);

    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const renderBSCalendar = () => {
    const monthLengths = getMonthLengthsBS(currentYearBS);
    const firstWeekday = getFirstWeekdayBS(currentYearBS, currentMonthBS);
    const daysInMonth = monthLengths[currentMonthBS];

    const blanks = [];
    for (let i = 0; i < firstWeekday; i++) {
      blanks.push(<div key={`b${i}`} className="h-8"></div>);
    }

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        todayBS &&
        todayBS.year === currentYearBS &&
        todayBS.month === currentMonthBS &&
        todayBS.day === day;
      const isSelected =
        selectedDate &&
        selectedDate.year === currentYearBS &&
        selectedDate.month === currentMonthBS &&
        selectedDate.day === day;

      days.push(
        <div
          key={day}
          onClick={() => handleDateSelect(currentYearBS, currentMonthBS, day)}
          className={`
            h-8 flex items-center justify-center text-sm cursor-pointer
            hover:bg-gray-100 rounded-full transition-colors
            ${isToday ? "bg-blue-500 text-white font-semibold" : ""}
            ${
              isSelected && !isToday
                ? "bg-blue-100 border-2 border-blue-500 text-blue-700 font-semibold"
                : ""
            }
            ${!isToday && !isSelected ? "text-gray-700" : ""}
          `}
        >
          {toNepaliDigits(day)}
        </div>
      );
    }

    return [...blanks, ...days];
  };

  const renderADCalendar = () => {
    const year = currentDateAD.getFullYear();
    const month = currentDateAD.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = [];
    for (let i = 0; i < firstWeekday; i++) {
      blanks.push(<div key={`b${i}`} className="h-8"></div>);
    }

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        todayAD.getFullYear() === year &&
        todayAD.getMonth() === month &&
        todayAD.getDate() === day;
      const isSelected =
        selectedDate &&
        selectedDate.year === year &&
        selectedDate.month === month &&
        selectedDate.day === day;

      days.push(
        <div
          key={day}
          onClick={() => handleDateSelect(year, month, day)}
          className={`
            h-8 flex items-center justify-center text-sm cursor-pointer
            hover:bg-gray-100 rounded-full transition-colors
            ${isToday ? "bg-blue-500 text-white font-semibold" : ""}
            ${
              isSelected && !isToday
                ? "bg-blue-100 border-2 border-blue-500 text-blue-700 font-semibold"
                : ""
            }
            ${!isToday && !isSelected ? "text-gray-700" : ""}
          `}
        >
          {day}
        </div>
      );
    }

    return [...blanks, ...days];
  };

  const currentMonth =
    calendarType === "BS"
      ? nepaliMonths[currentMonthBS]
      : engMonths[currentDateAD.getMonth()];
  const currentYear =
    calendarType === "BS"
      ? toNepaliDigits(currentYearBS)
      : currentDateAD.getFullYear().toString();
  const currentWeekdays = calendarType === "BS" ? nepaliWeekdays : engWeekdays;
  const monthOptions = calendarType === "BS" ? nepaliMonths : engMonths;

  return (
    <div className="card-custom rounded-2xl shadow-lg border border-gray-200 p-6  relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Date Selector</h2>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setCalendarType(calendarType === "BS" ? "AD" : "BS")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              calendarType === "BS"
                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {calendarType === "BS" ? "नेपाली" : "English"}
          </button>
        </div>
      </div>

      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          {/* Month Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMonthSelector(!showMonthSelector);
                setShowYearSelector(false);
              }}
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-lg font-semibold text-gray-900">
                {currentMonth}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showMonthSelector && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {monthOptions.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowYearSelector(!showYearSelector);
                setShowMonthSelector(false);
              }}
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-lg font-semibold text-gray-900">
                {currentYear}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showYearSelector && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {generateYearOptions().map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    {calendarType === "BS" ? toNepaliDigits(year) : year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigateMonth("next")}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {currentWeekdays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarType === "BS" ? renderBSCalendar() : renderADCalendar()}
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showYearSelector || showMonthSelector) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowYearSelector(false);
            setShowMonthSelector(false);
          }}
        />
      )}
    </div>
  );
}
