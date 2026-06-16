import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCw, Trophy, Gamepad2, BarChart2, Settings as SettingsIcon } from "lucide-react";
import { PlayerRank, GameSettings, GameStats, GameStatus } from "./types";
import GameTab, { playCyberSound } from "./components/GameTab";
import LeaderboardTab from "./components/LeaderboardTab";
import SettingsTab from "./components/SettingsTab";

// Original Mock rankings inside the design system
const DEFAULT_RANKINGS: PlayerRank[] = [
  { id: "cyber-ninja", name: "CyberNinja", score: 950, title: "프로 로직 에이전트", difficulty: "easy" },
  { id: "void-walker", name: "VoidWalker", score: 820, title: "추측 마스터", difficulty: "easy" },
  { id: "bit-master", name: "BitMaster", score: 740, title: "데이터 분석가", difficulty: "easy" },
  { id: "null-pointer", name: "NullPointer", score: 690, title: "시스템 관리자", difficulty: "easy" },
  { id: "ghost-shell", name: "GhostInShell", score: 610, title: "뉴럴 해커", difficulty: "easy" }
];

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"game" | "leaderboard" | "settings">("game");

  // Load configured settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem("numb3r_guess_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return {
      username: "AlphaCoder",
      difficulty: "easy",
      soundEnabled: true,
      minRange: 1,
      maxRange: 100
    };
  });

  // Save settings updates
  useEffect(() => {
    localStorage.setItem("numb3r_guess_settings", JSON.stringify(settings));
  }, [settings]);

  // Load configured rankings
  const [rankings, setRankings] = useState<PlayerRank[]>(() => {
    const saved = localStorage.getItem("numb3r_guess_rankings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_RANKINGS;
  });

  // Keep track of user's highest personal score
  const [personalHighScore, setPersonalHighScore] = useState<number>(() => {
    const saved = localStorage.getItem("numb3r_guess_personal_high");
    return saved ? parseInt(saved, 10) : 999;
  });

  // Gameplay state
  const [stats, setStats] = useState<GameStats>({
    targetNumber: 0,
    chancesLeft: 10,
    maxChances: 10,
    previousGuesses: [],
    status: "playing",
    hint: { text: "숫자를 입력하여 시작하세요", type: "start" },
    score: 0
  });

  // Active Timer state (ticking up like the provided mockup)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format elapsed seconds to mm:ss format
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper logic to generate random target range values
  const generateTargetNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Refresh target fields
  const initializeGame = (currentDifficulty = settings.difficulty) => {
    let maxChances = 10;
    let minRange = 1;
    let maxRange = 100;

    if (currentDifficulty === "medium") {
      maxChances = 8;
      maxRange = 500;
    } else if (currentDifficulty === "hard") {
      maxChances = 6;
      maxRange = 1000;
    }

    const targetNum = generateTargetNumber(minRange, maxRange);

    setStats({
      targetNumber: targetNum,
      chancesLeft: maxChances,
      maxChances: maxChances,
      previousGuesses: [],
      status: "playing",
      hint: { text: "숫자를 입력하여 시작하세요", type: "start" },
      score: 0
    });
    // Reset timer on game setup
    setElapsedSeconds(0);
  };

  // Initialize on game mount
  useEffect(() => {
    initializeGame();
  }, [settings.difficulty]);

  // Submit guess evaluation
  const handleGuessSubmit = (value: number) => {
    if (stats.status !== "playing") return;

    if (value < settings.minRange || value > settings.maxRange) {
      setStats((prev) => ({
        ...prev,
        hint: {
          text: `입력 범위 오류: ${settings.minRange}~${settings.maxRange} 사이여야 합니다!`,
          type: "invalid"
        }
      }));
      playCyberSound("fail", settings.soundEnabled);
      return;
    }

    const alreadyGuessed = stats.previousGuesses.some((guess) => guess.value === value);
    if (alreadyGuessed) {
      setStats((prev) => ({
        ...prev,
        hint: {
          text: `이미 입력한 숫자입니다: ${value}!`,
          type: "invalid"
        }
      }));
      playCyberSound("fail", settings.soundEnabled);
      return;
    }

    const nextChances = stats.chancesLeft - 1;
    let guessResult: "higher" | "lower" | "correct" = "correct";
    let nextStatus: GameStatus = "playing";
    let hintText = "";
    let hintType: "higher" | "lower" | "win" | "lose" = "win";

    if (value === stats.targetNumber) {
      nextStatus = "won";
      guessResult = "correct";
      hintText = "정답입니다! 뉴럴 매트릭스 일치! 🎉";
      hintType = "win";
      playCyberSound("success", settings.soundEnabled);

      const diffMultiplier = settings.difficulty === "easy" ? 100 : settings.difficulty === "medium" ? 250 : 500;
      const gameScore = stats.chancesLeft * diffMultiplier;

      registerNewScore(gameScore);

    } else {
      if (value < stats.targetNumber) {
        guessResult = "higher";
        hintText = "너무 낮습니다! (더 높음 ↑)";
        hintType = "higher";
        playCyberSound("higher", settings.soundEnabled);
      } else {
        guessResult = "lower";
        hintText = "너무 높습니다! (더 낮음 ↓)";
        hintType = "lower";
        playCyberSound("lower", settings.soundEnabled);
      }

      if (nextChances <= 0) {
        nextStatus = "lost";
        hintText = "기회가 모두 소진되었습니다! 퍼즐 해결 실패 💀";
        hintType = "lose";
        playCyberSound("fail", settings.soundEnabled);
      }
    }

    setStats((prev) => ({
      ...prev,
      chancesLeft: nextChances,
      status: nextStatus,
      previousGuesses: [
        { value, result: guessResult },
        ...prev.previousGuesses
      ],
      hint: { text: hintText, type: hintType }
    }));
  };

  // Register score limits
  const registerNewScore = (score: number) => {
    const titlePool = {
      easy: "논리 입문자",
      medium: "추측 마스터",
      hard: "뉴럴 해커 엘리트"
    };

    const newEntry: PlayerRank = {
      id: `custom-rank-${Date.now()}`,
      name: settings.username || "익명의 도전자",
      score: score,
      title: titlePool[settings.difficulty],
      difficulty: settings.difficulty,
      isCustomPlayer: true
    };

    setRankings((prev) => {
      const merged = [...prev, newEntry].sort((a, b) => b.score - a.score);
      localStorage.setItem("numb3r_guess_rankings", JSON.stringify(merged));
      return merged;
    });

    if (score > personalHighScore || personalHighScore === 999) {
      setPersonalHighScore(score);
      localStorage.setItem("numb3r_guess_personal_high", score.toString());
    }
  };

  const handleClearRatings = () => {
    localStorage.removeItem("numb3r_guess_rankings");
    localStorage.removeItem("numb3r_guess_personal_high");
    setRankings(DEFAULT_RANKINGS);
    setPersonalHighScore(999);
    playCyberSound("fail", settings.soundEnabled);
  };

  const handleUpdateSettings = (updates: Partial<GameSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...updates };
      if (updates.difficulty) {
        initializeGame(updates.difficulty);
      }
      return merged;
    });
  };

  return (
    <div className="relative min-h-screen bg-background text-on-background font-sans selection:bg-bento-lime selection:text-black overflow-x-hidden md:py-12">
      
      {/* Persistent Outer Bento Frame with Header block */}
      <div className="w-full max-w-[550px] mx-auto px-4 pb-28">
        
        {/* Header Block Section */}
        <header className="flex justify-between items-end mb-8 border-b-4 border-black pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">
              난이도: {settings.difficulty === 'easy' ? '쉬움' : settings.difficulty === 'medium' ? '보통' : '어려움'}
            </p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#18181B] uppercase leading-none">
              숫자<br/>에니그마.
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Countdown clock styled exactly from Bento mockup */}
            <div className="bg-black text-[#E0FF33] px-3 py-1.5 text-base md:text-lg font-mono font-black border-2 border-black inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <span className="text-[9px] font-black tracking-wider text-zinc-400 uppercase">
              엔진 동기화 활성
            </span>
          </div>
        </header>

        {/* Global Toolbar and trophy banner */}
        <div className="flex justify-between items-center bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 mb-6">
          <button
            onClick={() => {
              playCyberSound("click", settings.soundEnabled);
              initializeGame();
            }}
            className="bento-btn-primary p-2 flex items-center justify-center cursor-pointer font-black text-xs uppercase gap-1"
            title="엔진 초기화"
          >
            <RotateCw size={14} />
            <span>재시작</span>
          </button>

          <div className="font-mono text-xs font-black text-black flex items-center gap-1.5 bg-[#E0FF33] border-2 border-black px-3 py-1">
            <Trophy size={14} className="fill-black text-black shrink-0" />
            <span className="uppercase tracking-tight">최고 점수: {personalHighScore}</span>
          </div>
        </div>

        {/* Dynamic Display container */}
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === "game" && (
              <motion.div
                key="game"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <GameTab
                  stats={stats}
                  settings={settings}
                  onGuess={handleGuessSubmit}
                  onPlayAgain={initializeGame}
                />
              </motion.div>
            )}

            {activeTab === "leaderboard" && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <LeaderboardTab
                  rankings={rankings}
                  onClearLeaderboard={handleClearRatings}
                  currentUserScore={personalHighScore}
                />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <SettingsTab
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Instruction Bar styled precisely from Bento Mock layout */}
        <footer className="mt-8 pt-5 border-t-2 border-zinc-200 flex flex-wrap gap-4 justify-between items-center text-[10px] text-zinc-400 font-bold uppercase">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
              <span>뉴럴 엔진 준비됨</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
              <span>데이터 매트릭스 동기화 중</span>
            </div>
          </div>
          <div className="font-mono">
            ID: enigma_99x-BF0-NUM
          </div>
        </footer>

      </div>

      {/* Global Navigation Shell (BottomNavBar) matching mock parameters */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#F4F4F5]/90 backdrop-blur-md border-t-4 border-black pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.15)]">
        <div className="flex justify-around items-center h-20 px-8 max-w-[500px] mx-auto gap-3">
          {/* Active play button container */}
          <button
            onClick={() => {
              playCyberSound("click", settings.soundEnabled);
              setActiveTab("game");
            }}
            className={`flex-1 flex flex-col items-center justify-center border-[3px] border-black py-2.5 font-sans font-black text-xs uppercase transition-all duration-200 cursor-pointer ${
              activeTab === "game"
                ? "bg-[#E0FF33] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]"
                : "bg-white text-zinc-500 hover:text-black hover:bg-zinc-100"
            }`}
          >
            <Gamepad2 size={16} className="mb-0.5" />
            <span className="text-[9px] tracking-tight">게임 시작</span>
          </button>

          {/* Rankings chart tab */}
          <button
            onClick={() => {
              playCyberSound("click", settings.soundEnabled);
              setActiveTab("leaderboard");
            }}
            className={`flex-1 flex flex-col items-center justify-center border-[3px] border-black py-2.5 font-sans font-black text-xs uppercase transition-all duration-200 cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-[#E0FF33] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]"
                : "bg-white text-zinc-500 hover:text-black hover:bg-zinc-100"
            }`}
          >
            <BarChart2 size={16} className="mb-0.5" />
            <span className="text-[9px] tracking-tight">리더보드</span>
          </button>

          {/* Config options tab */}
          <button
            onClick={() => {
              playCyberSound("click", settings.soundEnabled);
              setActiveTab("settings");
            }}
            className={`flex-1 flex flex-col items-center justify-center border-[3px] border-black py-2.5 font-sans font-black text-xs uppercase transition-all duration-200 cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#E0FF33] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]"
                : "bg-white text-zinc-500 hover:text-black hover:bg-zinc-100"
            }`}
          >
            <SettingsIcon size={16} className="mb-0.5" />
            <span className="text-[9px] tracking-tight">설정</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
