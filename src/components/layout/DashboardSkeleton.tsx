/** Shimmering placeholder shown while the dashboard hydrates from the cloud
 *  (esp. the free-tier cold start), so the first paint feels intentional. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-7 w-36 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
      </div>

      <div className="skeleton h-28 rounded-2xl" />

      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
      </div>

      <div className="skeleton h-40 rounded-2xl" />

      <div className="space-y-2">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-16 rounded-2xl" />
        <div className="skeleton h-16 rounded-2xl" />
      </div>
    </div>
  );
}
