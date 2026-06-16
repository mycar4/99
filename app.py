import streamlit as st
import random
import time
import base64

# Page Config
st.set_page_config(
    page_title="숫자 에니그마 (Number Enigma)",
    page_icon="🔮",
    layout="centered"
)

# Custom Brutalist CSS Styling
st.markdown("""
<style>
    /* Import Google Font */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Share+Tech+Mono&display=swap');
    
    html, body, [data-testid="stAppViewContainer"] {
        background-color: #F4F4F5 !important;
        font-family: 'Outfit', sans-serif !important;
        color: #18181B !important;
    }
    
    /* Bento Card Container */
    .bento-card {
        background-color: #FFFFFF;
        border: 3px solid #000000;
        box-shadow: 4px 4px 0px 0px #000000;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 0px;
    }
    
    .bento-header {
        border-bottom: 4px solid #000000;
        padding-bottom: 15px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }
    
    .bento-title {
        font-size: 2.5rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: -0.05em;
        line-height: 1.0;
        color: #18181B;
    }
    
    .bento-subtitle {
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #A1A1AA;
    }
    
    .timer-badge {
        background-color: #000000;
        color: #E0FF33;
        padding: 6px 12px;
        font-family: 'Share Tech Mono', monospace;
        font-weight: 900;
        border: 2px solid #000000;
        font-size: 1.1rem;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #EF4444;
        display: inline-block;
    }
    
    /* Neon Primary Button Style */
    .stButton>button {
        background-color: #E0FF33 !important;
        color: #000000 !important;
        border: 3px solid #000000 !important;
        box-shadow: 4px 4px 0px 0px #000000 !important;
        border-radius: 0px !important;
        font-weight: 900 !important;
        text-transform: uppercase !important;
        transition: all 0.1s ease !important;
        width: 100% !important;
        padding: 12px !important;
    }
    
    .stButton>button:active {
        transform: translate(2px, 2px) !important;
        box-shadow: 2px 2px 0px 0px #000000 !important;
    }
    
    /* Reset/Reboot/Red Button */
    div[data-testid="stHorizontalBlock"] button.red-btn {
        background-color: #EF4444 !important;
        color: #FFFFFF !important;
    }
    
    /* Input Style */
    .stNumberInput input {
        border: 3px solid #000000 !important;
        border-radius: 0px !important;
        font-size: 2rem !important;
        font-weight: 900 !important;
        text-align: center !important;
        background-color: #FFFFFF !important;
    }
    
    /* Progress bar */
    .progress-bar-container {
        height: 20px;
        background-color: #F4F4F5;
        border: 2px solid #000000;
        padding: 2px;
        margin-top: 8px;
    }
    .progress-bar-fill {
        height: 100%;
        background-color: #000000;
    }
    .progress-bar-fill.danger {
        background-color: #EF4444;
    }
    
    /* History table */
    .history-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #FAFAFA;
        border: 2px solid #000000;
        margin-bottom: 8px;
        font-family: 'Share Tech Mono', monospace;
        font-weight: bold;
    }
    .badge-hint {
        border: 1px solid #000000;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
    }
    .badge-hint.higher {
        background-color: #FEE2E2;
        color: #DC2626;
    }
    .badge-hint.lower {
        background-color: #FEF3C7;
        color: #D97706;
    }
    .badge-hint.correct {
        background-color: #E0FF33;
        color: #000000;
    }
    
    /* Leaderboard Badge */
    .leader-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 2px solid #000000;
        box-shadow: 3px 3px 0px 0px #000000;
        margin-bottom: 12px;
        background-color: #FFFFFF;
    }
    .leader-row.gold {
        background-color: #E0FF33;
    }
    .rank-number {
        font-family: 'Share Tech Mono', monospace;
        font-weight: 900;
        font-size: 1.1rem;
        width: 30px;
    }
</style>
""", unsafe_allow_html=True)

