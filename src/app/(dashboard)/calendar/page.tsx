"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { INTERVIEW_TYPE_LABELS } from "@/lib/constants";

type CalendarInterview = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  meetingLink: string | null;
  location: string | null;
  isCompleted: boolean;
  process: {
    id: string;
    candidate: { firstName: string; lastName: string };
    firm: { name: string };
    position: { title: string };
  };
};

const TURKISH_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const TURKISH_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const TYPE_COLORS: Record<string, string> = {
  face_to_face: "bg-purple-100 text-purple-700 border-purple-200",
  online: "bg-blue-100 text-blue-700 border-blue-200",
  phone: "bg-slate-100 text-slate-700 border-slate-200",
};

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0 (adjust from Sunday-based)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  let dow = d.getDay() - 1;
  if (dow < 0) dow = 6;
  d.setDate(d.getDate() - dow);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [interviews, setInterviews] = useState<CalendarInterview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    let start: Date, end: Date;

    if (view === "month") {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    } else {
      const weekDates = getWeekDates(currentDate);
      start = weekDates[0];
      end = new Date(weekDates[6]);
      end.setHours(23, 59, 59);
    }

    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const res = await fetch(`/api/calendar?${params}`);
    const json = await res.json();
    if (json.success) setInterviews(json.data);
    setLoading(false);
  }, [currentDate, view]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  function navigateMonth(delta: number) {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  }

  function navigateWeek(delta: number) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta * 7);
    setCurrentDate(d);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  function getInterviewsForDate(date: Date) {
    return interviews.filter((i) => isSameDay(new Date(i.scheduledAt), date));
  }

  const today = new Date();
  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const weekDates = getWeekDates(currentDate);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Takvim</h1>
          <p className="mt-1 text-sm text-slate-500">Mülakat ve toplantılarınızı takip edin</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (view === "month" ? navigateMonth(-1) : navigateWeek(-1))}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-slate-900 min-w-[200px] text-center">
            {view === "month"
              ? `${TURKISH_MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : `${weekDates[0].getDate()} - ${weekDates[6].getDate()} ${TURKISH_MONTHS[weekDates[6].getMonth()]} ${weekDates[6].getFullYear()}`}
          </h2>
          <button
            onClick={() => (view === "month" ? navigateMonth(1) : navigateWeek(1))}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={goToday}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Bugün
          </button>
        </div>

        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setView("month")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Ay
          </button>
          <button
            onClick={() => setView("week")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "week" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Hafta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-100" />
      ) : view === "month" ? (
        /* Monthly View */
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7">
            {TURKISH_DAYS.map((d) => (
              <div key={d} className="border-b border-slate-100 bg-slate-50/80 px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30" />;
              }
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayInterviews = getInterviewsForDate(date);
              const isToday = isSameDay(date, today);

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 ${
                    isToday ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday ? "bg-indigo-600 text-white" : "text-slate-700"
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayInterviews.slice(0, 2).map((iv) => (
                      <button
                        key={iv.id}
                        onClick={() => router.push(`/processes/${iv.process.id}`)}
                        className={`w-full truncate rounded border px-1.5 py-0.5 text-left text-[10px] font-medium ${
                          TYPE_COLORS[iv.type] || TYPE_COLORS.phone
                        } ${iv.isCompleted ? "opacity-50" : ""}`}
                      >
                        {new Date(iv.scheduledAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}{" "}
                        {iv.process.candidate.firstName} {iv.process.candidate.lastName[0]}.
                      </button>
                    ))}
                    {dayInterviews.length > 2 && (
                      <p className="text-[10px] font-medium text-indigo-600 pl-1">
                        +{dayInterviews.length - 2} daha
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly View */
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7">
            {weekDates.map((date, i) => {
              const isToday = isSameDay(date, today);
              const dayInterviews = getInterviewsForDate(date);

              return (
                <div key={i} className="border-r border-slate-100 last:border-r-0">
                  <div className={`border-b border-slate-100 px-2 py-3 text-center ${
                    isToday ? "bg-indigo-50" : "bg-slate-50/80"
                  }`}>
                    <p className="text-xs font-semibold uppercase text-slate-500">{TURKISH_DAYS[i]}</p>
                    <p className={`mt-1 text-lg font-bold ${isToday ? "text-indigo-600" : "text-slate-900"}`}>
                      {date.getDate()}
                    </p>
                  </div>
                  <div className="min-h-[400px] space-y-2 p-2">
                    {dayInterviews.length === 0 ? (
                      <p className="pt-4 text-center text-xs text-slate-300">—</p>
                    ) : (
                      dayInterviews.map((iv) => (
                        <button
                          key={iv.id}
                          onClick={() => router.push(`/processes/${iv.process.id}`)}
                          className={`w-full rounded-lg border p-2.5 text-left transition-shadow hover:shadow-md ${
                            TYPE_COLORS[iv.type] || TYPE_COLORS.phone
                          } ${iv.isCompleted ? "opacity-50" : ""}`}
                        >
                          <p className="text-xs font-bold">
                            {new Date(iv.scheduledAt).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            <span className="font-normal"> · {iv.durationMinutes} dk</span>
                          </p>
                          <p className="mt-1 truncate text-xs font-medium">
                            {iv.process.candidate.firstName} {iv.process.candidate.lastName}
                          </p>
                          <p className="truncate text-[10px] opacity-80">
                            {iv.process.firm.name}
                          </p>
                          <p className="mt-1 text-[10px] font-medium">
                            {INTERVIEW_TYPE_LABELS[iv.type] || iv.type}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-purple-200" />
          <span className="text-xs text-slate-500">Yüz Yüze</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-blue-200" />
          <span className="text-xs text-slate-500">Online</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-slate-200" />
          <span className="text-xs text-slate-500">Telefon</span>
        </div>
      </div>
    </div>
  );
}
