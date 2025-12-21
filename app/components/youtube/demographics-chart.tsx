import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function DemographicsChart({ data }: { data: any[] }) {
  // Aggregate by age group
  const ageData = data.reduce((acc: any[], curr) => {
    const existing = acc.find((item) => item.age === curr.age);
    if (existing) {
      existing.percentage += curr.percentage;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);

  const sortedData = ageData.sort((a, b) => b.percentage - a.percentage);

  const topAge = sortedData[0] || { age: "N/A", percentage: 0 };
  const otherAges = sortedData.slice(1, 4);

  return (
    <div className="rounded-lg bg-surface p-6 shadow h-full">
      <h3 className="text-base font-semibold leading-6 mb-4">Audience Age</h3>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start pr-8 border-r border-gray-100 w-1/2">
          <span className="text-8xl font-bold text-accent tracking-tight">
            {topAge.percentage.toFixed(1)}%
          </span>
          <span className="text-md font-medium mt-2 uppercase tracking-wide opacity-75">
            Age {topAge.age.replace("age", "")}
          </span>
        </div>

        <div className="flex-1 pl-8 space-y-4">
          {otherAges.map((item) => (
            <div
              key={item.age}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-gray-300 mr-3 group-hover:bg-accent-blue transition-colors" />
                <span className="text-md">
                  Age {item.age.replace("age", "")}
                </span>
              </div>

              <div className="grow border-b border-dashed border-gray-200 mb-1 mx-1" />

              <span className="text-md font-semibold shrink-0 pl-2 z-10">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}

          {otherAges.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              No other data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
