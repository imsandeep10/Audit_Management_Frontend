import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CgCalendarDates } from "react-icons/cg";
import { days } from "../constant/days";

const DatePicker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="p-4  border rounded-xl  shadow-md max-w-2xl card-custom  ">
      <div className="flex gap-1 pl-2 pb-3 items-center">
        <CgCalendarDates className="text-[#0011FF] w-5 h-5" />
        <h3 className="font-semibold">Audit Planning</h3>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 mb-2">
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {Array(firstDay)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}}`} />
          ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isSelected =
            selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={day}
              onClick={() => handleDateClick(day)}
              className={`w-5 h-5 flex items-center justify-center rounded-full cursor-pointer transition text-sm
                ${isSelected ? "bg-blue-600 text-white" : ""}
                ${!isSelected && isToday ? "border border-blue-500" : ""}
                ${
                  !isSelected && !isToday
                    ? "hover:bg-blue-100 text-gray-800"
                    : ""
                }
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