# ----------------- SESSION STATE -----------------
if "settings" not in st.session_state:
    st.session_state.settings = {
        "username": "AlphaCoder",
        "difficulty": "easy",
        "soundEnabled": True,
        "minRange": 1,
        "maxRange": 100
    }

if "personalHighScore" not in st.session_state:
    st.session_state.personalHighScore = 999

DEFAULT_RANKINGS = [
    {"name": "CyberNinja", "score": 950, "title": "프로 로직 에이전트", "difficulty": "easy"},
    {"name": "VoidWalker", "score": 820, "title": "추측 마스터", "difficulty": "easy"},
    {"name": "BitMaster", "score": 740, "title": "데이터 분석가", "difficulty": "easy"},
    {"name": "NullPointer", "score": 690, "title": "시스템 관리자", "difficulty": "easy"},
    {"name": "GhostInShell", "score": 610, "title": "뉴럴 해커", "difficulty": "easy"}
]

if "rankings" not in st.session_state:
    st.session_state.rankings = list(DEFAULT_RANKINGS)

def get_max_chances(difficulty):
    if difficulty == "medium":
        return 8
    elif difficulty == "hard":
        return 6
    return 10

def get_max_range(difficulty):
    if difficulty == "medium":
        return 500
    elif difficulty == "hard":
        return 1000
    return 100

def initialize_game():
    diff = st.session_state.settings["difficulty"]
    max_c = get_max_chances(diff)
    max_r = get_max_range(diff)
    
    st.session_state.game = {
        "targetNumber": random.randint(1, max_r),
        "chancesLeft": max_c,
        "maxChances": max_c,
        "previousGuesses": [],
        "status": "playing", # "playing", "won", "lost"
        "hint": {"text": "숫자를 입력하여 시작하세요", "type": "start"},
        "startTime": time.time()
    }
    st.session_state.settings["maxRange"] = max_r

if "game" not in st.session_state:
    initialize_game()

# Audio Helper using dynamic base64 synthesizer
def play_sound(sound_type):
    if not st.session_state.settings["soundEnabled"]:
        return
    # Streamlit doesn't support Web Audio natively easily without JS. 
    # We can inject a hidden HTML audio play element using custom audio synth waves
    # frequencies: click=600Hz, success=midi notes, fail=sawtooth 170Hz->50Hz
    # Since dynamic generation is complex, we use built-in browser synthesizers via JS
    js_code = ""
    if sound_type == "click":
        js_code = """
        <script>
        (function() {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
            osc.start(); osc.stop(ctx.currentTime + 0.12);
        })();
        </script>
        """
    elif sound_type == "success":
        js_code = """
        <script>
        (function() {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.setValueAtTime(480, ctx.currentTime + 0.08);
            osc.frequency.setValueAtTime(640, ctx.currentTime + 0.16);
            osc.frequency.setValueAtTime(960, ctx.currentTime + 0.24);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
            osc.start(); osc.stop(ctx.currentTime + 0.45);
        })();
        </script>
        """
    elif sound_type == "fail":
        js_code = """
        <script>
        (function() {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(170, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.45);
            osc.start(); osc.stop(ctx.currentTime + 0.5);
        })();
        </script>
        """
    elif sound_type == "higher":
        js_code = """
        <script>
        (function() {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(350, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.22);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
            osc.start(); osc.stop(ctx.currentTime + 0.24);
        })();
        </script>
        """
    elif sound_type == "lower":
        js_code = """
        <script>
        (function() {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(550, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.22);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
            osc.start(); osc.stop(ctx.currentTime + 0.24);
        })();
        </script>
        """
    
    st.markdown(js_code, unsafe_allow_html=True)

# ----------------- HEADER SECTION -----------------
elapsed_seconds = int(time.time() - st.session_state.game["startTime"]) if st.session_state.game["status"] == "playing" else 0
mins = elapsed_seconds // 60
secs = elapsed_seconds % 60
time_str = f"{mins:02d}:{secs:02d}"

