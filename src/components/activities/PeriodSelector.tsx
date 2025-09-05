
const periods = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisweek", label: "This Week" },
  { value: "thismonth", label: "This Month" },
  { value: "thisyear", label: "This Year" },
];

export const PeriodSelector = ({ 
  value, 
  onChange,
}: { 
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
    >
      {periods.map((period) => (
        <option key={period.value} value={period.value}>
          {period.label}
        </option>
      ))}
    </select>
  );
};