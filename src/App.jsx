import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/* Helpers */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(mode) {
  const a = randInt(0, 10);
  const b = randInt(0, 10);

  if (mode === "sub") {
    return { text: `${Math.max(a, b)} − ${Math.min(a, b)}`, answer: Math.abs(a - b) };
  }
  return { text: `${a} + ${b}`, answer: a + b };
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [name, setName] = useState("Alice");
  const [mode, setMode] = useState("sum");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);

  /* AUDIO */
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    const audio = new Audio("/audio/a-princesa-dos-numeros.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  const question = useMemo(() => makeQuestion(mode), [mode, score]);

  async function enterCastle() {
    setEntered(true);
    if (musicOn) {
      try {
        await audioRef.current.play();
      } catch {}
    }
  }

  function toggleMusic() {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setMusicOn(!musicOn);
  }

  function checkAnswer(e) {
    e.preventDefault();
    const n = Number(input);
    if (Number.isNaN(n)) {
      setFeedback("Digite um número ❄️");
      return;
    }
    if (n === question.answer) {
      setScore(score + 10);
      setStreak(streak + 1);
      setFeedback("Acertou! ✨❄️");
    } else {
      setStreak(0);
      setFeedback(`Quase! Era ${question.answer}`);
    }
    setInput("");
  }

  /* ENTRY SCREEN */
  if (!entered) {
    return (
      <div className="page">
        <Snow />
        <div className="card glass entry">
          <h1>❄️ Reino do Gelo da Matemática ❄️</h1>
          <p>Toque para entrar no castelo e ouvir a música da Princesa 🎶</p>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da princesa"
          />

          <button className="btn icyBtn" onClick={enterCastle}>
            Entrar no Castelo ❄️
          </button>

          <button className="btn ghost" onClick={toggleMusic}>
            Música: {musicOn ? "Ligada 🎵" : "Desligada 🔇"}
          </button>
        </div>
      </div>
    );
  }

  /* GAME */
  return (
    <div className="page">
      <Snow />

      <header className="top">
        <h2>Bem-vinda, {name} 👑</h2>
        <button className="btn ghost" onClick={toggleMusic}>
          🎶 {musicOn ? "On" : "Off"}
        </button>
      </header>

      <div className="card glass">
        <div className="pillRow">
          <button className={mode === "sum" ? "pill active" : "pill"} onClick={() => setMode("sum")}>
            ➕ Soma
          </button>
          <button className={mode === "sub" ? "pill active" : "pill"} onClick={() => setMode("sub")}>
            ➖ Subtração
          </button>
        </div>

        <div className="stats">
          <div>⭐ Pontos: {score}</div>
          <div>🔥 Sequência: {streak}</div>
        </div>

        <div className="question">{question.text}</div>

        <form onSubmit={checkAnswer} className="answerRow">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Resposta"
          />
          <button className="btn icyBtn">Conferir ❄️</button>
        </form>

        {feedback && <div className="feedback">{feedback}</div>}
      </div>

      <footer className="foot">🎂 Feliz Aniversário, Princesa {name}! 🎂</footer>
    </div>
  );
}

/* ❄️ Snow Component */
function Snow() {
  return (
    <div className="snowLayer">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className={`flake f${(i % 9) + 1}`}>❄</span>
      ))}
    </div>
  );
}
