import { useMemo } from "react";

interface CountryData {
  code: string;
  views: number;
}

export function CountryList({ data }: { data: CountryData[] }) {
  const regionNames = useMemo(
    () => new Intl.DisplayNames(["en"], { type: "region" }),
    []
  );

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
        Top Countries
      </h3>
      <div className="flow-root">
        <ul className="-my-5 divide-y divide-gray-200">
          {data.map((country) => (
            <li key={country.code} className="py-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center min-w-0 gap-x-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {regionNames.of(country.code) || country.code}
                  </p>
                </div>
                <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                  {country.views.toLocaleString()} views
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
