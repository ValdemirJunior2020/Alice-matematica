import { useMemo, useState } from "react";
import "./App.css";

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

export default function App() {
  const [name, setName] = useState("Alice");
  const [mode, setMode] = useState("sum"); // sum | sub
  const [level, setLevel] = useState("easy"); // easy | medium | hard

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [sparkle, setSparkle] = useState(false);

  // muda a pergunta quando modo/nível e quando acerta/erra (pra trocar)
  const question = useMemo(
    () => makeQuestion(mode, level),
    [mode, level, correct, wrong]
  );

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

    const trimmed = input.trim();
    if (trimmed === "") {
      setFeedback({ type: "warn", msg: "Digite uma resposta, princesa 😊" });
      return;
    }

    const n = Number(trimmed);
    if (Number.isNaN(n)) {
      setFeedback({ type: "warn", msg: "Ops! Só números, tá? 🔢" });
      return;
    }

    if (n === question.answer) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      const bonus = newStreak >= 5 ? 10 : newStreak >= 3 ? 5 : 0;
      setScore((s) => s + 10 + bonus);
      setCorrect((c) => c + 1);

      setFeedback({
        type: "ok",
        msg: `Perfeito! ❄️✨ +${10 + bonus} pontos!`,
      });

      setSparkle(true);
      setTimeout(() => setSparkle(false), 650);
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

  const titleBadge =
    streak >= 8
      ? "👑 Rainha do Reino do Gelo"
      : streak >= 5
      ? "🌟 Estrela da Neve"
      : streak >= 3
      ? "✨ Magia em Ação"
      : "❄️ Treinando no Castelo";

  return (
    <div className="page">
      {/* Flocos decorativos */}
      <div className="snowLayer" aria-hidden="true">
        <span className="flake f1">❄</span>
        <span className="flake f2">✦</span>
        <span className="flake f3">❅</span>
        <span className="flake f4">✧</span>
        <span className="flake f5">❄</span>
        <span className="flake f6">❅</span>
      </div>

      <header className="top">
        <div className="brand">
          <div className="crest" title="Reino do Gelo">❄️</div>
          <div>
            <div className="title">Reino do Gelo da Matemática</div>
            <div className="subtitle">um jogo mágico de números</div>
          </div>
        </div>

        <div className="nameBox">
          <label>Nome da princesa</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alice"
          />
        </div>
      </header>

      <main className="grid">
        <section className="card glass">
          <div className="heroRow">
            <div>
              <h2>Bem-vinda, {name || "Princesa"} 👑</h2>
              <p className="muted">
                Resolva as continhas no castelo gelado. Junte pontos, faça sequência
                e ganhe títulos reais! ❄️✨
              </p>
            </div>

            <div className="castle" aria-hidden="true">
              <div className="tower t1" />
              <div className="tower t2" />
              <div className="tower t3" />
              <div className="gate" />
            </div>
          </div>

          <div className="controls">
            <div className="control">
              <span className="label">Modo</span>
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
            </div>

            <div className="control">
              <span className="label">Nível</span>
              <div className="pillRow">
                <button
                  className={level === "easy" ? "pill active" : "pill"}
                  onClick={() => setLevel("easy")}
                  type="button"
                >
                  😊 Fácil
                </button>
                <button
                  className={level === "medium" ? "pill active" : "pill"}
                  onClick={() => setLevel("medium")}
                  type="button"
                >
                  😎 Médio
                </button>
                <button
                  className={level === "hard" ? "pill active" : "pill"}
                  onClick={() => setLevel("hard")}
                  type="button"
                >
                  🧠 Difícil
                </button>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="statLabel">Pontos</div>
              <div className="statValue">{score}</div>
            </div>
            <div className="stat">
              <div className="statLabel">Acertos</div>
              <div className="statValue">{correct}</div>
            </div>
            <div className="stat">
              <div className="statLabel">Erros</div>
              <div className="statValue">{wrong}</div>
            </div>
            <div className="stat">
              <div className="statLabel">Sequência</div>
              <div className="statValue">{streak} 🔥</div>
            </div>
          </div>

          <div className="badge icy">{titleBadge}</div>

          <div className={sparkle ? "question sparkle" : "question"}>
            <div className="qLabel">Desafio real:</div>
            <div className="qText">{question.text}</div>
          </div>

          <form className="answerRow" onSubmit={checkAnswer}>
            <input
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite a resposta"
              className="answerInput"
            />
            <button className="btn icyBtn" type="submit">
              Conferir ❄️
            </button>
          </form>

          {feedback && <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>}

          <div className="actions">
            <button className="btn ghost" type="button" onClick={resetGame}>
              Reiniciar o Reino ✨
            </button>
          </div>
        </section>

        <section className="card glass side">
          <h3>Regras do Castelo 👑</h3>
          <ul>
            <li>Acertou: +10 pontos</li>
            <li>3 acertos seguidos: bônus +5</li>
            <li>5 acertos seguidos: bônus +10</li>
            <li>Errou: -2 pontos (nunca fica negativo)</li>
          </ul>

          <div className="divider" />

          <h3>Próximas magias (se você quiser)</h3>
          <ul>
            <li>Multiplicação e divisão</li>
            <li>Modo tabuada (1 a 10)</li>
            <li>Medalhas por nível</li>
            <li>Som de “acertou” / “errou”</li>
          </ul>

          <p className="tiny muted">
            Tema: princesa do gelo / inverno mágico (original e seguro) ❄️
          </p>
        </section>
      </main>

      <footer className="foot">
        Feito com carinho para a Princesa {name || "Alice"} ❄️👑
      </footer>
    </div>
  );
}