st.markdown(f"""
<div class="bento-header">
    <div>
        <div class="bento-subtitle">난이도: {'쉬움' if st.session_state.settings['difficulty'] == 'easy' else '보통' if st.session_state.settings['difficulty'] == 'medium' else '어려움'}</div>
        <div class="bento-title">숫자 에니그마.</div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
        <div class="timer-badge">
            <span class="status-dot"></span>
            <span>{time_str}</span>
        </div>
        <div style="font-size: 9px; font-weight: 900; color: #A1A1AA; text-transform: uppercase;">엔진 동기화 활성</div>
    </div>
</div>
""", unsafe_allow_html=True)

# Tabs
tab_choice = st.radio(
    "TAB_NAV", 
    ["🎮 게임 시작", "🏆 리더보드", "⚙️ 설정"], 
    horizontal=True, 
    label_visibility="collapsed"
)

# Global Toolbar Row
col_tb1, col_tb2 = st.columns([1, 1])
with col_tb1:
    if st.button("🔄 재시작"):
        play_sound("click")
        initialize_game()
        st.rerun()
with col_tb2:
    high_score = st.session_state.personalHighScore
    high_score_str = f"최고 점수: {high_score}" if high_score != 999 else "최고 점수: 없음"
    st.markdown(f"""
    <div style="font-family: 'Share Tech Mono', monospace; font-size: 13px; font-weight: 900; color: #000000; display: flex; align-items: center; justify-content: center; gap: 6px; background-color: #E0FF33; border: 2px solid #000000; padding: 7px 12px; height: 100%;">
        <span>🏆 {high_score_str}</span>
    </div>
    """, unsafe_allow_html=True)

st.write("")

# ----------------- TABS IMPLEMENTATION -----------------

