import { Link } from "react-router";

export default function YouTubeTopVideoCard({
  data,
  heading,
  thumbnail,
  title,
  metric,
  label,
}: {
  data: any;
  heading: string;
  thumbnail: string;
  title: string;
  metric: string;
  label: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-black shadow text-white aspect-square min-w-40 min-h-40 group">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src={thumbnail}
        alt={title}
      />
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-24 z-20 pointer-events-none bg-linear-to-t from-black/85 to-transparent" />
      <div className="absolute top-4 right-4 text-3xl font-display drop-shadow-lg z-30">
        #1
      </div>
      <div className="absolute bottom-0 left-0 p-4 w-full z-30">
        <dt className="truncate text-sm font-medium">{heading}</dt>
        <dd className="mt-1 text-xl font-semibold tracking-tight line-clamp-2">
          {title}
        </dd>
        <dd className="truncate text-sm font-medium">
          {metric} {label}
        </dd>
      </div>
    </div>
  );
}
