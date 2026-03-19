import { useEffect, useMemo, useState } from "react";
import type { Participant } from "../types/participant";

export interface Connection {
  from: string; // participantId
  to: string;   // participantId
}

export interface ActivityItem {
  id: string;
  type: "joined" | "connection";
  participantName?: string;
  fromName?: string;
  toName?: string;
  timestamp: number;
}

interface ConnectedUserResponse {
  participantId: string | { toString(): string };
  participantName?: string | null;
  connectionDescription?: string | null;
}

interface EventSpotlightProps {
  participants: Participant[];
  eventId: string | null;
  connections?: Connection[];
  activity?: ActivityItem[];
  /** Generate demo connections when API returns no connections */
  useDemoConnections?: boolean;
  /** Generate demo activity when none provided */
  useDemoActivity?: boolean;
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
  useDemoConnections = false,
  useDemoActivity = true,
}: EventSpotlightProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [fetchedConnections, setFetchedConnections] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // Fetch connections from GET /api/participantConnections/connected-users
  useEffect(() => {
    if (!eventId || participants.length === 0) {
      setFetchedConnections([]);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setFetchedConnections([]);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    const connectionSet = new Set<string>();
    const conns: Connection[] = [];

    const fetchAll = async () => {
      setConnectionsLoading(true);
      try {
        const results = await Promise.all(
          participants.map(async (p) => {
            const url = `${apiUrl}/participantConnections/connected-users?eventId=${encodeURIComponent(eventId)}&participantId=${encodeURIComponent(p.participantId)}`;
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return [];
            const data: ConnectedUserResponse[] = await res.json();
            return data.map((item) => ({
              from: p.participantId,
              to: normalizeId(item.participantId),
            }));
          })
        );

        for (const list of results) {
          for (const c of list) {
            const key = [c.from, c.to].sort().join("|");
            if (!connectionSet.has(key)) {
              connectionSet.add(key);
              conns.push(c);
            }
          }
        }
        setFetchedConnections(conns);
      } catch {
        setFetchedConnections([]);
      } finally {
        setConnectionsLoading(false);
      }
    };

    fetchAll();
  }, [eventId, participants]);

  // Use prop connections if provided, else fetched connections
  const connections = connectionsProp.length > 0 ? connectionsProp : fetchedConnections;

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

  // Demo connections: connect participants in a fun pattern (every other, creating a star)
  const effectiveConnections = useMemo(() => {
    if (connections.length > 0) return connections;
    if (!useDemoConnections || participants.length < 2) return [];

    const demo: Connection[] = [];
    const n = participants.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 2) % n; // Skip one for star pattern
      if (i < j) {
        demo.push({ from: participants[i].participantId, to: participants[j].participantId });
      }
    }
    return demo.slice(0, Math.min(demo.length, 8)); // Cap demo lines
  }, [connections, participants, useDemoConnections]);

  // Demo activity: join events + fake connection events
  const effectiveActivity = useMemo(() => {
    if (activity.length > 0) return activity;
    if (!useDemoActivity) return [];

    const items: ActivityItem[] = participants
      .slice(0, 5)
      .map((p, i) => ({
        id: `join-${p.participantId}`,
        type: "joined" as const,
        participantName: p.name,
        timestamp: Date.now() - (participants.length - i) * 60000,
      }));

    // Add some fake connection events
    if (participants.length >= 2) {
      items.push({
        id: "conn-1",
        type: "connection",
        fromName: participants[0].name,
        toName: participants[1].name,
        timestamp: Date.now() - 120000,
      });
      if (participants.length >= 4) {
        items.push({
          id: "conn-2",
          type: "connection",
          fromName: participants[2].name,
          toName: participants[3].name,
          timestamp: Date.now() - 90000,
        });
      }
    }

    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [activity, participants, useDemoActivity]);

  // Leaderboard: count connections per participant — show ALL participants
  const leaderboard = useMemo(() => {
    const scores = new Map<string, { name: string; count: number }>();
    participants.forEach((p) => scores.set(p.participantId, { name: p.name, count: 0 }));

    effectiveConnections.forEach((c) => {
      const from = scores.get(c.from);
      const to = scores.get(c.to);
      if (from) from.count++;
      if (to) to.count++;
    });

    return Array.from(scores.entries())
      .map(([id, { name, count }]) => ({ participantId: id, name, connections: count }))
      .sort((a, b) => b.connections - a.connections);
  }, [participants, effectiveConnections]);

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
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Network Graph */}
        <div className="lg:col-span-2 p-4 flex items-center justify-center min-h-[360px]">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible w-full max-w-[400px] h-auto aspect-square"
          >
            {/* Connection lines */}
            <g>
              {effectiveConnections.map((conn, i) => {
                const fromPos = positions.get(conn.from);
                const toPos = positions.get(conn.to);
                if (!fromPos || !toPos) return null;
                return (
                  <line
                    key={`${conn.from}-${conn.to}-${i}`}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke="rgba(77, 196, 255, 0.5)"
                    strokeWidth={2}
                    className="transition-opacity duration-200"
                    style={{
                      strokeDasharray: "6 4",
                      animation: "dash 1s linear infinite",
                    }}
                  />
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
              {effectiveActivity.length === 0 ? (
                <p className="text-white/50 text-sm font-body">No activity yet</p>
              ) : (
                effectiveActivity.map((item) => (
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
