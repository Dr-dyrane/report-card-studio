import { MetricExplorer } from "@/components/insights/MetricExplorer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { getAnalyticsSnapshot } from "@/lib/school-data";

type DistributionItem = {
  label: string;
  value: number;
  color: string;
};

function buildTrendPath(points: number[]) {
  const width = 320;
  const height = 120;
  const topPad = 12;
  const bottomPad = 16;
  const min = Math.min(...points) - 10;
  const max = Math.max(...points) + 10;

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y =
        topPad + ((max - point) / (max - min || 1)) * (height - topPad - bottomPad);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(points: number[]) {
  const width = 320;
  const height = 120;
  const topPad = 12;
  const bottomPad = 16;
  const min = Math.min(...points) - 10;
  const max = Math.max(...points) + 10;
  const line = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y =
        topPad + ((max - point) / (max - min || 1)) * (height - topPad - bottomPad);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

function buildDonutSegments(items: DistributionItem[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return items.map((item) => {
    const length = (item.value / total) * 100;
    const segment = {
      ...item,
      dasharray: `${length} ${100 - length}`,
      dashoffset: -offset,
    };
    offset += length;
    return segment;
  });
}

export default async function AnalyticsPage() {
  const snapshot = await getAnalyticsSnapshot();
  const metrics = [
    {
      title: "Class average",
      value: String(snapshot.metrics.classAverage),
      hint: "Current term mean",
      details: {
        summary: "A steady middle with enough spread to show where review time matters.",
        points: [
          "This mean is calculated from the active report set in the current workspace.",
          "Use it to sense whether the class is climbing, settling, or drifting during review.",
          "When this shifts after edits, ranking and report balance should move with it.",
        ],
        actionLabel: "Open reports",
        actionHref: "/reports",
      },
    },
    {
      title: "Top total",
      value: String(snapshot.metrics.topTotal),
      hint: "Best saved total",
      tone: "focus" as const,
      details: {
        summary: "The strongest saved report in the active class right now.",
        points: [
          "This top score should stay aligned with the report list and the current ranking order.",
          "A sudden drop or jump here is usually the first signal that a row edit changed the class picture.",
          "Use it as a quick quality check against the live report sheet.",
        ],
        actionLabel: "Open students",
        actionHref: "/students",
      },
    },
    {
      title: "Lowest total",
      value: String(snapshot.metrics.lowestTotal),
      hint: "Needs support",
      details: {
        summary: "The lowest saved total should guide the next review pass.",
        points: [
          "This is the report group to inspect for weak exams, missing subject rows, or both.",
          "When edits land, this number should update with the same truth as reports and rankings.",
          "It is the most useful signal for deciding what to check next before print.",
        ],
        actionLabel: "Review roster",
        actionHref: "/students",
      },
    },
    {
      title: "Published reports",
      value: String(snapshot.metrics.publishedReports),
      hint: "Ready to print",
      details: {
        summary: "Published sheets are the ones ready for preview, print, and export.",
        points: [
          "These reports should already have totals, comments, and print-ready preview.",
          "Preview remains the source of truth for browser print and PDF.",
          "When publish state changes, this should stay aligned with the reports list immediately.",
        ],
        actionLabel: "Open preview flow",
        actionHref: "/reports",
      },
    },
  ];
  const subjectPerformance = snapshot.subjectPerformance;
  const distribution = snapshot.distribution.map((item) => ({
    ...item,
    color:
      item.label === "Strong"
        ? "var(--accent-strong)"
        : item.label === "Attention"
          ? "var(--warning)"
          : "var(--text-muted)",
  }));
  const trendPoints = snapshot.trendPoints;
  const trendPath = buildTrendPath(trendPoints);
  const areaPath = buildAreaPath(trendPoints);
  const donutSegments = buildDonutSegments(distribution);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Insights"
        description="Quiet signals, stronger decisions."
        action={{ label: "Reports", href: "/reports" }}
        secondaryAction={{ label: "Students", href: "/students" }}
      />

      <SectionCard title="Class performance">
        <MetricExplorer title="Insights" metrics={metrics} />
        <div className="mt-4 rounded-[18px] soft-action px-4 py-3 text-sm text-[color:var(--text-muted)]">
          Ranking and totals follow the live report sheets for the active workspace.
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <SectionCard title="Subject story" description="Muted bars with one clear leader and one pressure point.">
          <div className="grid gap-4">
            {subjectPerformance.map((item) => (
              <div key={item.subject} className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                    {item.subject}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.highlight
                        ? "soft-action-tint"
                        : item.low
                          ? "bg-[color:var(--warning-soft)] text-[color:var(--warning)]"
                          : "surface-chip"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
                <div className="surface-pocket h-3 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      item.highlight
                        ? "bg-[color:var(--accent)]"
                        : item.low
                          ? "bg-[color:var(--warning)]"
                          : "bg-[color:var(--text-muted)]/55"
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Distribution" description="One glance at class spread.">
          <div className="grid gap-5 md:grid-cols-[0.48fr_0.52fr] xl:grid-cols-1 2xl:grid-cols-[0.48fr_0.52fr]">
            <div className="flex items-center justify-center">
              <div className="relative h-48 w-48">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="color-mix(in srgb, var(--surface-raised) 88%, transparent)"
                    strokeWidth="14"
                  />
                  {donutSegments.map((segment) => (
                    <circle
                      key={segment.label}
                      cx="60"
                      cy="60"
                      r="42"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="14"
                      strokeLinecap="round"
                      pathLength="100"
                      strokeDasharray={segment.dasharray}
                      strokeDashoffset={segment.dashoffset}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sm text-[color:var(--text-muted)]">Class set</p>
                  <p className="mt-1 text-3xl font-semibold text-[color:var(--text-strong)]">
                    30
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {distribution.map((item) => (
                <div key={item.label} className="surface-pocket rounded-[20px] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                        {item.label}
                      </p>
                    </div>
                    <span className="text-sm text-[color:var(--text-muted)]">
                      {item.value} students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Trend"
        description="A quieter line view of average movement through the review cycle."
      >
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-pocket rounded-[24px] px-4 py-4 sm:px-5 sm:py-5">
            <svg viewBox="0 0 320 120" className="h-44 w-full">
              <defs>
                <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 1, 2].map((line) => (
                <line
                  key={line}
                  x1="0"
                  x2="320"
                  y1={20 + line * 32}
                  y2={20 + line * 32}
                  stroke="color-mix(in srgb, var(--border-soft) 80%, transparent)"
                  strokeWidth="1"
                />
              ))}
              <path d={areaPath} fill="url(#trend-fill)" />
              <path
                d={trendPath}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {trendPoints.map((point, index) => {
                const x = (index / (trendPoints.length - 1)) * 320;
                const y =
                  12 +
                  ((Math.max(...trendPoints) + 10 - point) /
                    (Math.max(...trendPoints) + 10 - (Math.min(...trendPoints) - 10) || 1)) *
                    (120 - 12 - 16);

                return (
                  <circle
                    key={`${point}-${index}`}
                    cx={x}
                    cy={y}
                    r={index === trendPoints.length - 1 ? 5 : 4}
                    fill={index === trendPoints.length - 1 ? "var(--accent)" : "var(--surface)"}
                    stroke="var(--accent-strong)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>

          <div className="grid gap-3">
            {[
              "The class average rises steadily as more report sheets move from draft to checked totals.",
              "The strongest lift happens after score rows are reviewed, not at first entry.",
              "Current momentum suggests the class is stabilizing rather than widening its spread.",
            ].map((point) => (
              <div key={point} className="surface-pocket rounded-[20px] px-4 py-4">
                <p className="text-sm leading-6 text-[color:var(--text-base)]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
