import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#ffc0cb",
  "#f47983",
  "#b794f6",
  "#40e0d0",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
];

const formatLabel = (value: string) => {
  const map: Record<string, string> = {
    EXT_URL: "External",
    YT_SEARCH: "YouTube Search",
    RELATED_VIDEO: "Related Videos",
    YT_RELATED: "Related Videos",
    SUBSCRIBER: "Subscription Feed",
    PLAYLIST: "Playlists",
    YT_PLAYLIST_PAGE: "Playlist Pages",
    HASHTAGS: "Hashtags",
    NO_LINK_OTHER: "Direct / Unknown",
    UNKNOWN_MOBILE_OR_DIRECT: "Direct / Unknown",
    ADVERTISING: "YouTube Ads",
    SHORTS: "YouTube Shorts",
    YT_CHANNEL: "YouTube Channel",
    YT_OTHER_PAGE: "Other YouTube Page",
    ANNOTATION: "Video Cards / Annotations",
    NOTIFICATION: "Notifications",
    END_SCREEN: "End Screens",
  };

  if (map[value]) return map[value];

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export function TrafficSourceChart({ data }: { data: any[] }) {
  const chartData = data.slice(0, 5);
  const totalViews = chartData.reduce((acc, item) => acc + item.views, 0);

  return (
    <div className="rounded-lg bg-surface p-6 shadow">
      <h3 className="text-base font-semibold leading-6 mb-4">
        Traffic Sources
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={120}
              paddingAngle={5}
              dataKey="views"
              nameKey="source"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => {
                const percent = ((value / totalViews) * 100).toFixed(1);
                return [`${percent}%`, formatLabel(name)];
              }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="left"
              formatter={formatLabel}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
