import React from "react";
import { motion } from "motion/react";
import { Award, Trophy, Trash2, ShieldCheck, Zap } from "lucide-react";
import { PlayerRank } from "../types";

interface LeaderboardTabProps {
  rankings: PlayerRank[];
  onClearLeaderboard: () => void;
  currentUserScore: number;
}

export default function LeaderboardTab({ rankings, onClearLeaderboard, currentUserScore }: LeaderboardTabProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Visual Leaderboard Header Card */}
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 relative overflow-hidden flex items-center gap-4">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Trophy size={100} className="text-black rotate-12" />
        </div>
        <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center shrink-0">
          <Trophy className="text-[#E0FF33]" size={24} />
        </div>
        <div>
          <h3 className="font-mono text-sm font-black uppercase tracking-tight text-zinc-900">LOGIC LEADERBOARD</h3>
          <p className="text-xs text-zinc-500 font-bold uppercase mt-0.5">High-fidelity matrix indexing top guessers.</p>
        </div>
      </div>

      {/* Rankings List Container */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="h-[2px] flex-grow bg-black" />
          <h2 className="font-mono text-xs text-black uppercase tracking-[0.2em] font-black">Top Registered Hackers</h2>
          <span className="h-[2px] flex-grow bg-black" />
        </div>

        <div className="flex flex-col gap-3">
          {rankings.map((rank, index) => {
            const isTop3 = index < 3;
            const place = index + 1;

            // Medal style configuration exactly matching the mockup specifications or bento layout
            let badgeBg = "bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
            let medalContainer = "";
            let medalColorClass = "";

            if (place === 1) {
              badgeBg = "bg-[#E0FF33] border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black";
              medalContainer = "bg-black text-[#E0FF33]";
              medalColorClass = "text-[#E0FF33]";
            } else if (place === 2) {
              badgeBg = "bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
              medalContainer = "bg-white text-zinc-900 border border-black";
              medalColorClass = "text-zinc-600";
            } else if (place === 3) {
              badgeBg = "bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
              medalContainer = "bg-white text-zinc-900 border border-black";
              medalColorClass = "text-amber-800";
            }

            return (
              <motion.div
                key={rank.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3.5 transition-all duration-300 ${badgeBg} ${
                  rank.isCustomPlayer ? "ring-2 ring-black" : ""
                }`}
              >
                {/* Visual Position Flag */}
                {isTop3 ? (
                  <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${medalContainer}`}>
                    <Award className={medalColorClass} size={18} />
                  </div>
                ) : (
                  <span className="font-mono text-zinc-500 w-10 text-center text-sm font-black shrink-0">
                    {place.toString().padStart(2, "0")}
                  </span>
                )}

                {/* Player details */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-sans font-black text-black truncate text-[15px]">{rank.name}</span>
                    {rank.isCustomPlayer && (
                      <span className="text-[9px] font-mono uppercase bg-black text-[#E0FF33] px-1 rounded font-black">
                        YOU
                      </span>
                    )}
                    {rank.difficulty && (
                      <span className="text-[8px] font-mono text-zinc-500 tracking-wider uppercase border border-black px-1 font-bold">
                        {rank.difficulty}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500 uppercase font-bold truncate mt-0.5">{rank.title}</span>
                </div>

                {/* Score badge with flat monospace number */}
                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-base text-black">
                    {rank.score}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-500 block leading-none uppercase font-bold">PTS</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Leaderboard Management Action */}
      <section className="mt-4 flex flex-col gap-4">
        {rankings.some((r) => r.isCustomPlayer) && (
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2">
            <span className="font-mono text-[10px] text-black uppercase tracking-wider flex items-center gap-1 font-black">
              <ShieldCheck size={14} className="text-zinc-900" /> SECURED HIGH-SCORE SYNTAX
            </span>
            <p className="text-xs text-zinc-600 font-medium">
              Your highest personal score is <strong className="text-black font-mono bg-zinc-100 border border-black px-1">{currentUserScore} PTS</strong>. It has been successfully stored in your local logic drive.
            </p>
          </div>
        )}

        <button
          onClick={onClearLeaderboard}
          className="w-full bento-btn-primary py-4 text-sm font-black transition-all flex items-center justify-center gap-2 border-[3px] border-black cursor-pointer bg-red-500 hover:bg-red-600 text-white"
        >
          <Trash2 size={16} />
          <span>RESET LEADERS MATRIX</span>
        </button>
      </section>
    </div>
  );
}
