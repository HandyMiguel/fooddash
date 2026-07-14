// components/Skeleton.jsx
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}