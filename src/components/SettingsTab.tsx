import React, { useState } from "react";
import { motion } from "motion/react";
import { Settings, User, Volume2, VolumeX, Shield, BadgeInfo, Sparkles } from "lucide-react";
import { GameSettings } from "../types";

interface SettingsTabProps {
  settings: GameSettings;
  onUpdateSettings: (updates: Partial<GameSettings>) => void;
}

export default function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const [usernameInput, setUsernameInput] = useState(settings.username);

  const handleDifficultyChange = (diff: "easy" | "medium" | "hard") => {
    let minRange = 1;
    let maxRange = 100;

    if (diff === "medium") {
      maxRange = 500;
    } else if (diff === "hard") {
      maxRange = 1000;
    }

    onUpdateSettings({
      difficulty: diff,
      minRange,
      maxRange,
    });
  };

  const handleUsernameBlur = () => {
    const trimmed = usernameInput.trim();
    if (trimmed) {
      onUpdateSettings({ username: trimmed });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title Header Block */}
      <div className="flex items-center gap-3">
        <span className="h-[2px] flex-grow bg-black" />
        <h2 className="font-mono text-xs text-black uppercase tracking-[0.2em] font-black">게임 설정</h2>
        <span className="h-[2px] flex-grow bg-black" />
      </div>

      {/* Cybernetic Configuration Card */}
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col gap-5">
        
        {/* Username input */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-black" /> 닉네임 설정
          </label>
          <input
            className="w-full bento-input py-3 text-left px-3 text-sm text-black"
            type="text"
            placeholder="닉네임을 입력하세요"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onBlur={handleUsernameBlur}
            maxLength={18}
          />
          <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">
            점수가 로컬 순위표에 기록됩니다.
          </span>
        </div>

        {/* Difficulty compression */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
            <Shield size={14} className="text-black" /> 숫자 범위 및 난이도 설정
          </label>
          
          <div className="grid grid-cols-3 gap-2.5">
            {(["easy", "medium", "hard"] as const).map((diff) => {
              const active = settings.difficulty === diff;
              let activeClass = "bg-white text-zinc-400 border-zinc-200";
              
              if (active) {
                if (diff === "easy") {
                  activeClass = "bg-[#E0FF33] text-black border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
                } else if (diff === "medium") {
                  activeClass = "bg-[#E0FF33] text-black border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
                } else if (diff === "hard") {
                  activeClass = "bg-[#E0FF33] text-black border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
                }
              }

              return (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`py-3.5 px-2 text-center border-2 font-mono text-xs transition-all duration-150 capitalize cursor-pointer flex flex-col items-center gap-1 leading-none ${activeClass} ${
                    !active ? "hover:border-black hover:text-black" : ""
                  }`}
                >
                  <span className="font-black tracking-tight">{diff === 'easy' ? '쉬움' : diff === 'medium' ? '보통' : '어려움'}</span>
                  <span className={`text-[9px] font-bold ${active ? "text-black/60" : "text-zinc-400"}`}>
                    {diff === "easy" ? "1-100" : diff === "medium" ? "1-500" : "1-1000"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound FX Switcher */}
        <div className="flex justify-between items-center py-4 border-t-2 border-black mt-2">
          <div className="flex flex-col gap-0.5 max-w-[70%]">
            <span className="font-sans text-xs font-black text-zinc-900 uppercase tracking-wider">
              효과음 설정
            </span>
            <span className="text-[11px] text-zinc-400 uppercase font-black">
              주요 상태 변화 시 효과음을 재생합니다.
            </span>
          </div>

          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-all cursor-pointer ${
              settings.soundEnabled
                ? "bg-[#E0FF33] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white text-zinc-300 hover:border-black hover:text-black"
            }`}
          >
            {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Cybernetic rules guide card */}
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col gap-3">
        <h4 className="font-mono text-xs font-black text-black flex items-center gap-1.5 uppercase leading-none pb-2 border-b border-black">
          <BadgeInfo size={14} /> 게임 규칙 및 점수 산정 방식
        </h4>
        <ul className="flex flex-col gap-3 text-xs text-zinc-800 leading-relaxed font-medium">
          <li className="flex items-start gap-2">
            <Sparkles size={12} className="text-black shrink-0 mt-0.5" />
            <span><strong>기회 제한:</strong> 쉬움 난이도는 10번, 보통은 8번, 어려움은 6번의 기회가 주어집니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles size={12} className="text-black shrink-0 mt-0.5" />
            <span><strong>점수 산정:</strong> 남은 기회 수에 난이도별 가중치가 곱해집니다. 점수 = <code className="font-mono font-bold bg-zinc-100 border border-black px-1 py-0.2 select-all">남은 기회 × 난이도 배수</code>.</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles size={12} className="text-black shrink-0 mt-0.5" />
            <span><strong>고득점 챌린지:</strong> 어려움 난이도에서 900점 이상을 달성하여 랭킹 보드를 지배해 보세요.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
