interface reportProps {
  label: string;
  data: string;
}

const ReportCards = ({ label, data }: reportProps) => {
  return (
    <div className="bg-gray-200 w-full max-w-sm mx-auto py-4 sm:py-5 px-4 flex flex-col justify-center items-center rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="font-medium text-base sm:text-lg md:text-xl text-center text-gray-700 mb-2">
        {label}
      </div>
      <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900">
        {data}
      </div>
    </div>
  );
};

export default ReportCards;
