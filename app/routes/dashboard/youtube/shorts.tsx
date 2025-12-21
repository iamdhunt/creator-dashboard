import { useOutletContext } from "react-router";
import { SubscriberVideoList } from "~/components/youtube/subscriber-video-list";
import { VideoList } from "~/components/youtube/video-list";
import YouTubeTopVideoCard from "~/components/youtube/top-video-card";

export default function YoutubeChannelShorts() {
  const { data } = useOutletContext<any>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-surface px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium opacity-75">
            Like-to-View Ratio
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight">
            {data.shortsRatios?.likeToView.toFixed(2)}%
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-surface px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium opacity-75">
            Comment-to-View Ratio
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight">
            {data.shortsRatios?.commentToView.toFixed(2)}%
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-surface px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium opacity-75">
            Share-to-View Ratio
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight">
            {data.shortsRatios?.shareToView.toFixed(2)}%
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-surface px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium opacity-75">
            Avg. View Percentage
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight">
            {data.shortsRatios?.avgPercentage.toFixed(2)}%
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <YouTubeTopVideoCard
          data={data}
          heading="Most Viewed"
          thumbnail={data.topShortByViews?.thumbnail}
          title={data.topShortByViews?.title}
          metric={data.topShortByViews?.views.toLocaleString()}
          label="Views"
        />
        <YouTubeTopVideoCard
          data={data}
          heading="Most Subscribers"
          thumbnail={data.topShortBySubs?.thumbnail}
          title={data.topShortBySubs?.title}
          metric={data.topShortBySubs?.subscribersGained.toLocaleString()}
          label="Subs Gained"
        />
        <YouTubeTopVideoCard
          data={data}
          heading="Most Watch Time"
          thumbnail={data.topShortByEstimatedMinutesWatched?.thumbnail}
          title={data.topShortByEstimatedMinutesWatched?.title}
          metric={data.topShortByEstimatedMinutesWatched?.watchTimeHours.toFixed(
            1
          )}
          label="Hours"
        />
      </div>

      <div className="grid grid-cols-1">
        <VideoList
          videos={data.topShortsVideos}
          title="Top Performing Shorts"
        />
      </div>

      <div className="grid grid-cols-1">
        <SubscriberVideoList videos={data.topSubscriberShorts} />
      </div>
    </div>
  );
}
