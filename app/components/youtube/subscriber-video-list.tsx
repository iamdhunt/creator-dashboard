export function SubscriberVideoList({ videos }: { videos: any[] }) {
  return (
    <div className="rounded-lg bg-surface shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-base font-semibold leading-6">
          Top Channel Builders
        </h3>
      </div>
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-100 ml-0! mb-0!">
          {videos.map((video, index) => (
            <li
              key={video.id}
              className="pt-6 pb-4 px-8 list-none! mb-0! flex justify-between items-start"
            >
              <div className="flex flex-1 gap-5 min-w-0">
                <div className="flex items-start gap-4">
                  <span className="text-lg font-bold w-4">#{index + 1}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-12 w-20 rounded object-cover bg-gray-100 shrink-0"
                  />
                  <div className="">
                    <p className="text-sm font-medium truncate">
                      {video.title}
                    </p>
                    <p className="text-xs opacity-75 mb-0!">
                      {video.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 whitespace-nowrap">
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
