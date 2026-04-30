import { useEffect, useRef, useState } from "react";
import { pusher } from "../libs/pusher_websocket";

interface LeaderboardEntry {
  participantId: string;
  name: string;
  profilePhoto?: string | null;
  connectionsCount: number;
  linesCompleted: number;
  completed: boolean;
}

interface Props {
  eventId: string;
}

const API_URL = import.meta.env.VITE_API_URL as string;

function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.connectionsCount - a.connectionsCount);
}

export default function Leaderboard({ eventId }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const leaderboardRef = useRef<LeaderboardEntry[]>([]);

  // Initial fetch — only keep entries that have at least one connection
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/events/${eventId}/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json() as Promise<LeaderboardEntry[]>;
      })
      .then((data) => {
        const withConnections = sortLeaderboard(
          data.filter((e) => e.connectionsCount > 0)
        );
        leaderboardRef.current = withConnections;
        setLeaderboard(withConnections);
      })
      .catch(() => {});
  }, [eventId]);

  // Pusher subscription
  useEffect(() => {
    const channel = pusher.subscribe(`event-${eventId}`);

    channel.bind("leaderboard-updated", (payload: LeaderboardEntry) => {
      const current = leaderboardRef.current;
      const exists = current.some((e) => e.participantId === payload.participantId);

      let updated: LeaderboardEntry[];
      if (exists) {
        updated = current.map((e) =>
          e.participantId === payload.participantId ? { ...e, ...payload } : e
        );
      } else if (payload.connectionsCount > 0) {
        // Only add if they actually have a connection
        updated = [...current, payload];
      } else {
        return;
      }

      const sorted = sortLeaderboard(updated);
      leaderboardRef.current = sorted;
      setLeaderboard(sorted);
    });

    return () => {
      channel.unbind("leaderboard-updated");
      pusher.unsubscribe(`event-${eventId}`);
    };
  }, [eventId]);

  if (leaderboard.length === 0) {
    return (
      <>
        <div className="text-xl font-heading font-semibold text-white">LEADERBOARD</div>
        <p className="text-white/60 text-sm">Waiting for first connection...</p>
      </>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-48">
      <div className="text-xl font-heading font-semibold text-white">LEADERBOARD</div>
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
                  ? "rgba(251,191,36,0.3)"
                  : i === 1
                  ? "rgba(192,192,192,0.3)"
                  : i === 2
                  ? "rgba(205,127,50,0.3)"
                  : "rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          >
            {i + 1}
          </span>

          {entry.profilePhoto && (
            <img
              src={entry.profilePhoto}
              alt={entry.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          )}

          <span className="font-body text-white font-medium flex-1 truncate">
            {entry.name}
          </span>

          <span className="text-xs text-white/50 mr-1">
            {entry.linesCompleted} line{entry.linesCompleted !== 1 ? "s" : ""}
          </span>

          <span className="text-sm font-semibold" style={{ color: "#4DC4FF" }}>
            {entry.connectionsCount} {entry.connectionsCount === 1 ? "link" : "links"}
          </span>

          {entry.completed && (
            <span className="text-xs bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded">
              ✓
            </span>
          )}
        </div>
      ))}
    </div>
  );
}