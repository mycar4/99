import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Zap, RefreshCw, AlertCircle, Sparkles, Trophy } from "lucide-react";
import { GameStats, GameSettings } from "../types";

interface GameTabProps {
  stats: GameStats;
  settings: GameSettings;
  onGuess: (value: number) => void;
  onPlayAgain: () => void;
}

export function playCyberSound(type: "click" | "success" | "fail" | "higher" | "lower", soundEnabled: boolean) {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "success") {
      osc.type = "square";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(480, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(640, ctx.currentTime + 0.16);
      osc.frequency.setValueAtTime(960, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === "fail") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(170, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "higher") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } else if (type === "lower") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    }
  } catch (e) {
    // Ignored if browser security blocks context autostart
  }
}

export default function GameTab({ stats, settings, onGuess, onPlayAgain }: GameTabProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stats.status === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [stats.status, stats.targetNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stats.status !== "playing") return;

    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed)) return;

    onGuess(parsed);
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleQuickNumber = (num: number) => {
    if (stats.status !== "playing") return;
    setInputValue(num.toString());
    playCyberSound("click", settings.soundEnabled);
  };

  const livesPercent = (stats.chancesLeft / stats.maxChances) * 100;
  const isDanger = stats.chancesLeft <= 3;
  const minPossible = settings.minRange;
  const maxPossible = settings.maxRange;

  // Banner configuration according to Bento standard game hint status
  let bannerClass = "bg-white text-zinc-900 border-black";
  let bannerLabel = "ENTER A NUMBER TO START";

  if (stats.hint.type === "higher") {
    // High-impact higher state
    bannerClass = "bg-red-400 text-black";
    bannerLabel = stats.hint.text;
  } else if (stats.hint.type === "lower") {
    // Mid-impact lower state
    bannerClass = "bg-amber-300 text-black";
    bannerLabel = stats.hint.text;
  } else if (stats.hint.type === "win") {
    // Correct neon bento-lime state!
    bannerClass = "bg-[#E0FF33] text-black font-black";
    bannerLabel = stats.hint.text;
  } else if (stats.hint.type === "lose") {
    bannerClass = "bg-black text-white";
    bannerLabel = stats.hint.text;
  } else if (stats.hint.type === "invalid") {
    bannerClass = "bg-zinc-200 text-black";
    bannerLabel = stats.hint.text;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Lives & Stats Bento Box combo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Atempts Box */}
        <section className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Attempts Stability</p>
            <div className="text-5xl font-black font-mono tracking-tight mt-1">
              {stats.chancesLeft.toString().padStart(2, "0")}<span className="text-zinc-300">/{stats.maxChances}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="h-4 bg-zinc-100 border-2 border-black w-full overflow-hidden p-[2px]">
              <motion.div
                className={`h-full transition-all duration-300 ${isDanger ? "bg-red-500" : "bg-black"}`}
                initial={{ width: "100%" }}
                animate={{ width: `${livesPercent}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[9px] font-bold text-zinc-400 uppercase">Stability Engine Status</span>
              <span className={`text-[10px] font-black uppercase ${isDanger ? "text-red-500 animate-pulse" : "text-zinc-900"}`}>
                {isDanger ? "STABILITY WEAK" : "SYNCED"}
              </span>
            </div>
          </div>
        </section>

        {/* Dynamic heart slots */}
        <section className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Target Field Constraints</p>
            <div className="text-sm font-bold text-zinc-900 mt-1 leading-snug">
              Guessed <span className="font-mono bg-zinc-100 border border-black px-1.5 py-0.5">{stats.previousGuesses.length}</span> times in this logic dimension.
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {Array.from({ length: stats.maxChances }).map((_, idx) => {
              const active = idx < stats.chancesLeft;
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 border-2 border-black flex items-center justify-center transition-all ${
                    active ? "bg-[#E0FF33] text-black" : "bg-zinc-100 text-zinc-300"
                  }`}
                >
                  <Heart size={14} className={active ? "fill-black" : "fill-transparent text-zinc-300"} />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Main Play Grid Section with Brutalist Cards */}
      <section className="flex flex-col gap-6">
        {/* Bento Response Banner Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={bannerLabel}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 text-center font-bold ${bannerClass}`}
          >
            <div className="text-[10px] uppercase tracking-widest opacity-50 font-black mb-1">
              Neural Engine Response
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center justify-center gap-2">
              {stats.hint.type === "higher" && <Zap size={18} className="fill-black text-black" />}
              {stats.hint.type === "lower" && <Zap size={18} className="fill-black text-black" />}
              <span>{bannerLabel}</span>
            </h3>
          </motion.div>
        </AnimatePresence>

        {/* Brutalist Input Panel */}
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-5 relative">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Compressed Matrix Integer
            </span>
            <h4 className="text-lg font-bold tracking-tight text-zinc-900">
              Synchronized Field Range: {minPossible} — {maxPossible}
            </h4>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                ref={inputRef}
                className="w-full bento-input py-6 text-center text-6xl font-black text-zinc-900"
                id="number-input"
                name="number-input"
                max={maxPossible}
                min={minPossible}
                placeholder="--"
                type="number"
                value={inputValue}
                disabled={stats.status !== "playing"}
                onChange={(e) => setInputValue(e.target.value)}
                autoComplete="off"
              />

              {stats.status !== "playing" && (
                <div className="absolute inset-0 bg-white/95 border-3 border-black flex flex-col items-center justify-center p-4">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">
                    Correct Target Value Resolved
                  </span>
                  <span className="text-5xl font-black tracking-tighter text-black font-mono">
                    {stats.targetNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Neon Primary Buttons */}
            {stats.status === "playing" ? (
              <button
                type="submit"
                className="w-full bento-btn-primary py-5 text-lg font-black transition-all flex items-center justify-center gap-2"
              >
                <span>EXECUTE GUESS</span>
                <Zap size={18} className="fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playCyberSound("click", settings.soundEnabled);
                  onPlayAgain();
                }}
                className={`w-full py-5 text-lg font-black transition-all flex items-center justify-center gap-2 ${
                  stats.status === "won" ? "bento-btn-accent" : "bento-btn-primary"
                }`}
              >
                <span>RESET STABILITY ENIGMA</span>
                <RefreshCw size={18} />
              </button>
            )}
          </form>
        </div>
      </section>

      {/* Suggested Quick Guess Helpers */}
      {stats.status === "playing" && (
        <section className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Quick Compressions
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 90].map((num) => {
              const actualNum = Math.floor(minPossible + ((maxPossible - minPossible) * (num / 100)));
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleQuickNumber(actualNum)}
                  className="bg-white hover:bg-[#E0FF33] text-black border-2 border-black py-2.5 font-mono text-sm font-black active:translate-y-[1px] transition-all"
                >
                  {actualNum}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* History of Previous Guesses */}
      {stats.previousGuesses.length > 0 && (
        <section className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b-2 border-black pb-3">
            <span className="text-xs font-black uppercase tracking-widest">History Waveform Log</span>
            <span className="font-mono text-[10px] text-zinc-400">V.024</span>
          </div>

          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {stats.previousGuesses.map((guess, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2.5 bg-zinc-50 border-2 border-black text-xs font-mono font-bold"
              >
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">#{stats.previousGuesses.length - index}</span>
                  <span className="text-black font-black text-sm">GUESS: {guess.value}</span>
                </div>
                <div>
                  {guess.result === "higher" && (
                    <span className="text-red-600 bg-red-100 border border-black px-2 py-0.5 text-[10px] uppercase font-black">
                      Too Low (Higher!)
                    </span>
                  )}
                  {guess.result === "lower" && (
                    <span className="text-amber-700 bg-amber-100 border border-black px-2 py-0.5 text-[10px] uppercase font-black">
                      Too High (Lower!)
                    </span>
                  )}
                  {guess.result === "correct" && (
                    <span className="text-black bg-[#E0FF33] border border-black px-2 py-0.5 text-[10px] uppercase font-black animate-pulse">
                      Correct
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
