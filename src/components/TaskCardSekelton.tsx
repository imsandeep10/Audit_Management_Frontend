export const TaskCardSkeleton = () => {
  return (
    <div className="animate-pulse group rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 w-3/4 bg-gray-300 rounded"></div>
        <div className="h-7 w-7 bg-gray-300 rounded-full"></div>
      </div>
      <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
      <div className="h-3 w-full bg-gray-300 rounded"></div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="h-2 rounded-full bg-gray-300 w-1/2"></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
        <div className="flex -space-x-2">
          <div className="w-7 h-7 bg-gray-300 rounded-full border-2 border-white"></div>
          <div className="w-7 h-7 bg-gray-300 rounded-full border-2 border-white"></div>
          <div className="w-7 h-7 bg-gray-300 rounded-full border-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};
