import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MultiLineChartData } from "~/utils/analytics";
import { getPlatformColor } from "~/constants/colors";

export interface ChartDataPoint {
  date: string;
  value: number;
  delta: number;
}

interface AccountInfo {
  id: string;
  platform: string;
  username: string;
}

interface GrowthChartProps {
  data: MultiLineChartData[];
  title: string;
  color?: string;
  unit?: string;
  accounts?: AccountInfo[];
}

const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.delta > 0;
    const isZero = data.delta === 0;

    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
        <p className="text-sm text-gray-500 mb-2">
          {new Date(label).toLocaleDateString()}
        </p>
        <p className="text-sm font-bold text-indigo-600">
          {data.value.toLocaleString()}
          {unit}
        </p>
        <p
          className={`text-xs font-medium ${isPositive ? "text-green-600" : isZero ? "text-gray-600" : "text-red-600"}`}
        >
          {isPositive ? "+" : ""}
          {data.delta.toLocaleString()}
          {unit}
        </p>

        {payload.slice(1).map((entry: any) => (
          <p
            key={entry.name}
            className="text-xs text-gray-600 flex justify-between gap-4"
          >
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span>
              {entry.value.toLocaleString()}
              {unit}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function GrowthChart({
  data,
  title,
  color = "#4f46e5",
  unit = "",
  accounts = [],
}: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(str) =>
                new Date(str).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toLocaleString()}${unit}`}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {accounts.map((acc) => (
              <Line
                key={acc.id}
                type="monotone"
                dataKey={acc.id}
                name={`@${acc.username} (${acc.platform})`}
                stroke={getPlatformColor(acc.platform)}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
