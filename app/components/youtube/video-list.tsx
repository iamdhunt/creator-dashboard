export function VideoList({ videos, title }: { videos: any[]; title: string }) {
  return (
    <div className="rounded-lg bg-surface shadow">
      <div className="p-6">
        <h3 className="text-base font-semibold leading-6">{title}</h3>
      </div>
      <div className="border-t border-gray-200 overflow-x-auto rounded-bl-xl rounded-br-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-surface">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Video
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Subs Gained
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Watch Time (hrs)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Avg. View %
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Likes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Comments
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Shares
              </th>
            </tr>
          </thead>

          <tbody className="bg-surface divide-y divide-gray-200">
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-16 shrink-0">
                      <img
                        className="h-10 w-16 rounded object-cover"
                        src={video.thumbnail}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium truncate max-w-[200px]">
                        {video.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {video.views.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {video.subscribersGained.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {video.watchTimeHours.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {video.avgViewPercentage.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {video.likes.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {video.comments.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {video.shares.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
