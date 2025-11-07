"use client";

import { useActivityHeatmap } from '~/hooks/useActivityHeatmap';
import { getDayName } from '~/lib/utils';

interface ActivityHeatmapProps {
  address: string;
}

export function ActivityHeatmap({ address }: ActivityHeatmapProps) {
  const { hourlyData, dailyData, maxHourly, maxDaily, isLoading, isError, error, refetch } =
    useActivityHeatmap({ address });

  // Calculate intensity (0-1) for color gradient
  const getIntensity = (value: number, max: number): number => {
    if (max === 0) return 0;
    return Math.min(value / max, 1);
  };

  // Get color based on intensity (black to neon green gradient)
  const getColor = (intensity: number): string => {
    if (intensity === 0) return '#000000'; // Black for no activity
    // Interpolate from black to neon green
    const r = Math.floor(0 + (0 - 0) * (1 - intensity));
    const g = Math.floor(0 + (255 - 0) * intensity);
    const b = Math.floor(0 + (0 - 0) * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="font-bold">Loading activity data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card border-4 border-red-500 bg-red-50 p-6">
        <p className="font-bold text-red-900 mb-2">Error loading activity</p>
        <p className="text-red-700 mb-4">{error?.message || 'Unknown error'}</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hour of Day Heatmap */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">ACTIVITY BY HOUR</h3>
        <div className="grid grid-cols-12 gap-1">
          {hourlyData.map((item) => {
            const intensity = getIntensity(item.tx_count, maxHourly);
            const color = getColor(intensity);
            return (
              <div
                key={item.hour}
                className="aspect-square border-2 border-black flex flex-col items-center justify-center group relative"
                style={{ backgroundColor: color }}
                title={`${item.hour}:00 - ${item.tx_count} transactions`}
              >
                <span className="text-xs font-bold text-white mix-blend-difference">
                  {item.hour}
                </span>
                <span className="text-[8px] text-white mix-blend-difference opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.tx_count}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-bold">Less</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <div
                key={intensity}
                className="w-4 h-4 border border-black"
                style={{ backgroundColor: getColor(intensity) }}
              />
            ))}
          </div>
          <span className="font-bold">More</span>
        </div>
      </div>

      {/* Day of Week Heatmap */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">ACTIVITY BY DAY</h3>
        <div className="grid grid-cols-7 gap-2">
          {dailyData.map((item) => {
            const intensity = getIntensity(item.tx_count, maxDaily);
            const color = getColor(intensity);
            return (
              <div
                key={item.day}
                className="aspect-square border-4 border-black flex flex-col items-center justify-center group relative"
                style={{ backgroundColor: color }}
                title={`${getDayName(item.day)} - ${item.tx_count} transactions`}
              >
                <span className="text-xs font-bold text-white mix-blend-difference">
                  {getDayName(item.day).slice(0, 3)}
                </span>
                <span className="text-[10px] text-white mix-blend-difference opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  {item.tx_count}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-bold">Less</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <div
                key={intensity}
                className="w-4 h-4 border border-black"
                style={{ backgroundColor: getColor(intensity) }}
              />
            ))}
          </div>
          <span className="font-bold">More</span>
        </div>
      </div>
    </div>
  );
}

