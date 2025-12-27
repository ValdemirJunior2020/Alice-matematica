import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

/* ------------------ Helpers ------------------ */
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

function clampMsg(s, maxLen) {
  const t = (s ?? "").trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1) + "…";
}

/* ------------------ UI Parts ------------------ */
function Snow() {
  return (
    <div className="snowLayer" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, i) => (
        <span key={i} className={`flake f${(i % 9) + 1}`}>
          ❄
        </span>
      ))}
    </div>
  );
}

function FloatingBirthdayText() {
  return (
    <div className="floatingBirthday" aria-hidden="true">
      <div className="floatingLine">🎂 Feliz Aniversário Alice — 6 aninhos ❄️👑</div>
    </div>
  );
}

/* Floating notes around the screen (read-only, from Firestore) */
function FloatingNotes({ notes }) {
  // show a few latest notes as floating bubbles
  const show = (notes || []).slice(0, 8);

  return (
    <div className="floatingNotesLayer" aria-hidden="true">
      {show.map((n, idx) => (
        <div key={n.id} className={`floatNote fn${(idx % 6) + 1}`}>
          <div className="fnName">💙 {n.name}</div>
          <div className="fnMsg">{clampMsg(n.message, 55)}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------ Main App ------------------ */
const COLLECTION_NAME = "alice_guestbook";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [name, setName] = useState("Alice");

  // game
  const [mode, setMode] = useState("sum");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);

  // audio
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);

  // guestbook form
  const [guestName, setGuestName] = useState("");
  const [guestMsg, setGuestMsg] = useState("");

  // CRUD state
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMsg, setEditMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // init audio
  useEffect(() => {
    const audio = new Audio("/audio/a-princesa-dos-numeros.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  // firestore live read
  useEffect(() => {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setNotes(rows);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
      }
    );

    return () => unsub();
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

  async function createNote(e) {
    e.preventDefault();
    const n = guestName.trim();
    const m = guestMsg.trim();

    if (!n || !m) return;

    const safeName = clampMsg(n, 40);
    const safeMsg = clampMsg(m, 120); // short-ish

    setBusy(true);
    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        name: safeName,
        message: safeMsg,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setGuestName("");
      setGuestMsg("");
    } catch (err) {
      console.error("addDoc error:", err);
      alert("Erro ao enviar recadinho. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditName(note.name ?? "");
    setEditMsg(note.message ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditMsg("");
  }

  async function saveEdit(id) {
    const n = clampMsg(editName, 40);
    const m = clampMsg(editMsg, 120);

    if (!n || !m) return;

    setBusy(true);
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        name: n,
        message: m,
        updatedAt: serverTimestamp(),
      });
      cancelEdit();
    } catch (err) {
      console.error("updateDoc error:", err);
      alert("Erro ao editar recadinho.");
    } finally {
      setBusy(false);
    }
  }

  async function removeNote(id) {
    if (!confirm("Apagar este recadinho?")) return;

    setBusy(true);
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (err) {
      console.error("deleteDoc error:", err);
      alert("Erro ao apagar recadinho.");
    } finally {
      setBusy(false);
    }
  }

  /* ENTRY SCREEN */
  if (!entered) {
    return (
      <div className="page">
        <Snow />
        <FloatingBirthdayText />
        <FloatingNotes notes={notes} />

        <div className="card glass entry">
          <h1>❄️ Reino do Gelo da Matemática ❄️</h1>
          <p className="muted">Toque para entrar no castelo e ouvir a música da Princesa 🎶</p>

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

        <div className="card glass">
          <h3 className="sectionTitle">📜 Livro de Recadinhos</h3>
          <p className="muted tiny">Os recadinhos ficam salvos online (Firebase) e todos veem 🎉</p>

          <form onSubmit={createNote} className="noteForm">
            <label className="tiny muted">Seu nome</label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: Tia Maria"
              maxLength={40}
            />

            <label className="tiny muted">Recadinho curto</label>
            <textarea
              value={guestMsg}
              onChange={(e) => setGuestMsg(e.target.value)}
              placeholder="Ex: Parabéns Alice! Você é uma princesa incrível! 🎂❄️"
              maxLength={120}
              rows={3}
            />

            <button className="btn icyBtn" type="submit" disabled={busy}>
              {busy ? "Enviando..." : "Enviar 💌"}
            </button>
          </form>

          <NotesList
            notes={notes}
            editingId={editingId}
            editName={editName}
            editMsg={editMsg}
            setEditName={setEditName}
            setEditMsg={setEditMsg}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            saveEdit={saveEdit}
            removeNote={removeNote}
            busy={busy}
          />
        </div>
      </div>
    );
  }

  /* GAME + GUESTBOOK */
  return (
    <div className="page">
      <Snow />
      <FloatingBirthdayText />
      <FloatingNotes notes={notes} />

      <header className="top">
        <h2>Bem-vinda, {name} 👑</h2>
        <button className="btn ghost" onClick={toggleMusic} type="button">
          🎶 {musicOn ? "On" : "Off"}
        </button>
      </header>

      <div className="layout">
        {/* LEFT: game */}
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

        {/* RIGHT: guestbook */}
        <div className="card glass">
          <h3 className="sectionTitle">📜 Recadinhos pra Alice</h3>
          <p className="muted tiny">Nome + recadinho curto. Você pode editar/apagar (CRUD).</p>

          <form onSubmit={createNote} className="noteForm">
            <label className="tiny muted">Seu nome</label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: Vovó"
              maxLength={40}
            />

            <label className="tiny muted">Recadinho curto</label>
            <textarea
              value={guestMsg}
              onChange={(e) => setGuestMsg(e.target.value)}
              placeholder="Ex: Te amo! Feliz aniversário! 🎂"
              maxLength={120}
              rows={3}
            />

            <button className="btn icyBtn" type="submit" disabled={busy}>
              {busy ? "Enviando..." : "Enviar 💌"}
            </button>
          </form>

          <NotesList
            notes={notes}
            editingId={editingId}
            editName={editName}
            editMsg={editMsg}
            setEditName={setEditName}
            setEditMsg={setEditMsg}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            saveEdit={saveEdit}
            removeNote={removeNote}
            busy={busy}
          />
        </div>
      </div>

      <footer className="foot">❄️👑 Castelo da Alice 👑❄️</footer>
    </div>
  );
}

/* ------------------ Notes list (CRUD UI) ------------------ */
function NotesList({
  notes,
  editingId,
  editName,
  editMsg,
  setEditName,
  setEditMsg,
  startEdit,
  cancelEdit,
  saveEdit,
  removeNote,
  busy,
}) {
  return (
    <div className="noteList">
      {notes.length === 0 ? (
        <div className="muted tiny">Ainda não tem recadinhos… seja o primeiro! ❄️</div>
      ) : (
        notes.map((n) => {
          const isEditing = editingId === n.id;

          return (
            <div key={n.id} className="noteCard">
              {!isEditing ? (
                <>
                  <div className="noteTop">
                    <div className="noteName">💙 {n.name}</div>

                    <div className="noteBtns">
                      <button
                        className="miniBtn"
                        type="button"
                        onClick={() => startEdit(n)}
                        disabled={busy}
                      >
                        Editar
                      </button>
                      <button
                        className="miniBtn danger"
                        type="button"
                        onClick={() => removeNote(n.id)}
                        disabled={busy}
                      >
                        Apagar
                      </button>
                    </div>
                  </div>

                  <div className="noteMsg">{n.message}</div>
                </>
              ) : (
                <>
                  <div className="noteEditGrid">
                    <div>
                      <div className="tiny muted">Nome</div>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={40}
                      />
                    </div>

                    <div>
                      <div className="tiny muted">Recadinho curto</div>
                      <textarea
                        value={editMsg}
                        onChange={(e) => setEditMsg(e.target.value)}
                        maxLength={120}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="noteBtns editRow">
                    <button
                      className="miniBtn"
                      type="button"
                      onClick={() => saveEdit(n.id)}
                      disabled={busy}
                    >
                      Salvar
                    </button>
                    <button className="miniBtn ghosty" type="button" onClick={cancelEdit} disabled={busy}>
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
