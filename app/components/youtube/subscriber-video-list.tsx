export function SubscriberVideoList({ videos }: { videos: any[] }) {
  return (
    <div className="rounded-lg bg-white shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Top Channel Builders
        </h3>
      </div>
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {videos.map((video, index) => (
            <li
              key={video.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400 w-4">
                  {index + 1}
                </span>
              </div>
              <img
                src={video.thumbnail}
                alt=""
                className="h-12 w-20 rounded object-cover bg-gray-100 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {video.title}
                </p>
                <p className="text-xs text-gray-500">
                  {video.views.toLocaleString()} views
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  +{video.subscribersGained} Subs
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
