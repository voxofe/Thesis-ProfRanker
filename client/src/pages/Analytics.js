import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CustomSelect from "../components/CustomSelect";
import PositionSelect from "../components/PositionSelect";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import LoadingIndicator from "../components/LoadingIndicator";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-lg border border-patras-buccaneer/20 bg-patras-albescentWhite/20 p-4 shadow-sm">
      <p className="text-sm font-medium text-patras-buccaneer/70">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-patras-buccaneer">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-patras-buccaneer/70">{subtitle}</p> : null}
    </div>
  );
}

function ChartContainer({ title, children }) {
  return (
    <div className="rounded-lg border border-patras-capePalliser/50 bg-white dark:bg-[var(--color-bg-card)] shadow-md overflow-hidden">
      <div className="bg-patras-buccaneer px-4 py-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyChartState() {
  return <p className="text-sm text-patras-buccaneer/70">Δεν υπάρχουν διαθέσιμα δεδομένα.</p>;
}

function UnifiedTooltip({ title, rows }) {
  if (!rows?.length) return null;
  return (
    <div className="rounded-md border border-patras-capePalliser/60 bg-white dark:bg-[var(--color-bg-card)] px-4 py-3 text-sm shadow-lg">
      {title ? <div className="mb-1 font-semibold text-patras-buccaneer">{title}</div> : null}
      <div className="space-y-1">
        {rows.map((row, idx) => (
          <div key={`${row.label}-${idx}`} className="text-patras-buccaneer/90">
            {row?.text ? (
              <span>{row.text}</span>
            ) : (
              <>
                <span className="font-semibold">{row.label}: </span>
                <span>{row.value}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChartCard({
  title,
  data,
  layout = "vertical",
  totalCount = null,
  fixedHeight,
  tooltipVariant = "default",
}) {
  if (!data.length) {
    return (
      <ChartContainer title={title}>
        <EmptyChartState />
      </ChartContainer>
    );
  }

  const isHorizontal = layout === "horizontal";
  const chartHeight =
    typeof fixedHeight === "number"
      ? fixedHeight
      : isHorizontal
        ? 280
        : Math.max(280, data.length * 48);
  const resolvedTotal =
    typeof totalCount === "number"
      ? totalCount
      : data.reduce((sum, row) => sum + Number(row?.value || 0), 0);

  return (
    <ChartContainer title={title}>
      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout={isHorizontal ? "horizontal" : "vertical"}
            margin={{ top: 8, right: 24, left: isHorizontal ? 12 : 36, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eadccf" />
            {isHorizontal ? (
              <>
                <XAxis dataKey="name" tick={{ fill: "#7f3b2e", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#7f3b2e", fontSize: 12 }} />
              </>
            ) : (
              <>
                <XAxis type="number" allowDecimals={false} tick={{ fill: "#7f3b2e", fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fill: "#7f3b2e", fontSize: 12 }}
                />
              </>
            )}
            <Tooltip
              cursor={{ fill: "#f7eee5" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload || {};

                if (tooltipVariant === "phdYear") {
                  const count = Number(row?.value ?? 0);
                  return (
                    <UnifiedTooltip
                      title={String(row?.name ?? label ?? "")}
                      rows={[
                        {
                          text: `${count} ${count === 1 ? "αίτηση" : "αιτήσεις"}`,
                        },
                      ]}
                    />
                  );
                }

                if (tooltipVariant === "workExperience") {
                  const applicants = Number(row?.value ?? 0);
                  const years = row?.name ?? label ?? "0";
                  return (
                    <UnifiedTooltip
                      title={`${years} χρόνια`}
                      rows={[
                        {
                          text: `${applicants} ${applicants === 1 ? "υποψήφιος/α" : "υποψήφιοι"}`,
                        },
                      ]}
                    />
                  );
                }

                return (
                  <UnifiedTooltip
                    title={String(row?.name ?? label ?? "")}
                    rows={[
                      {
                        label: "Τιμή",
                        value: row?.valueLabel ?? row?.value ?? 0,
                      },
                    ]}
                  />
                );
              }}
            />
            <Bar
              dataKey="value"
              fill="#7f3b2e"
              radius={[4, 4, 4, 4]}
              isAnimationActive
              animationBegin={120}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="pt-2 text-sm font-medium text-patras-buccaneer/80">
        Σύνολο: {resolvedTotal}
      </div>
    </ChartContainer>
  );
}

function PublicationCountCard({ title, data }) {
  if (!data.length) {
    return (
      <ChartContainer title={title}>
        <EmptyChartState />
      </ChartContainer>
    );
  }
  const total = data.reduce((sum, row) => sum + Number(row?.value || 0), 0);

  const normalized = (data || [])
    .map((row) => ({
      publications: Number(row?.name ?? row?.publications ?? 0),
      count: Number(row?.value ?? row?.count ?? 0),
    }))
    .filter((row) => Number.isFinite(row.publications) && Number.isFinite(row.count) && row.publications >= 0);

  const publicationCountMap = new Map();
  normalized.forEach((row) => {
    const pubs = Math.floor(row.publications);
    publicationCountMap.set(pubs, (publicationCountMap.get(pubs) || 0) + row.count);
  });

  const maxPublications = Math.max(0, ...Array.from(publicationCountMap.keys()));
  const histogramData = Array.from({ length: maxPublications + 1 }, (_, i) => ({
    name: String(i),
    value: publicationCountMap.get(i) || 0,
  }));

  return (
    <ChartContainer title={title}>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={histogramData} layout="horizontal" margin={{ top: 8, right: 24, left: 12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eadccf" />
            <XAxis dataKey="name" tick={{ fill: "#7f3b2e", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#7f3b2e", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "#f7eee5" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload || {};
                const count = Number(row?.value ?? 0);
                return (
                  <UnifiedTooltip
                    title={`${row?.name ?? 0} δημοσιεύσεις`}
                    rows={[{ text: `${count} ${count === 1 ? "αίτηση" : "αιτήσεις"}` }]}
                  />
                );
              }}
            />
            <Bar
              dataKey="value"
              fill="#7f3b2e"
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationBegin={120}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="pt-2 text-sm font-medium text-patras-buccaneer/80">
        Σύνολο: {total} αιτήσεις
      </div>
    </ChartContainer>
  );
}

function WorkExperienceVerticalCard({ title, data, fixedHeight = 300 }) {
  if (!data.length) {
    return (
      <ChartContainer title={title}>
        <EmptyChartState />
      </ChartContainer>
    );
  }

  const total = data.reduce((sum, row) => sum + Number(row?.value || 0), 0);

  return (
    <ChartContainer title={title}>
      <div style={{ width: "100%", height: fixedHeight }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="horizontal" margin={{ top: 8, right: 24, left: 12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eadccf" />
            <XAxis dataKey="name" tick={{ fill: "#7f3b2e", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#7f3b2e", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "#f7eee5" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload || {};
                const applicants = Number(row?.value ?? 0);
                const years = row?.name ?? label ?? "0";
                return (
                  <UnifiedTooltip
                    title={`${years} χρόνια`}
                    rows={[
                      {
                        text: `${applicants} ${applicants === 1 ? "υποψήφιος/α" : "υποψήφιοι"}`,
                      },
                    ]}
                  />
                );
              }}
            />
            <Bar
              dataKey="value"
              fill="#7f3b2e"
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationBegin={120}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="pt-2 text-sm font-medium text-patras-buccaneer/80">
        Σύνολο: {total}
      </div>
    </ChartContainer>
  );
}

function RelevanceHistogramCard({ title, data }) {
  if (!data.length) {
    return (
      <ChartContainer title={title}>
        <EmptyChartState />
      </ChartContainer>
    );
  }
  const total = data.reduce((sum, row) => sum + Number(row?.value || 0), 0);
  return (
    <ChartContainer title={title}>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 18, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eadccf" />
            <XAxis
              type="number"
              dataKey="points"
              domain={[0, 45]}
              allowDecimals={false}
              tickCount={10}
              tick={{ fill: "#7f3b2e", fontSize: 12 }}
            />
            <YAxis allowDecimals={false} tick={{ fill: "#7f3b2e", fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload || {};
                const count = Number(row?.value ?? 0);
                return (
                  <UnifiedTooltip
                    title={`${row?.points ?? 0} μόρια συνάφειας`}
                    rows={[{ text: `${count} ${count === 1 ? "αίτηση" : "αιτήσεις"}` }]}
                  />
                );
              }}
            />
            <Bar
              dataKey="value"
              fill="#b97f58"
              barSize={8}
              radius={[2, 2, 0, 0]}
              isAnimationActive
              animationBegin={120}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="pt-2 text-sm font-medium text-patras-buccaneer/80">
        Σύνολο: {total}
      </div>
    </ChartContainer>
  );
}

function DistributionAreaCard({ title, data }) {
  if (!data.length) {
    return (
      <ChartContainer title={title}>
        <EmptyChartState />
      </ChartContainer>
    );
  }

  const total = data.reduce((sum, row) => sum + Number(row?.value || 0), 0);

  return (
    <ChartContainer title={title}>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 18, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eadccf" />
            <XAxis
              type="number"
              dataKey="score"
              domain={[0, 96]}
              allowDecimals={false}
              tickCount={13}
              tick={{ fill: "#7f3b2e", fontSize: 12 }}
            />
            <YAxis allowDecimals={false} tick={{ fill: "#7f3b2e", fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload || {};
                const applicationsCount = Number(row?.value ?? 0);
                return (
                  <UnifiedTooltip
                    title={`${row?.score ?? 0} μόρια`}
                    rows={[
                      {
                        text: `${applicationsCount} ${applicationsCount === 1 ? "αίτηση" : "αιτήσεις"}`,
                      },
                    ]}
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#7f3b2e"
              fill="#d7b39c"
              fillOpacity={0.7}
              strokeWidth={2.4}
              isAnimationActive
              animationBegin={120}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="pt-2 text-sm font-medium text-patras-buccaneer/80">
        Σύνολο: {total}
      </div>
    </ChartContainer>
  );
}

function GenderPieCard({ data, totalCount }) {
  const pieColors = ["#7f3b2e", "#b97f58", "#d7b39c", "#e9d5c6"];

  if (!data.length) {
    return (
      <ChartContainer title="Φύλο">
        <EmptyChartState />
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Φύλο">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
              >
                {data.map((entry, idx) => (
                  <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0]?.payload || {};
                  return (
                    <UnifiedTooltip
                      rows={[
                        {
                          label: row?.name || "Χωρίς δήλωση",
                          value: row?.valueLabel ?? row?.value ?? 0,
                        },
                      ]}
                    />
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 self-center">
          {data.map((row, idx) => (
            <div key={row.name} className="flex items-center justify-between gap-3 rounded-md border border-patras-buccaneer/15 bg-patras-albescentWhite/20 px-3 py-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                />
                <span className="text-sm text-patras-buccaneer">{row.name}</span>
              </div>
              <span className="text-sm font-semibold text-patras-buccaneer">{row.valueLabel}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-2 text-sm font-medium text-patras-buccaneer/80">Σύνολο: {totalCount}</div>
    </ChartContainer>
  );
}

function SubmissionTimelineCard({ timeline }) {
  const granularity = timeline?.granularity || "month";
  const series = Array.isArray(timeline?.series) ? timeline.series : [];

  if (!series.length) {
    return (
      <ChartContainer title="Ρυθμός υποβολής αιτήσεων">
        <EmptyChartState />
      </ChartContainer>
    );
  }

  const granularityLabelMap = {
    day: "ανά ημέρα",
    week: "ανά εβδομάδα",
    month: "ανά μήνα",
  };

  const chartData = series.map((point) => ({
    name: point.label || point.bucket || "",
    applications: Number(point.applications || 0),
    cumulative: Number(point.cumulative || 0),
  }));

  return (
    <ChartContainer title="Ρυθμός υποβολής αιτήσεων">
      <div className="mb-2 text-xs text-patras-buccaneer/70">
        Ανάλυση {granularityLabelMap[granularity] || "ανά περίοδο"}
      </div>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 18, left: 8, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eadccf" />
            <XAxis dataKey="name" tick={{ fill: "#7f3b2e", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#7f3b2e", fontSize: 12 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const rows = payload.map((item) => {
                  const key = item?.dataKey;
                  if (key === "applications") {
                    return {
                      label: "Υποβολές περιόδου",
                      value: Number(item?.value ?? 0),
                    };
                  }
                  if (key === "cumulative") {
                    return {
                      label: "Συνολικές υποβολές",
                      value: Number(item?.value ?? 0),
                    };
                  }
                  return {
                    label: String(key || "Τιμή"),
                    value: Number(item?.value ?? 0),
                  };
                });
                return <UnifiedTooltip title={String(label ?? "")} rows={rows} />;
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => {
                if (value === "applications") return "Υποβολές περιόδου";
                if (value === "cumulative") return "Συνολικές υποβολές";
                return value;
              }}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="#7f3b2e"
              strokeWidth={2.5}
              dot={{ r: 2.5 }}
              activeDot={{ r: 5 }}
              isAnimationActive
              animationDuration={1400}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#b97f58"
              strokeDasharray="6 4"
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={1700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

function normalizeSelectValue(nextValue) {
  return nextValue === "select" ? "" : nextValue;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    school: "",
    department: "",
    positionId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Απαιτείται σύνδεση ως διαχειριστής.");
      setLoading(false);
      return;
    }

    const params = {};
    if (filters.school) params.school = filters.school;
    if (filters.department) params.department = filters.department;
    if (filters.positionId) params.positionId = filters.positionId;

    setLoading(true);
    setError("");
    axios({
      method: "GET",
      url: `${API_BASE_URL}/api/admin/analytics/summary`,
      params,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setAnalytics(response.data || null);
      })
      .catch((err) => {
        const serverError = err?.response?.data?.error;
        setError(serverError || "Αδυναμία φόρτωσης analytics.");
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const summary = analytics?.summary || {};
  const breakdowns = analytics?.breakdowns || {};
  const available = analytics?.filters || {};

  const schools = available.schools || [];
  const departments = available.departments || [];
  const positions = available.positions || [];
  const positionById = useMemo(
    () => new Map(positions.map((position) => [String(position.id), position])),
    [positions]
  );
  const schoolByDepartment = useMemo(() => {
    const mapping = new Map();
    positions.forEach((position) => {
      if (position?.department && position?.school && !mapping.has(position.department)) {
        mapping.set(position.department, position.school);
      }
    });
    return mapping;
  }, [positions]);

  const genderRows = useMemo(() => {
    const rows = Array.isArray(breakdowns.byGender) ? [...breakdowns.byGender] : [];
    const rank = { male: 0, female: 1, unknown: 2 };
    rows.sort((a, b) => {
      const ra = rank[a?.key] ?? 9;
      const rb = rank[b?.key] ?? 9;
      if (ra !== rb) return ra - rb;
      return String(a?.label || "").localeCompare(String(b?.label || ""), "el");
    });
    return rows;
  }, [breakdowns.byGender]);
  const totalGenderCount = Number(summary.distinctApplicants || 0);

  const genderChartData = genderRows.map((row) => {
    const value = Number(row.count || 0);
    const pct = totalGenderCount ? (value / totalGenderCount) * 100 : 0;
    return {
      name: row.label || row.name || "Χωρίς δήλωση",
      value,
      valueLabel: `${value} (${pct.toFixed(1)}%)`,
    };
  });

  const phdYearChartData = (breakdowns.byPhdYear || []).map((row) => ({
    name: String(row.year),
    value: Number(row.count || 0),
    valueLabel: String(Number(row.count || 0)),
  }));

  const workExperienceChartData = (breakdowns.byWorkExperience || []).map((row) => ({
    name: String(row.years),
    value: Number(row.count || 0),
    valueLabel: String(Number(row.count || 0)),
  }));

  const scorePointChartData = (breakdowns.scorePoints || []).map((row) => ({
    score: Number(row.score),
    value: Number(row.count || 0),
    valueLabel: String(Number(row.count || 0)),
  }));

  const publicationCountChartData = (breakdowns.byPublicationCount || []).map((row) => ({
    name: String(row.publications),
    value: Number(row.count || 0),
    valueLabel: String(Number(row.count || 0)),
  }));

  const relevancePointChartData = (breakdowns.byRelevancePoints || []).map((row) => ({
    points: Number(row.points),
    value: Number(row.count || 0),
    valueLabel: String(Number(row.count || 0)),
  }));

  const submissionTimeline = breakdowns.submissionTimeline || { granularity: "month", series: [] };

  const schoolOptions = schools.map((school) => ({ value: school, label: school }));
  const departmentOptions = departments.map((department) => ({ value: department, label: department }));
  const positionSelectOptions = useMemo(
    () => [
      { id: "", label: "Όλες", __isExtra: true },
      ...positions.map((position) => ({
        id: String(position.id),
        school: position.school,
        department: position.department,
        scientificField: position.scientificField,
      })),
    ],
    [positions]
  );

  return (
    <div className="space-y-6">
    <div className="pt-0">
      <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800 dark:text-[var(--color-text-primary)]">
        Στατιστικά
      </h1>
      </div>

      <div className="mb-6 rounded-lg border border-patras-capePalliser/50 bg-white dark:bg-[var(--color-bg-card)] shadow-md overflow-visible">

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <CustomSelect
            label="Σχολή"
            value={filters.school || "select"}
            placeholder="Όλες"
            options={schoolOptions}
            onChange={(value) => {
              const safeValue = normalizeSelectValue(value);
              setFilters((prev) => ({
                ...prev,
                school: safeValue,
                department: "",
                positionId: "",
              }));
            }}
          />

          <CustomSelect
            label="Τμήμα"
            value={filters.department || "select"}
            placeholder="Όλα"
            options={departmentOptions}
            onChange={(value) => {
              const safeValue = normalizeSelectValue(value);
              const inferredSchool = safeValue ? schoolByDepartment.get(safeValue) || "" : "";
              setFilters((prev) => ({
                ...prev,
                school: inferredSchool || prev.school || "",
                department: safeValue,
                positionId: "",
              }));
            }}
          />

          <div>
            <PositionSelect
              positions={positionSelectOptions}
              value={filters.positionId || ""}
              onChange={(value) => {
                const selectedPosition = value ? positionById.get(String(value)) : null;
                setFilters((prev) => ({
                  ...prev,
                  positionId: value || "",
                  department: selectedPosition?.department || prev.department,
                  school: selectedPosition?.school || prev.school,
                }));
              }}
              label="Θέση"
              placeholder="Αναζήτηση θέσης..."
              maxResults={100}
              style="mb-0"
              showAllOnFocus
              clearButtonClearsQueryOnly
              selectedLabelFormatter={(position) =>
                position?.__isExtra ? position.label || "" : position?.scientificField || ""
              }
            />
          </div>

          <div className="flex items-start pt-[32px]">
            <button
              type="button"
              onClick={() =>
                setFilters({
                  school: "",
                  department: "",
                  positionId: "",
                })
              }
              className="inline-flex w-full items-center justify-center rounded-md bg-white dark:bg-[var(--color-bg-card)] px-4 py-2 text-sm font-semibold text-patras-buccaneer border border-patras-buccaneer shadow-sm hover:bg-patras-albescentWhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer"
            >
              Επαναφορά
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-patras-capePalliser/50 bg-white dark:bg-[var(--color-bg-card)] p-6 text-sm text-patras-buccaneer shadow-md">
          <LoadingIndicator size="sm" textClassName="mt-2 text-patras-buccaneer" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-sm text-red-700 shadow-md">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Αριθμός υποψηφίων" value={summary.distinctApplicants || 0} />
            <StatCard title="Συνολικές αιτήσεις" value={summary.totalApplications || 0} />
            <StatCard
              title="Μ.Ο. συνολικών μορίων"
              value={summary.avgTotalPoints ?? 0}
            />
            <StatCard
              title="Μ.Ο. χρόνων εμπειρίας"
              value={summary.avgWorkExperienceYears ?? 0}
            />
            <StatCard
              title="Μ.Ο. δημοσιεύσεων ανά αίτηση"
              value={summary.avgPublicationsPerApplication ?? 0}
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <GenderPieCard data={genderChartData} totalCount={totalGenderCount} />
            <BarChartCard
              title="Έτος λήψης διδακτορικού τίτλου"
              data={phdYearChartData}
              layout="horizontal"
              tooltipVariant="phdYear"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/*
            <BarChartCard
              title="Αιτήσεις ανά σχολή"
              data={schoolChartData}
              layout="vertical"
            />
            */}
            <WorkExperienceVerticalCard
              title="Χρόνια μεταδιδακτορικής εργασιακής εμπειρίας"
              data={workExperienceChartData}
              fixedHeight={300}
            />
            <DistributionAreaCard
              title="Κατανομή μορίων ανά αίτηση"
              data={scorePointChartData}
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RelevanceHistogramCard
              title="Κατανομή μορίων συνάφειας ανά αίτηση"
              data={relevancePointChartData}
            />
            <PublicationCountCard
              title="Δημοσιεύσεις ανά αίτηση"
              data={publicationCountChartData}
            />
          </div>

          <div className="mb-6">
            <SubmissionTimelineCard timeline={submissionTimeline} />
          </div>

          {/*
          <div className="mb-6 rounded-lg border border-patras-capePalliser/50 bg-white dark:bg-[var(--color-bg-card)] shadow-md overflow-hidden">
            <div className="bg-patras-buccaneer px-4 py-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Top τμήματα (ανά πλήθος αιτήσεων)</h2>
            </div>
            <div className="p-4">
            {topDepartments.length === 0 ? (
              <p className="text-sm text-patras-buccaneer/70">Δεν υπάρχουν διαθέσιμα δεδομένα.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-[var(--color-bg-card)] text-sm">
                  <thead className="bg-patras-buccaneer">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white border-r border-patras-albescentWhite">Τμήμα</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white border-r border-patras-albescentWhite">Αιτήσεις</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white border-r border-patras-albescentWhite">Αιτούντες</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">Μ.Ο. μορίων</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-patras-cameo">
                    {topDepartments.map((row) => (
                      <tr key={row.name}>
                        <td className="px-4 py-3 text-center text-patras-buccaneer border-r border-patras-albescentWhite">{row.name}</td>
                        <td className="px-4 py-3 text-center text-patras-buccaneer border-r border-patras-albescentWhite">{row.applications}</td>
                        <td className="px-4 py-3 text-center text-patras-buccaneer border-r border-patras-albescentWhite">{row.applicants}</td>
                        <td className="px-4 py-3 text-center text-patras-buccaneer font-semibold">{row.avgPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </div>
          */}

          {/*
          <div className="rounded-lg border border-patras-capePalliser/50 bg-white dark:bg-[var(--color-bg-card)] shadow-md overflow-hidden">
            <div className="bg-patras-buccaneer px-4 py-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Ανά θέση (Top 10)</h2>
            </div>
            <div className="p-4">
            {topPositions.length === 0 ? (
              <p className="text-sm text-patras-buccaneer/70">Δεν υπάρχουν διαθέσιμα δεδομένα.</p>
            ) : (
              <div className="space-y-3">
                {topPositions.map((row) => (
                  <div
                    key={row.positionId}
                    className="rounded-lg border border-patras-buccaneer/10 bg-patras-albescentWhite/30 p-3"
                  >
                    <p className="font-medium text-patras-buccaneer">{row.name}</p>
                    <p className="text-xs text-patras-buccaneer/70">
                      {row.school} • {row.department}
                    </p>
                    <p className="mt-1 text-sm text-patras-buccaneer">
                      Αιτήσεις: <span className="font-semibold">{row.applications}</span> | Αιτούντες:{" "}
                      <span className="font-semibold">{row.applicants}</span> | Μ.Ο. μορίων:{" "}
                      <span className="font-semibold">{row.avgPoints}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
          */}
        </>
      )}
    </div>
  );
}
