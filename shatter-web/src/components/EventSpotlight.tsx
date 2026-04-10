import { useEffect, useMemo, useState } from "react";
import type { Participant } from "../types/participant";

export interface Connection {
  from: string; // participantId
  to: string; // participantId
  /** From GET /participantConnections/connected-users */
  connectionDescription?: string | null;
}

export interface ActivityItem {
  id: string;
  type: "joined" | "connection";
  participantName?: string;
  fromName?: string;
  toName?: string;
  timestamp: number;
}

/** Row from GET /api/participantConnections/connected-users */
interface ConnectedUserRow {
  user: {
    _id?: string;
    name?: string;
    email?: string;
    linkedinUrl?: string;
    bio?: string;
    profilePhoto?: string;
    socialLinks?: Record<string, string>;
  } | null;
  participantId: string | { toString(): string };
  participantName?: string | null;
  connectionDescription?: string | null;
}

export interface GraphEdge extends Connection {
  /** Stable key for React / hover */
  edgeId: string;
  bundleIndex: number;
  bundleSize: number;
}

function canonConnectionKey(from: string, to: string, description: string | null): string {
  const a = from <= to ? from : to;
  const b = from <= to ? to : from;
  return JSON.stringify([a, b, description]);
}

/** Each API row is from perspective of `querier`. Symmetric fetches double-count the same DB connection. */
function parallelCountFromMultisetCount(count: number): number {
  if (count <= 0) return 0;
  return count % 2 === 0 ? count / 2 : count;
}

function buildGraphEdgesFromMultiset(multiset: Map<string, number>): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (const [key, rawCount] of multiset) {
    let a: string;
    let b: string;
    let description: string | null;
    try {
      const parsed = JSON.parse(key) as [string, string, string | null | undefined];
      a = parsed[0];
      b = parsed[1];
      description = parsed[2] ?? null;
    } catch {
      continue;
    }
    const n = parallelCountFromMultisetCount(rawCount);
    for (let j = 0; j < n; j++) {
      edges.push({
        from: a,
        to: b,
        connectionDescription: description,
        edgeId: `${a}|${b}|${description ?? ""}|${j}`,
        bundleIndex: j,
        bundleSize: n,
      });
    }
  }
  return edges;
}

/** Quadratic path with perpendicular offset for bundled edges between the same pair */
function edgeCurvePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bundleIndex: number,
  bundleSize: number
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const off = bundleSize > 1 ? (bundleIndex - (bundleSize - 1) / 2) * 14 : 0;
  const cx = mx + (-dy / len) * off;
  const cy = my + (dx / len) * off;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

interface EventSpotlightProps {
  participants: Participant[];
  eventId: string | null;
  connections?: Connection[];
  activity?: ActivityItem[];
}

const BUBBLE_RADIUS = 32;
const CONTAINER_PADDING = 60;

