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
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    return { text: `${big} − ${small}`, answer: big - small };
  }
  return { text: `${a} + ${b}`, answer: a + b };
}

function FloatingBirthdayText() {
  return (
    <div className="floatingBirthday" aria-hidden="true">
      <div className="floatingLine">
        🎂 Feliz Aniversário Alice — 6 aninhos ❄️👑
      </div>
    </div>
  );
}

function Snow() {
  return (
    <div className="snowLayer" aria-hidden="true">
      {Array.from({ length: 26 }).map((_, i) => (
        <span key={i} className={`flake f${(i % 9) + 1}`}>
          ❄
        </span>
      ))}
    </div>
  );
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
    if (musicOn && audioRef.current) {
      try {
        await audioRef.current.play();
      } catch {}
    }
  }

  async function toggleMusic() {
    const a = audioRef.current;
    if (!a) return;

    if (musicOn) {
      a.pause();
      setMusicOn(false);
      return;
    }

    setMusicOn(true);
    try {
      await a.play();
    } catch {}
  }

  function checkAnswer(e) {
    e.preventDefault();
    const n = Number(input);

    if (input.trim() === "" || Number.isNaN(n)) {
      setFeedback("Digite um número ❄️");
      return;
    }

    if (n === question.answer) {
      setScore((s) => s + 10);
      setStreak((s) => s + 1);
      setFeedback("Acertou! ✨❄️");
    } else {
      setStreak(0);
      setFeedback(`Quase! Era ${question.answer} ❄️`);
    }

    setInput("");
  }

  /* ENTRY SCREEN */
  if (!entered) {
    return (
      <div className="page">
        <Snow />
        <FloatingBirthdayText />

        <div className="card glass entry">
          <h1>❄️ Reino do Gelo da Matemática ❄️</h1>
          <p className="muted">
            Toque para entrar no castelo e ouvir a música da Princesa 🎶
          </p>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da princesa"
          />

          <button className="btn icyBtn" onClick={enterCastle} type="button">
            Entrar no Castelo ❄️🎶
          </button>

          <button className="btn ghost" onClick={toggleMusic} type="button">
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
      <FloatingBirthdayText />

      <header className="top">
        <h2>Bem-vinda, {name} 👑</h2>
        <button className="btn ghost" onClick={toggleMusic} type="button">
          🎶 {musicOn ? "On" : "Off"}
        </button>
      </header>

      <div className="card glass">
        <div className="pillRow">
          <button
            className={mode === "sum" ? "pill active" : "pill"}
            onClick={() => setMode("sum")}
            type="button"
          >
            ➕ Soma
          </button>
          <button
            className={mode === "sub" ? "pill active" : "pill"}
            onClick={() => setMode("sub")}
            type="button"
          >
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
            inputMode="numeric"
          />
          <button className="btn icyBtn" type="submit">
            Conferir ❄️
          </button>
        </form>

        {feedback && <div className="feedback">{feedback}</div>}
      </div>

      <footer className="foot">❄️👑 Castelo da Alice 👑❄️</footer>
    </div>
  );
}
