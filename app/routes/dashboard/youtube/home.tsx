import { Link, useOutletContext } from "react-router";
import { VideoList } from "~/components/youtube/video-list";
import { DemographicsChart } from "~/components/youtube/demographics-chart";
import { TrafficSourceChart } from "~/components/youtube/traffic-source-chart";
import { CountryList } from "~/components/youtube/country-list";
import { SubscriberVideoList } from "~/components/youtube/subscriber-video-list";
import { GrowthChart } from "~/components/growth-chart";
import YouTubeTopVideoCard from "~/components/youtube/top-video-card";

export default function YoutubeHome() {
  const { data, charts } = useOutletContext() as any;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Subscribers (Lifetime)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.channel.subscriberCount.toLocaleString()}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Views (Lifetime)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.channel.viewCount.toLocaleString()}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Videos (Lifetime)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.channel.videoCount.toLocaleString()}
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Watch Time (30d)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.overview?.watchTimeHours.toFixed(1)}{" "}
            <span className="text-sm font-normal text-gray-500">hrs</span>
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Avg. View Percentage (30d)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.overview?.avgViewPercentage.toFixed(1)}%
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <YouTubeTopVideoCard
          data={data}
          heading="Most Viewed"
          thumbnail={data.topVideoByViews?.thumbnail}
          title={data.topVideoByViews?.title}
          metric={data.topVideoByViews?.views.toLocaleString()}
          label="Views"
        />
        <YouTubeTopVideoCard
          data={data}
          heading="Most Subscribers"
          thumbnail={data.topVideoBySubs?.thumbnail}
          title={data.topVideoBySubs?.title}
          metric={data.topVideoBySubs?.subscribersGained.toLocaleString()}
          label="Subs Gained"
        />
        <YouTubeTopVideoCard
          data={data}
          heading="Most Watch Time"
          thumbnail={data.topVideoByEstimatedMinutesWatched?.thumbnail}
          title={data.topVideoByEstimatedMinutesWatched?.title}
          metric={data.topVideoByEstimatedMinutesWatched?.watchTimeHours.toFixed(
            1
          )}
          label="Hours"
        />
      </div>

      <div className="grid grid-cols-1">
        <VideoList videos={data.topVideos} title="Top Performing Videos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <TrafficSourceChart data={data.trafficSources} />
        </div>
        <CountryList data={data.countries} />
      </div>

      <div className="grid grid-cols-1">
        <DemographicsChart data={data.demographics} />
      </div>

      <div className="grid grid-cols-1">
        <SubscriberVideoList videos={data.topSubscriberVideos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart
          title="Watch Time (Hours)"
          data={charts.history}
          lines={[
            {
              key: "watchTimeHours",
              color: "#f59e0b",
              name: "Watch Time (Hours)",
            },
          ]}
        />
        <GrowthChart
          title="Subscribers Gained"
          data={charts.history}
          lines={[
            {
              key: "followersGained",
              color: "#4f46e5",
              name: "Subscribers Gained",
            },
          ]}
        />
        <GrowthChart
          title="Views"
          data={charts.history}
          lines={[{ key: "dailyViews", color: "#10b981", name: "Views" }]}
        />
        <GrowthChart
          title="Interactions (Likes, Comments & Shares)"
          data={charts.history}
          lines={[
            {
              key: "interactions",
              color: "#ec4899",
              name: "Likes, Comments & Shares",
            },
          ]}
        />
      </div>
    </div>
  );
}