function getBubblePosition(
  index: number,
  total: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number } {
  if (total <= 0) return { x: centerX, y: centerY };
  if (total === 1) return { x: centerX, y: centerY };
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

function getParticipantColor(index: number): string {
  const hues = [200, 160, 280, 40, 320, 180, 260, 60]; // Cyan, teal, purple, orange, pink, etc.
  const hue = hues[index % hues.length];
  return `hsl(${hue}, 70%, 55%)`;
}

function normalizeId(id: string | { toString(): string }): string {
  return typeof id === "string" ? id : id.toString();
}

export default function EventSpotlight({
  participants,
  eventId,
  connections: connectionsProp = [],
  activity = [],
}: EventSpotlightProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [fetchedGraphEdges, setFetchedGraphEdges] = useState<GraphEdge[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // GET /api/participantConnections/connected-users — per participant; merge with multiset (handles multiples + symmetric dupes)
  useEffect(() => {
    if (!eventId || participants.length === 0) {
      setFetchedGraphEdges([]);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setFetchedGraphEdges([]);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchAll = async () => {
      setConnectionsLoading(true);
      try {
        const multiset = new Map<string, number>();

        const results = await Promise.all(
          participants.map(async (p) => {
            const url = `${apiUrl}/participantConnections/connected-users?eventId=${encodeURIComponent(eventId)}&participantId=${encodeURIComponent(p.participantId)}`;
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return [] as ConnectedUserRow[];
            const data: unknown = await res.json();
            if (!Array.isArray(data)) return [];
            return data as ConnectedUserRow[];
          })
        );

        for (let pi = 0; pi < results.length; pi++) {
          const list = results[pi];
          const querier = participants[pi].participantId;
          for (const item of list) {
            const other = normalizeId(item.participantId);
            if (!other || other === querier) continue;
            const desc =
              item.connectionDescription != null && item.connectionDescription !== ""
                ? item.connectionDescription
                : null;
            const key = canonConnectionKey(querier, other, desc);
            multiset.set(key, (multiset.get(key) ?? 0) + 1);
          }
        }

        setFetchedGraphEdges(buildGraphEdgesFromMultiset(multiset));
      } catch {
        setFetchedGraphEdges([]);
      } finally {
        setConnectionsLoading(false);
      }
    };

    fetchAll();
  }, [eventId, participants]);

  const propToGraphEdges = (conns: Connection[]): GraphEdge[] =>
    conns.map((c, i) => ({
      from: c.from,
      to: c.to,
      connectionDescription: c.connectionDescription ?? null,
      edgeId: `prop-${c.from}-${c.to}-${i}`,
      bundleIndex: 0,
      bundleSize: 1,
    }));

  /** Real edges only: optional props override, else GET /participantConnections/connected-users */
  const effectiveGraphEdges =
    connectionsProp.length > 0 ? propToGraphEdges(connectionsProp) : fetchedGraphEdges;

  // Container dimensions
  const size = 400;
  const centerX = size / 2;
  const centerY = size / 2;
  const graphRadius = Math.min(size - CONTAINER_PADDING * 2, 280) / 2;

  // Participant positions
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; color: string }>();
    participants.forEach((p, i) => {
      const pos = getBubblePosition(i, participants.length, centerX, centerY, graphRadius);
      map.set(p.participantId, {
        ...pos,
        color: getParticipantColor(i),
      });
    });
    return map;
  }, [participants, centerX, centerY, graphRadius]);

  // Leaderboard: count connections per participant — show ALL participants
  const leaderboard = useMemo(() => {
    const scores = new Map<string, { name: string; count: number }>();
    participants.forEach((p) => scores.set(p.participantId, { name: p.name, count: 0 }));

    effectiveGraphEdges.forEach((c) => {
      const from = scores.get(c.from);
      const to = scores.get(c.to);
      if (from) from.count++;
      if (to) to.count++;
    });

    return Array.from(scores.entries())
      .map(([id, { name, count }]) => ({ participantId: id, name, connections: count }))
      .sort((a, b) => b.connections - a.connections);
  }, [participants, effectiveGraphEdges]);

  const formatTimeAgo = (ts: number) => {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    return `${hr}h ago`;
  };

  if (participants.length === 0) {
    return (
      <div
        className="backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center"
        style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
      >
        <h3 className="text-xl font-heading font-semibold text-white mb-2">
          Live Activity Spotlight
        </h3>
        <p className="text-white/60 font-body text-sm">
          When participants join and make connections, you&apos;ll see them here as bubbles with lines between connected people.
        </p>
      </div>
    );
  }

  return (
    <div
      className="backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden"
      style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
    >
      <div className="p-4 border-b border-white/10">
        <h3 className="text-xl font-heading font-semibold text-white">
          Live Activity Spotlight
        </h3>
        <p className="text-white/60 font-body text-sm mt-0.5">
          See who&apos;s here and who&apos;s connecting
          {connectionsLoading && (
            <span className="block text-[#4DC4FF] mt-1">Loading connections…</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Network Graph */}
        <div className="lg:col-span-2 p-4 flex items-center justify-center min-h-[360px]">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible w-full max-w-[400px] h-auto aspect-square"
          >
            {/* Connection lines (GET /participantConnections/connected-users) */}
            <g>
              {effectiveGraphEdges.map((conn) => {
                const fromPos = positions.get(conn.from);
                const toPos = positions.get(conn.to);
                if (!fromPos || !toPos) return null;
                const isHover = hoveredEdgeId === conn.edgeId;
                const label =
                  conn.connectionDescription?.trim() ||
                  "Connected (no description)";
                const d = edgeCurvePath(
                  fromPos.x,
                  fromPos.y,
                  toPos.x,
                  toPos.y,
                  conn.bundleIndex,
                  conn.bundleSize
                );
                return (
                  <g
                    key={conn.edgeId}
                    onMouseEnter={() => setHoveredEdgeId(conn.edgeId)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <path
                      d={d}
                      fill="none"
                      stroke={
                        isHover ? "rgba(77, 196, 255, 0.95)" : "rgba(77, 196, 255, 0.5)"
                      }
                      strokeWidth={isHover ? 3 : 2}
                      className="transition-all duration-200"
                      style={{
                        strokeDasharray: "6 4",
                        animation: "dash 1s linear infinite",
                      }}
                    />
                    <title>{label}</title>
                  </g>
                );
              })}
            </g>
            {/* Participant bubbles */}
            {participants.map((p, i) => {
              const pos = positions.get(p.participantId);
              if (!pos) return null;
              const isHovered = hoveredId === p.participantId;
              return (
                <g
                  key={p.participantId}
                  onMouseEnter={() => setHoveredId(p.participantId)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Glow on hover */}
                  {isHovered && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={BUBBLE_RADIUS + 8}
                      fill={pos.color}
                      opacity={0.3}
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={BUBBLE_RADIUS}
                    fill={pos.color}
                    stroke={isHovered ? "#4DC4FF" : "rgba(255,255,255,0.3)"}
                    strokeWidth={isHovered ? 3 : 1}
                    className="transition-all duration-200 drop-shadow-lg"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={14}
                    fontWeight="600"
                    className="font-heading pointer-events-none select-none"
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </text>
                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={pos.x - 40}
                        y={pos.y - BUBBLE_RADIUS - 28}
                        width={80}
                        height={24}
                        rx={4}
                        fill="rgba(0,0,0,0.8)"
                      />
                      <text
                        x={pos.x}
                        y={pos.y - BUBBLE_RADIUS - 12}
                        textAnchor="middle"
                        fill="white"
                        fontSize={12}
                        className="font-body"
                      >
                        {p.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          <style>{`
            @keyframes dash {
              to { stroke-dashoffset: -10; }
            }
          `}</style>
        </div>

        {/* Right: Activity + Leaderboard */}
        <div className="lg:col-span-1 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10">
          {/* Activity Feed */}
          <div className="p-4 flex-1 border-b lg:border-b-0 lg:border-b border-white/10">
            <h4 className="text-sm font-heading font-semibold text-white/80 mb-3 uppercase tracking-wider">
              Recent Activity
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {activity.length === 0 ? (
                <p className="text-white/50 text-sm font-body">No activity yet</p>
              ) : (
                activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 text-sm font-body"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{
                        backgroundColor:
                          item.type === "joined"
                            ? "#4ade80"
                            : "#4DC4FF",
                      }}
                    />
                    <div>
                      {item.type === "joined" ? (
                        <span className="text-white/90">
                          <span className="font-semibold text-white">{item.participantName}</span> joined
                        </span>
                      ) : (
                        <span className="text-white/90">
                          <span className="font-semibold text-white">{item.fromName}</span> connected with{" "}
                          <span className="font-semibold text-white">{item.toName}</span>
                        </span>
                      )}
                      <p className="text-white/50 text-xs mt-0.5">
                        {formatTimeAgo(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="p-4 flex-1 min-h-0 flex flex-col">
            <h4 className="text-sm font-heading font-semibold text-white/80 mb-3 uppercase tracking-wider">
              Connection Leaderboard
            </h4>
            <div className="space-y-2 overflow-y-auto max-h-48">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.participantId}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-heading"
                    style={{
                      backgroundColor:
                        i === 0
                          ? "rgba(251, 191, 36, 0.3)"
                          : i === 1
                          ? "rgba(192, 192, 192, 0.3)"
                          : i === 2
                          ? "rgba(205, 127, 50, 0.3)"
                          : "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-body text-white font-medium flex-1 truncate">
                    {entry.name}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#4DC4FF" }}
                  >
                    {entry.connections} {entry.connections === 1 ? "link" : "links"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
