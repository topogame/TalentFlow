"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  STAGE_COLORS,
  STAGE_BG_COLORS,
  CLOSED_STAGES,
} from "@/lib/constants";

type ProcessItem = {
  id: string;
  stage: string;
  fitnessScore: number | null;
  closedAt: string | null;
  stageChangedAt: string;
  updatedAt: string;
  candidate: { id: string; firstName: string; lastName: string; currentTitle: string | null };
  firm: { id: string; name: string };
  position: { id: string; title: string };
  assignedTo: { id: string; firstName: string; lastName: string };
};

type UserOption = { id: string; firstName: string; lastName: string };

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type PendingDrop = {
  processId: string;
  fromStage: string;
  toStage: string;
  sourceIndex: number;
  destIndex: number;
  type: "close" | "reopen";
};

export default function ProcessesPage() {
  const t = useTranslations("processes");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [kanbanData, setKanbanData] = useState<Record<string, ProcessItem[]> | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);

  // DnD state
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [closeNote, setCloseNote] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const kanbanSnapshot = useRef<Record<string, ProcessItem[]> | null>(null);

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (viewMode === "kanban") {
      params.set("view", "kanban");
    } else {
      params.set("page", String(page));
      params.set("limit", "20");
    }
    if (search) params.set("search", search);
    if (stageFilter) params.set("stage", stageFilter);
    if (assignedToFilter) params.set("assignedToId", assignedToFilter);

    try {
      const res = await fetch(`/api/processes?${params}`);
      const data = await res.json();
      if (data.success) {
        if (viewMode === "kanban") {
          setKanbanData(data.data);
        } else {
          setProcesses(data.data);
          setPagination(data.pagination);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, stageFilter, assignedToFilter, viewMode]);

  useEffect(() => {
    fetch("/api/users?limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUsers(json.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  // Clear drag error after 4 seconds
  useEffect(() => {
    if (!dragError) return;
    const timer = setTimeout(() => setDragError(null), 4000);
    return () => clearTimeout(timer);
  }, [dragError]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProcesses();
  }

  // ─── DnD helpers ───

  function moveCard(
    data: Record<string, ProcessItem[]>,
    fromStage: string,
    toStage: string,
    sourceIndex: number,
    destIndex: number
  ): Record<string, ProcessItem[]> {
    const fromItems = [...(data[fromStage] || [])];
    const toItems = fromStage === toStage ? fromItems : [...(data[toStage] || [])];
    const [moved] = fromItems.splice(sourceIndex, 1);
    const updated = { ...moved, stage: toStage };
    if (fromStage === toStage) {
      fromItems.splice(destIndex, 0, updated);
    } else {
      toItems.splice(destIndex, 0, updated);
    }
    return {
      ...data,
      [fromStage]: fromItems,
      ...(fromStage !== toStage ? { [toStage]: toItems } : {}),
    };
  }

  async function applyStageChange(processId: string, toStage: string, note?: string) {
    const body: Record<string, string> = { stage: toStage };
    if (note) body.note = note;

    const res = await fetch(`/api/processes/${processId}/stage`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: t("stageChangeFailed") }));
      throw new Error(err.error || t("stageChangeFailed"));
    }
  }

  function rollback() {
    if (kanbanSnapshot.current) {
      setKanbanData(kanbanSnapshot.current);
      kanbanSnapshot.current = null;
    }
  }

  async function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;

    // Dropped outside
    if (!destination) return;
    // Same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (!kanbanData) return;

    const fromStage = source.droppableId;
    const toStage = destination.droppableId;

    // If moving to a closing stage, show close confirmation modal
    if (
      fromStage !== toStage &&
      (CLOSED_STAGES as readonly string[]).includes(toStage) &&
      !(CLOSED_STAGES as readonly string[]).includes(fromStage)
    ) {
      setPendingDrop({
        processId: draggableId,
        fromStage,
        toStage,
        sourceIndex: source.index,
        destIndex: destination.index,
        type: "close",
      });
      setCloseNote("");
      setShowCloseModal(true);
      return;
    }

    // If moving FROM a closed stage (reopen or change closed stage), show reopen confirmation
    if (
      fromStage !== toStage &&
      (CLOSED_STAGES as readonly string[]).includes(fromStage)
    ) {
      setPendingDrop({
        processId: draggableId,
        fromStage,
        toStage,
        sourceIndex: source.index,
        destIndex: destination.index,
        type: (CLOSED_STAGES as readonly string[]).includes(toStage) ? "close" : "reopen",
      });
      setCloseNote("");
      setShowCloseModal(true);
      return;
    }

    // Optimistic update
    kanbanSnapshot.current = kanbanData;
    setKanbanData(moveCard(kanbanData, fromStage, toStage, source.index, destination.index));

    if (fromStage !== toStage) {
      try {
        await applyStageChange(draggableId, toStage);
      } catch (err) {
        rollback();
        setDragError(err instanceof Error ? err.message : t("stageChangeFailed"));
      }
    }
  }

  async function confirmCloseDrop() {
    if (!pendingDrop || !kanbanData) return;

    const { processId, fromStage, toStage, sourceIndex, destIndex } = pendingDrop;

    // Optimistic update
    kanbanSnapshot.current = kanbanData;
    setKanbanData(moveCard(kanbanData, fromStage, toStage, sourceIndex, destIndex));
    setShowCloseModal(false);

    try {
      await applyStageChange(processId, toStage, closeNote || undefined);
    } catch (err) {
      rollback();
      setDragError(err instanceof Error ? err.message : t("processCloseFailed"));
    }
    setPendingDrop(null);
    setCloseNote("");
  }

  function cancelCloseDrop() {
    setShowCloseModal(false);
    setPendingDrop(null);
    setCloseNote("");
  }

  function renderStars(score: number | null) {
    if (!score) return <span className="text-slate-300">—</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`h-3.5 w-3.5 ${i <= score ? "text-amber-400" : "text-slate-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
        </div>
        <Link
          href="/processes/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("newProcess")}
        </Link>
      </div>

      {/* Drag error toast */}
      {dragError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {dragError}
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3.5 py-2 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:text-slate-700"
            } rounded-l-lg`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3.5 py-2 text-sm font-medium transition-colors ${
              viewMode === "kanban"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:text-slate-700"
            } rounded-r-lg border-l border-slate-200`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </form>

        {/* Stage filter */}
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">{t("allStages")}</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s}>
              {PIPELINE_STAGE_LABELS[s]}
            </option>
          ))}
        </select>

        {/* Assigned To filter */}
        <select
          value={assignedToFilter}
          onChange={(e) => { setAssignedToFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">{t("allAssignees")}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>

        {(stageFilter || assignedToFilter) && (
          <button
            type="button"
            onClick={() => { setStageFilter(""); setAssignedToFilter(""); setPage(1); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-rose-600 shadow-sm hover:bg-rose-50 transition-colors"
          >
            {tc("clear")}
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-pulse-soft text-lg">{tc("loading")}</div>
            </div>
          ) : processes.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
              </svg>
              <p className="mt-3 text-sm text-slate-500">{t("notFoundEmpty")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-[800px] divide-y divide-slate-100 md:min-w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{tc("candidate")}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{tc("position")}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{tc("firm")}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{tc("stage")}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{tc("assignedTo")}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{tc("fitness")}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{tc("lastUpdate")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processes.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => window.location.href = `/processes/${p.id}`}
                    className={`cursor-pointer transition-colors duration-150 ${
                      p.closedAt ? "bg-slate-50/50 opacity-60" : "hover:bg-indigo-50/50"
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {p.candidate.firstName[0]}{p.candidate.lastName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {p.candidate.firstName} {p.candidate.lastName}
                          </div>
                          {p.candidate.currentTitle && (
                            <div className="text-xs text-slate-500">{p.candidate.currentTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.position.title}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.firm.name}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STAGE_COLORS[p.stage] || "bg-slate-100 text-slate-700"}`}>
                        {PIPELINE_STAGE_LABELS[p.stage] || p.stage}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {p.assignedTo.firstName} {p.assignedTo.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{renderStars(p.fitnessScore)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {new Date(p.updatedAt).toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      ) : (
        /* Kanban View with DnD */
        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
              <div className="animate-pulse-soft text-lg">{tc("loading")}</div>
            </div>
          ) : kanbanData ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {PIPELINE_STAGES.map((stage) => {
                  const items = kanbanData[stage] || [];
                  return (
                    <Droppable key={stage} droppableId={stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-w-[280px] flex-shrink-0 rounded-xl border transition-colors duration-200 ${
                            snapshot.isDraggingOver
                              ? "border-indigo-300 ring-2 ring-indigo-200/50"
                              : "border-slate-200"
                          } ${STAGE_BG_COLORS[stage]} shadow-sm`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {PIPELINE_STAGE_LABELS[stage]}
                            </h3>
                            <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${STAGE_COLORS[stage]}`}>
                              {items.length}
                            </span>
                          </div>
                          <div className="space-y-3 p-3" style={{ minHeight: 60 }}>
                            {items.length === 0 && !snapshot.isDraggingOver ? (
                              <p className="py-4 text-center text-xs text-slate-400">{t("noProcess")}</p>
                            ) : (
                              items.map((p, index) => (
                                <Draggable
                                  key={p.id}
                                  draggableId={p.id}
                                  index={index}
                                >
                                  {(dragProvided, dragSnapshot) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      onClick={() => {
                                        if (!dragSnapshot.isDragging) {
                                          window.location.href = `/processes/${p.id}`;
                                        }
                                      }}
                                      className={`rounded-lg border bg-white p-3 shadow-sm transition-all duration-150 ${
                                        dragSnapshot.isDragging
                                          ? "rotate-2 scale-105 border-indigo-300 shadow-lg ring-2 ring-indigo-200/50"
                                          : p.closedAt
                                            ? "border-slate-200 opacity-60 cursor-grab hover:shadow-md"
                                            : "border-slate-200 cursor-pointer hover:shadow-md"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                                          {p.candidate.firstName[0]}{p.candidate.lastName[0]}
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">
                                          {p.candidate.firstName} {p.candidate.lastName}
                                        </span>
                                        {p.closedAt && (
                                          <svg className="ml-auto h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                          </svg>
                                        )}
                                      </div>
                                      <p className="mt-1.5 text-xs text-slate-600">{p.position.title}</p>
                                      <p className="text-xs text-slate-400">{p.firm.name}</p>
                                      <div className="mt-2 flex items-center justify-between">
                                        {renderStars(p.fitnessScore)}
                                        <span className="text-[10px] text-slate-400">
                                          {p.assignedTo.firstName[0]}{p.assignedTo.lastName[0]}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </DragDropContext>
          ) : null}
        </div>
      )}

      {/* Pagination (list view only) */}
      {viewMode === "list" && pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {tc("totalItemsWithPages", { count: pagination.total, entity: t("title").toLowerCase(), pages: pagination.totalPages })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {tc("previous")}
            </button>
            <span className="px-2 text-slate-600">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {tc("next")}
            </button>
          </div>
        </div>
      )}

      {/* Stage Change Confirmation Modal (close / reopen) */}
      {showCloseModal && pendingDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              {pendingDrop.type === "reopen" ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
              ) : (
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  pendingDrop.toStage === "positive" ? "bg-emerald-100" : "bg-rose-100"
                }`}>
                  {pendingDrop.toStage === "positive" ? (
                    <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {pendingDrop.type === "reopen" ? t("reopenProcess") : t("closeProcess")}
                </h3>
                <p className="text-sm text-slate-500">
                  {pendingDrop.type === "reopen"
                    ? t("reopenProcessDesc", { stage: PIPELINE_STAGE_LABELS[pendingDrop.toStage] })
                    : t("closeProcessDesc", { stage: PIPELINE_STAGE_LABELS[pendingDrop.toStage] })}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="closeNote" className="block text-sm font-medium text-slate-700">
                {t("closeNote")}
              </label>
              <textarea
                id="closeNote"
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                rows={3}
                placeholder={pendingDrop.type === "reopen" ? t("reopenNotePlaceholder") : t("closeNotePlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelCloseDrop}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                {tc("cancel")}
              </button>
              <button
                type="button"
                onClick={confirmCloseDrop}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
                  pendingDrop.type === "reopen"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : pendingDrop.toStage === "positive"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {pendingDrop.type === "reopen"
                  ? t("reopenConfirm")
                  : pendingDrop.toStage === "positive" ? t("closePositive") : t("closeNegative")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
