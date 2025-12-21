import {
  LineChart,
  Line,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import type { MultiLineChartData } from "~/utils/analytics";
import { getPlatformColor } from "~/constants/colors";

export interface ChartDataPoint {
  date: string;
  [key: string]: any;
}

interface LineConfig {
  key: string;
  color: string;
  name: string;
}

interface GrowthChartProps {
  title: string;
  data: ChartDataPoint[];
  lines: LineConfig[];
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
        <p className="text-sm text-gray-500 mb-2">
          {new Date(label).toLocaleDateString()}
        </p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.name}:</span>
            <span className="text-sm font-bold text-gray-900">
              {entry.value.toLocaleString()}
              {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function GrowthChart({
  title,
  data,
  lines,
  unit = "",
}: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-10!">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#fefefe", fontSize: 12 }}
              tickFormatter={(str) => {
                const date = new Date(str);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#fefefe", fontSize: 12 }}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
              }
              width={40}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            {lines.map((line) => (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                fill={line.color}
                fillOpacity={0.3}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                name={line.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
