import React, { useRef, useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Exclude the 5 unwanted dummy districts requested by user
const EXCLUDED_DISTRICTS = new Set([
  'south district',
  'central district',
  'east district',
  'north district',
  'west district'
]);

// Helper to normalize and title-case district names (e.g. "bhubaneswar" -> "Bhubaneswar")
const formatDistrictName = (name) => {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export default function DistrictHeatmap({ complaints = [] }) {
  const { t } = useLanguage();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Aggregate complaints dynamically by district
  const chartData = useMemo(() => {
    const districtMap = {};

    complaints.forEach(c => {
      const rawDist = c.district || c.location || '';
      const distName = formatDistrictName(rawDist);

      if (!distName) return;

      // Filter out unwanted dummy districts
      if (EXCLUDED_DISTRICTS.has(distName.toLowerCase())) return;

      if (!districtMap[distName]) {
        districtMap[distName] = {
          district: distName,
          Total: 0,
          Critical: 0,
          Resolved: 0,
          In_Progress: 0,
          categories: {}
        };
      }

      districtMap[distName].Total += 1;
      const severity = c.aiSeverityScore || c.ai_severity_score || 0;
      if (severity >= 80 || c.priority === 'Critical') {
        districtMap[distName].Critical += 1;
      }
      if (c.status === 'Resolved') {
        districtMap[distName].Resolved += 1;
      }
      if (c.status === 'In Progress' || c.status === 'Action Assigned') {
        districtMap[distName].In_Progress += 1;
      }

      const cat = c.category || 'General';
      districtMap[distName].categories[cat] = (districtMap[distName].categories[cat] || 0) + 1;
    });

    // Sort by Total grievances descending to show highest load first
    return Object.values(districtMap).sort((a, b) => b.Total - a.Total);
  }, [complaints]);

  // Check scroll boundary to update button states
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const slide = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  // Calculate dynamic width for smooth sliding (minimum 85px per district bar group)
  const minChartWidth = Math.max(520, chartData.length * 85);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-highest border border-outline-variant p-3 rounded shadow-elevation-2 text-xs z-50">
          <div className="font-bold text-primary mb-1 border-b border-outline-variant/60 pb-1 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
              {data.Total} {t('common.cases', 'cases')}
            </span>
          </div>
          <div className="space-y-1.5 text-on-surface">
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1b365d]"></span>
                {t('dashboard.stats.totalFiled', 'Total Grievances')}:
              </span>
              <span className="font-bold text-primary">{data.Total}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d97706]"></span>
                {t('status.In Progress', 'In Progress')}:
              </span>
              <span className="font-bold text-gov-saffron">{data.In_Progress}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                {t('status.Resolved', 'Resolved')}:
              </span>
              <span className="font-bold text-gov-green">{data.Resolved}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                {t('priority.Critical', 'High Risk / Alert')}:
              </span>
              <span className="font-bold text-error">{data.Critical}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 sm:p-4 shadow-ambient">
      {/* Header with Title, Badges, and Slide Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-outline-variant">
        <div>
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">bar_chart</span>
            <span>{t('admin.districtHeatmap', 'District Hotspot Heatmap & Grievance Distribution')}</span>
          </h3>
          <p className="text-[11px] text-on-surface-variant">
            {t('admin.heatmapSubtitle', 'Interactive chart showing district load, severity counts, and redressal progress')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Active District Count Badge */}
          <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>{chartData.length} {t('common.districts', 'Districts')}</span>
          </span>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-1 bg-surface border border-outline-variant rounded p-0.5">
            <button
              onClick={() => slide('left')}
              className="p-1 rounded hover:bg-surface-variant text-on-surface transition-colors cursor-pointer flex items-center justify-center title='Slide Left'"
              title="Slide Left"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="text-[9px] text-on-surface-variant font-medium px-1 select-none">
              Slide
            </span>
            <button
              onClick={() => slide('right')}
              className="p-1 rounded hover:bg-surface-variant text-on-surface transition-colors cursor-pointer flex items-center justify-center title='Slide Right'"
              title="Slide Right"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Area with Smooth Slide / Scroll */}
      {chartData.length === 0 ? (
        <div className="h-72 w-full flex flex-col items-center justify-center text-on-surface-variant text-xs">
          <span className="material-symbols-outlined text-3xl mb-1 text-outline">location_off</span>
          <span>No district grievance data available</span>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="w-full overflow-x-auto overflow-y-hidden pb-2 select-none scroll-smooth"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent'
          }}
        >
          <div style={{ width: `${minChartWidth}px`, minWidth: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 25, left: -15, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="district"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={55}
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar
                  dataKey="Total"
                  fill="#1b365d"
                  name={t('dashboard.stats.totalFiled', 'Total Grievances')}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="In_Progress"
                  fill="#d97706"
                  name={t('status.In Progress', 'In Progress')}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="Resolved"
                  fill="#16a34a"
                  name={t('status.Resolved', 'Resolved')}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="Critical"
                  fill="#dc2626"
                  name={t('priority.Critical', 'Critical Alert')}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Subtle bottom indicator */}
      {chartData.length > 5 && (
        <div className="flex items-center justify-between text-[10px] text-on-surface-variant pt-1 px-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">swipe</span>
            <span>Slide horizontally or use arrows to view all districts</span>
          </span>
          <span className="font-semibold text-primary">
            Highest load: {chartData[0]?.district} ({chartData[0]?.Total})
          </span>
        </div>
      )}
    </div>
  );
}