if tab_choice == "🎮 게임 시작":
    game = st.session_state.game
    settings = st.session_state.settings
    
    col_stat1, col_stat2 = st.columns(2)
    
    with col_stat1:
        # Attempts Box
        lives_percent = (game["chancesLeft"] / game["maxChances"]) * 100
        is_danger = game["chancesLeft"] <= 3
        bar_color_class = "danger" if is_danger else ""
        
        st.markdown(
            f'<div class="bento-card" style="height: 100%;">'
            f'<div class="bento-subtitle">남은 시도 기회</div>'
            f'<div style="font-size: 3rem; font-weight: 900; font-family: \'Share Tech Mono\', monospace; line-height: 1.1;">'
            f'{game["chancesLeft"]:02d}<span style="color: #E4E4E7;">/{game["maxChances"]}</span>'
            f'</div>'
            f'<div class="progress-bar-container">'
            f'<div class="progress-bar-fill {bar_color_class}" style="width: {lives_percent}%;"></div>'
            f'</div>'
            f'<div style="display: flex; justify-content: space-between; font-size: 9px; font-weight: bold; color: #A1A1AA; margin-top: 6px; text-transform: uppercase;">'
            f'<span>안정성 엔진 상태</span>'
            f'<span style="color: {"#EF4444" if is_danger else "#18181B"}; font-weight: 900;">'
            f'{"실패 위기!" if is_danger else "정상"}'
            f'</span>'
            f'</div>'
            f'</div>',
            unsafe_allow_html=True
        )
        
    with col_stat2:
        # Guessed Box
        hearts_html = ""
        for i in range(game["maxChances"]):
            active = i < game["chancesLeft"]
            color = "#E0FF33" if active else "#F4F4F5"
            border = "3px solid #000000"
            fill = "black" if active else "none"
            stroke = "black" if active else "#D4D4D8"
            hearts_html += f'<div style="width: 28px; height: 28px; border: {border}; background-color: {color}; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="{fill}" stroke="{stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>'
            
        st.markdown(
            f'<div class="bento-card" style="height: 100%;">'
            f'<div class="bento-subtitle">시도 횟수 분석</div>'
            f'<div style="font-size: 13px; font-weight: bold; margin-top: 6px; line-height: 1.4;">'
            f'현재 차원에서 총 <span style="background-color: #F4F4F5; border: 1px solid #000000; padding: 2px 6px; font-family: \'Share Tech Mono\', monospace;">{len(game["previousGuesses"])}</span>번 추측했습니다.'
            f'</div>'
            f'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 15px;">'
            f'{hearts_html}'
            f'</div>'
            f'</div>',
            unsafe_allow_html=True
        )

    # Response Banner
    hint = game["hint"]
    bg_color = "#FFFFFF"
    text_color = "#18181B"
    if hint["type"] == "higher":
        bg_color = "#F87171"
    elif hint["type"] == "lower":
        bg_color = "#FCD34D"
    elif hint["type"] == "win":
        bg_color = "#E0FF33"
    elif hint["type"] == "lose":
        bg_color = "#000000"
        text_color = "#FFFFFF"
    elif hint["type"] == "invalid":
        bg_color = "#E4E4E7"

    st.markdown(f"""<div style="border: 3px solid #000000; box-shadow: 4px 4px 0px 0px #000000; background-color: {bg_color}; color: {text_color}; padding: 15px; text-align: center; font-weight: 900; margin-bottom: 20px;">
<div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.6; margin-bottom: 4px;">뉴럴 엔진 분석 결과</div>
<div style="font-size: 1.25rem; text-transform: uppercase; tracking-tight: -0.025em; display: flex; align-items: center; justify-content: center; gap: 8px;">
<span>⚡ {hint['text']}</span>
</div>
</div>""", unsafe_allow_html=True)

    # Brutalist Input Panel
    st.markdown(f"""
    <div style="margin-bottom: -15px;">
        <div class="bento-subtitle">추측 대상 범위</div>
        <div style="font-size: 1.15rem; font-weight: 900; color: #18181B; margin-top: 2px; margin-bottom: 8px;">
            설정된 숫자 범위: {settings['minRange']} ~ {settings['maxRange']}
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Main Guess Input Form
    if game["status"] == "playing":
        with st.form("guess_form", clear_on_submit=True):
            guess_val = st.number_input(
                "INPUT_NUMBER",
                min_value=settings["minRange"],
                max_value=settings["maxRange"],
                step=1,
                label_visibility="collapsed"
            )
            submit_guess = st.form_submit_button("추측 실행 ⚡")
            
            if submit_guess:
                play_sound("click")
                
                # Check duplicate
                already_guessed = any(g["value"] == guess_val for g in game["previousGuesses"])
                
                if already_guessed:
                    game["hint"] = {"text": f"이미 입력한 숫자입니다: {guess_val}!", "type": "invalid"}
                    play_sound("fail")
                else:
                    game["chancesLeft"] -= 1
                    
                    if guess_val == game["targetNumber"]:
                        game["status"] = "won"
                        game["hint"] = {"text": "정답입니다! 뉴럴 매트릭스 일치! 🎉", "type": "win"}
                        play_sound("success")
                        
                        # Register Score
                        diff_multiplier = 100 if settings["difficulty"] == "easy" else 250 if settings["difficulty"] == "medium" else 500
                        game_score = (game["chancesLeft"] + 1) * diff_multiplier
                        
                        # Add custom rank
                        title_pool = {"easy": "논리 입문자", "medium": "추측 마스터", "hard": "뉴럴 해커 엘리트"}
                        new_rank = {
                            "name": settings["username"] if settings["username"] else "익명의 도전자",
                            "score": game_score,
                            "title": title_pool[settings["difficulty"]],
                            "difficulty": settings["difficulty"],
                            "isCustom": True
                        }
                        st.session_state.rankings.append(new_rank)
                        st.session_state.rankings = sorted(st.session_state.rankings, key=lambda x: x["score"], reverse=True)
                        
                        if game_score > st.session_state.personalHighScore or st.session_state.personalHighScore == 999:
                            st.session_state.personalHighScore = game_score
                    else:
                        if guess_val < game["targetNumber"]:
                            guess_res = "higher"
                            game["hint"] = {"text": "너무 낮습니다! (더 높음 ↑)", "type": "higher"}
                            play_sound("higher")
                        else:
                            guess_res = "lower"
                            game["hint"] = {"text": "너무 높습니다! (더 낮음 ↓)", "type": "lower"}
                            play_sound("lower")
                            
                        game["previousGuesses"].insert(0, {"value": guess_val, "result": guess_res})
                        
                        if game["chancesLeft"] <= 0:
                            game["status"] = "lost"
                            game["hint"] = {"text": "기회가 모두 소진되었습니다! 퍼즐 해결 실패 💀", "type": "lose"}
                            play_sound("fail")
                            
                st.rerun()
    else:
        st.markdown(f"""
        <div style="border: 3px solid #000000; background-color: #FFFFFF; padding: 30px; text-align: center; margin-bottom: 20px;">
            <div style="font-size: 10px; font-weight: 900; color: #A1A1AA; text-transform: uppercase;">정답 공개</div>
            <div style="font-size: 4rem; font-weight: 900; font-family: 'Share Tech Mono', monospace; color: #000000;">
                {game['targetNumber']}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("새 게임 시작 🔄"):
            play_sound("click")
            initialize_game()
            st.rerun()

    # Quick Percentile Compressions
    if game["status"] == "playing":
        st.markdown("""
        <div style="margin-top: 15px; margin-bottom: 8px;">
            <div class="bento-subtitle">빠른 비율 탐색</div>
        </div>
        """, unsafe_allow_html=True)
        
        cols_q = st.columns(4)
        quick_pcts = [25, 50, 75, 90]
        min_p = settings["minRange"]
        max_p = settings["maxRange"]
        
        for idx, pct in enumerate(quick_pcts):
            val = int(min_p + (max_p - min_p) * (pct / 100))
            with cols_q[idx]:
                if st.button(f"{val}", key=f"quick_{val}"):
                    play_sound("click")
                    # Set the state value and trigger evaluation or preset in session
                    # In Streamlit form we can just inject into history or run the evaluation directly
                    already_guessed = any(g["value"] == val for g in game["previousGuesses"])
                    if already_guessed:
                        game["hint"] = {"text": f"이미 입력한 숫자입니다: {val}!", "type": "invalid"}
                        play_sound("fail")
                    else:
                        game["chancesLeft"] -= 1
                        if val == game["targetNumber"]:
                            game["status"] = "won"
                            game["hint"] = {"text": "정답입니다! 뉴럴 매트릭스 일치! 🎉", "type": "win"}
                            play_sound("success")
                            
                            diff_multiplier = 100 if settings["difficulty"] == "easy" else 250 if settings["difficulty"] == "medium" else 500
                            game_score = (game["chancesLeft"] + 1) * diff_multiplier
                            title_pool = {"easy": "논리 입문자", "medium": "추측 마스터", "hard": "뉴럴 해커 엘리트"}
                            st.session_state.rankings.append({
                                "name": settings["username"] if settings["username"] else "익명의 도전자",
                                "score": game_score,
                                "title": title_pool[settings["difficulty"]],
                                "difficulty": settings["difficulty"],
                                "isCustom": True
                            })
                            st.session_state.rankings = sorted(st.session_state.rankings, key=lambda x: x["score"], reverse=True)
                            if game_score > st.session_state.personalHighScore or st.session_state.personalHighScore == 999:
                                st.session_state.personalHighScore = game_score
                        else:
                            if val < game["targetNumber"]:
                                guess_res = "higher"
                                game["hint"] = {"text": "너무 낮습니다! (더 높음 ↑)", "type": "higher"}
                                play_sound("higher")
                            else:
                                guess_res = "lower"
                                game["hint"] = {"text": "너무 높습니다! (더 낮음 ↓)", "type": "lower"}
                                play_sound("lower")
                            game["previousGuesses"].insert(0, {"value": val, "result": guess_res})
                            if game["chancesLeft"] <= 0:
                                game["status"] = "lost"
                                game["hint"] = {"text": "기회가 모두 소진되었습니다! 퍼즐 해결 실패 💀", "type": "lose"}
                                play_sound("fail")
                    st.rerun()

    # Previous Guesses Log
    if game["previousGuesses"]:
        st.markdown("""
        <div style="margin-top: 25px; margin-bottom: 8px;">
            <div class="bento-subtitle">이전 시도 기록</div>
        </div>
        """, unsafe_allow_html=True)
        
        for idx, g in enumerate(game["previousGuesses"]):
            total_g = len(game["previousGuesses"])
            current_num = total_g - idx
            
            res_label = ""
            res_class = ""
            if g["result"] == "higher":
                res_label = "너무 낮음 (더 높음 ↑)"
                res_class = "higher"
            elif g["result"] == "lower":
                res_label = "너무 높음 (더 낮음 ↓)"
                res_class = "lower"
            else:
                res_label = "정답"
                res_class = "correct"
                
            st.markdown(f"""
            <div class="history-row">
                <div>
                    <span style="color: #A1A1AA; margin-right: 8px;">#{current_num}</span>
                    <span>입력값: {g['value']}</span>
                </div>
                <div class="badge-hint {res_class}">
                    {res_label}
                </div>
            </div>
            """, unsafe_allow_html=True)

elif tab_choice == "🏆 리더보드":
    st.markdown("""
    <div class="bento-card" style="display: flex; align-items: center; gap: 15px;">
        <div style="width: 48px; height: 48px; background-color: #000000; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            🏆
        </div>
        <div>
            <h3 style="font-family: 'Share Tech Mono', monospace; font-weight: 900; margin: 0; font-size: 1.1rem; text-transform: uppercase;">논리 리더보드</h3>
            <p style="font-size: 11px; color: #71717A; margin: 0; text-transform: uppercase; font-weight: bold;">최고 득점자들의 순위표입니다.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("""
    <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
        <span style="font-family: 'Share Tech Mono', monospace; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 2px;">최고 득점자 목록</span>
    </div>
    """, unsafe_allow_html=True)
    
    for idx, rank in enumerate(st.session_state.rankings[:5]):
        place = idx + 1
        is_gold = place == 1
        gold_class = "gold" if is_gold else ""
        badge_you = f'<span style="font-size: 9px; font-family: \'Share Tech Mono\', monospace; background-color: #000000; color: #E0FF33; padding: 2px 6px; font-weight: 900; margin-left: 6px;">나</span>' if rank.get("isCustom") else ""
        
        diff_label = '쉬움' if rank['difficulty'] == 'easy' else '보통' if rank['difficulty'] == 'medium' else '어려움'
        st.markdown(f"""<div class="leader-row {gold_class}">
<div class="rank-number">{place:02d}</div>
<div style="flex-grow: 1;">
<div style="display: flex; align-items: center; flex-wrap: wrap;">
<span style="font-weight: 900; font-size: 15px; color: #000000;">{rank['name']}</span>
{badge_you}
<span style="font-size: 8px; font-family: 'Share Tech Mono', monospace; border: 1px solid #000000; padding: 1px 4px; font-weight: bold; margin-left: 6px; text-transform: uppercase;">{diff_label}</span>
</div>
<div style="font-size: 11px; color: #71717A; text-transform: uppercase; font-weight: bold; margin-top: 2px;">{rank['title']}</div>
</div>
<div style="text-align: right;">
<span style="font-family: 'Share Tech Mono', monospace; font-weight: 900; font-size: 17px; color: #000000;">{rank['score']}</span>
<span style="font-size: 9px; color: #71717A; display: block; font-weight: bold; margin-top: -3px;">점</span>
</div>
</div>""", unsafe_allow_html=True)
        
    has_custom = any(r.get("isCustom") for r in st.session_state.rankings)
    if has_custom:
        st.markdown(f"""
        <div class="bento-card" style="padding: 15px; margin-top: 20px;">
            <div class="bento-subtitle" style="display: flex; align-items: center; gap: 6px;">
                🛡️ 최고 점수 보안 기록
            </div>
            <p style="font-size: 12px; color: #4B5563; margin-top: 6px; margin-bottom: 0;">
                개인 최고 점수는 <strong>{st.session_state.personalHighScore} 점</strong> 입니다. 브라우저 세션 저장소에 안전하게 기록되었습니다.
            </p>
        </div>
        """, unsafe_allow_html=True)
        
    if st.button("🔴 리더보드 초기화", key="reset_leaders"):
        play_sound("fail")
        st.session_state.rankings = list(DEFAULT_RANKINGS)
        st.session_state.personalHighScore = 999
        st.rerun()

elif tab_choice == "⚙️ 설정":
    st.markdown("""
    <div style="margin-bottom: 15px; text-align: center;">
        <span style="font-family: 'Share Tech Mono', monospace; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 2px;">게임 설정</span>
    </div>
    """, unsafe_allow_html=True)
    
    with st.container(border=True):
        # Username Input
        username = st.text_input(
            "닉네임 설정",
            value=st.session_state.settings["username"],
            max_chars=18
        )
        if username != st.session_state.settings["username"]:
            st.session_state.settings["username"] = username
            
        st.markdown("<span style='font-size: 10px; color: #A1A1AA; font-weight: bold;'>점수가 로컬 순위표에 기록됩니다.</span>", unsafe_allow_html=True)
        st.write("")
        
        # Difficulty Select
        difficulty_opts = {"easy": "쉬움 (1-100)", "medium": "보통 (1-500)", "hard": "어려움 (1-1000)"}
        diff_val = st.radio(
            "숫자 범위 및 난이도 설정",
            options=list(difficulty_opts.keys()),
            format_func=lambda x: difficulty_opts[x],
            index=list(difficulty_opts.keys()).index(st.session_state.settings["difficulty"])
        )
        
        if diff_val != st.session_state.settings["difficulty"]:
            st.session_state.settings["difficulty"] = diff_val
            initialize_game()
            st.rerun()
            
        st.write("")
        
        # Sound FX Switcher
        sound_enabled = st.checkbox("효과음 활성화", value=st.session_state.settings["soundEnabled"])
        if sound_enabled != st.session_state.settings["soundEnabled"]:
            st.session_state.settings["soundEnabled"] = sound_enabled
            play_sound("click")
            st.rerun()

    # Guide Card
    st.markdown("""
    <div class="bento-card" style="margin-top: 20px;">
        <h4 style="font-family: 'Share Tech Mono', monospace; font-size: 12px; font-weight: 900; margin: 0 0 10px 0; border-bottom: 1px solid #000000; padding-bottom: 6px;">
            ℹ️ 게임 규칙 및 점수 산정 방식
        </h4>
        <ul style="font-size: 12px; color: #374151; padding-left: 20px; line-height: 1.5; margin: 0;">
            <li><strong>기회 제한:</strong> 쉬움 난이도는 10번, 보통은 8번, 어려움은 6번의 기회가 주어집니다.</li>
            <li><strong>점수 산정:</strong> 남은 기회 수에 난이도별 가중치가 곱해집니다. 점수 = 남은 기회 × 난이도 배수.</li>
            <li><strong>고득점 챌린지:</strong> 어려움 난이도에서 900점 이상을 달성하여 랭킹 보드를 지배해 보세요.</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

# ----------------- FOOTER SECTION -----------------
st.markdown("""
<footer style="margin-top: 40px; padding-top: 15px; border-top: 2px solid #E4E4E7; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #A1A1AA; font-weight: bold; text-transform: uppercase;">
    <div style="display: flex; gap: 15px;">
        <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #22C55E; border: 1px solid #000000;"></div>
            <span>뉴럴 엔진 준비됨</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #000000;"></div>
            <span>데이터 매트릭스 동기화 중</span>
        </div>
    </div>
    <div style="font-family: 'Share Tech Mono', monospace;">
        ID: enigma_99x-BF0-NUM
    </div>
</footer>
""", unsafe_allow_html=True)
