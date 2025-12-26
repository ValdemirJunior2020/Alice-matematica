import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/* ------------------ helpers ------------------ */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(mode, level) {
  const ranges = {
    easy: { a: [0, 10], b: [0, 10] },
    medium: { a: [5, 30], b: [0, 20] },
    hard: { a: [10, 99], b: [0, 60] },
  };

  const r = ranges[level] ?? ranges.easy;
  let a = randInt(r.a[0], r.a[1]);
  let b = randInt(r.b[0], r.b[1]);

  if (mode === "sub") {
    if (b > a) [a, b] = [b, a];
    return { text: `${a} − ${b}`, answer: a - b };
  }

  return { text: `${a} + ${b}`, answer: a + b };
}

/* ------------------ App ------------------ */
export default function App() {
  const [name, setName] = useState("Alice");
  const [entered, setEntered] = useState(false);

  const [mode, setMode] = useState("sum");
  const [level, setLevel] = useState("easy");

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [sparkle, setSparkle] = useState(false);

  /* ----------- AUDIO ----------- */
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    const audio = new Audio("/audio/a-princesa-dos-numeros.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  const question = useMemo(
    () => makeQuestion(mode, level),
    [mode, level, correct, wrong]
  );

  async function enterCastle() {
    setEntered(true);
    if (musicOn && audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (e) {
        console.log("Autoplay blocked until interaction");
      }
    }
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      setMusicOn(true);
      try {
        await audio.play();
      } catch {}
    }
  }

  function resetGame() {
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setStreak(0);
    setInput("");
    setFeedback(null);
    setSparkle(false);
  }

  function checkAnswer(e) {
    e.preventDefault();
    const n = Number(input);

    if (input.trim() === "" || Number.isNaN(n)) {
      setFeedback({ type: "warn", msg: "Digite um número 😊" });
      return;
    }

    if (n === question.answer) {
      const newStreak = streak + 1;
      const bonus = newStreak >= 5 ? 10 : newStreak >= 3 ? 5 : 0;

      setScore((s) => s + 10 + bonus);
      setCorrect((c) => c + 1);
      setStreak(newStreak);
      setFeedback({
        type: "ok",
        msg: `Perfeito! ❄️✨ +${10 + bonus} pontos`,
      });

      setSparkle(true);
      setTimeout(() => setSparkle(false), 600);
      setInput("");
      return;
    }

    setWrong((w) => w + 1);
    setStreak(0);
    setScore((s) => Math.max(0, s - 2));
    setFeedback({
      type: "bad",
      msg: `Quase! A resposta certa é ${question.answer} ❄️`,
    });
    setInput("");
  }

  const badge =
    streak >= 8
      ? "👑 Rainha dos Números"
      : streak >= 5
      ? "🌟 Estrela do Castelo"
      : streak >= 3
      ? "✨ Magia Ativa"
      : "❄️ Aprendendo com Alegria";

  /* ---------------- ENTRY SCREEN ---------------- */
  if (!entered) {
    return (
      <div className="page">
        <section className="card glass entry">
          <h1>❄️ Reino do Gelo da Matemática ❄️</h1>
          <p className="muted">
            Toque para entrar no castelo e ouvir a música da Princesa 👑
          </p>

          <div className="nameBox">
            <label>Nome da princesa</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alice"
            />
          </div>

          <div className="entryActions">
            <button className="btn icyBtn" onClick={enterCastle}>
              Entrar no Castelo ❄️🎶
            </button>

            <button className="btn ghost" onClick={toggleMusic}>
              Música: {musicOn ? "Ligada 🎵" : "Desligada 🔇"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* ---------------- GAME ---------------- */
  return (
    <div className="page">
      <header className="top">
        <div>
          <h2>Bem-vinda, {name} 👑</h2>
          <p className="muted">A Princesa dos Números ✨</p>
        </div>

        <button className="btn ghost" onClick={toggleMusic}>
          🎶 {musicOn ? "On" : "Off"}
        </button>
      </header>

      <main className="grid">
        <section className="card glass">
          <div className="controls">
            <div className="pillRow">
              <button
                className={mode === "sum" ? "pill active" : "pill"}
                onClick={() => setMode("sum")}
              >
                ➕ Soma
              </button>
              <button
                className={mode === "sub" ? "pill active" : "pill"}
                onClick={() => setMode("sub")}
              >
                ➖ Subtração
              </button>
            </div>

            <div className="pillRow">
              <button
                className={level === "easy" ? "pill active" : "pill"}
                onClick={() => setLevel("easy")}
              >
                😊 Fácil
              </button>
              <button
                className={level === "medium" ? "pill active" : "pill"}
                onClick={() => setLevel("medium")}
              >
                😎 Médio
              </button>
              <button
                className={level === "hard" ? "pill active" : "pill"}
                onClick={() => setLevel("hard")}
              >
                🧠 Difícil
              </button>
            </div>
          </div>

          <div className="stats">
            <div className="stat">⭐ {score}</div>
            <div className="stat">✅ {correct}</div>
            <div className="stat">❌ {wrong}</div>
            <div className="stat">🔥 {streak}</div>
          </div>

          <div className="badge icy">{badge}</div>

          <div className={sparkle ? "question sparkle" : "question"}>
            {question.text}
          </div>

          <form className="answerRow" onSubmit={checkAnswer}>
            <input
              className="answerInput"
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Resposta"
            />
            <button className="btn icyBtn">Conferir ❄️</button>
          </form>

          {feedback && (
            <div className={`feedback ${feedback.type}`}>
              {feedback.msg}
            </div>
          )}

          <button className="btn ghost" onClick={resetGame}>
            Reiniciar ✨
          </button>
        </section>
      </main>

      <footer className="foot">
        🎂❄️ Feliz Aniversário, Princesa {name}! ❄️🎂
      </footer>
    </div>
  );
}
