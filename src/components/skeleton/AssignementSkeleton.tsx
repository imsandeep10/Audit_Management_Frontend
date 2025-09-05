import { Skeleton } from "../ui/skeleton";

const AssignementSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto px-8 h-screen pt-5 pb-10">
      <Skeleton className="h-8 w-48 mb-5" />

      <div className="flex flex-col gap-5 items-center md:flex-row md:justify-between pt-5">
        <div className="h-[50px] w-full bg-gray-100 rounded-lg flex items-center justify-around px-2">
          <Skeleton className="h-9 w-20 rounded-sm" />
          <Skeleton className="h-9 w-16 rounded-sm" />
          <Skeleton className="h-9 w-24 rounded-sm" />
          <Skeleton className="h-9 w-20 rounded-sm" />
        </div>

        <div className="flex flex-row gap-5 items-center justify-between md:justify-end w-full">
          <div className="flex items-center gap-2 rounded-sm bg-gray-100 py-2 px-5">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>

          <Skeleton className="h-10 w-40 rounded-sm bg-gray-200" />
        </div>
      </div>

      <div className="mt-4">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 w-full mb-32 rounded-2xl p-5">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`todo-${i}`}
                className="bg-white rounded-lg border p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full bg-orange-200" />
                    <Skeleton className="h-4 w-12 bg-orange-100" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded" />
                </div>

                <Skeleton className="h-6 w-full mb-2" />

                <Skeleton className="h-4 w-4/5 mb-3" />
                <Skeleton className="h-4 w-2/3 mb-3" />

                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={`progress-${i}`}
                className="bg-white rounded-lg border p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full bg-blue-200" />
                    <Skeleton className="h-4 w-18 bg-blue-100" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded" />
                </div>

                <Skeleton className="h-6 w-full mb-2" />

                <Skeleton className="h-4 w-5/6 mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />

                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-4 w-18" />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`completed-${i}`}
                className="bg-white rounded-lg border p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full bg-green-200" />
                    <Skeleton className="h-4 w-18 bg-green-100" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded" />
                </div>

                <Skeleton className="h-6 w-full mb-2" />

                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-3" />

                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full bg-green-100" />
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignementSkeleton;
