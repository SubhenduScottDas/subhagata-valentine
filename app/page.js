'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MESSAGES = [
  'Yaaay Swagata! You just unlocked unlimited hugs, snacks, and silly jokes! 💘',
  'Mission accepted, Swagata. Your Valentine package includes 1,000 smiles and zero boring moments 😄',
  'Swagata, this is official: you are amazing, and this day just got 10x sweeter! 🍓✨'
];

const CONFETTI_COLORS = ['#f45b69', '#ff8a5c', '#ffd166', '#2e6f95', '#7bd389', '#ffffff'];
const FALLBACK_GIF_SRC = 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif';
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function Home() {
  const buttonStageRef = useRef(null);
  const noButtonRef = useRef(null);
  const audioRef = useRef(null);
  const dodgeCooldownRef = useRef(0);
  const positionRef = useRef({ x: 0, y: 0 });
  const [noReady, setNoReady] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [accepted, setAccepted] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(MESSAGES[0]);
  const [musicOn, setMusicOn] = useState(false);
  const [showPhoto, setShowPhoto] = useState(true);
  const [confettiBurst, setConfettiBurst] = useState(0);

  const confettiPieces = Array.from({ length: 24 }, (_, index) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.35;
    const duration = 1.9 + Math.random() * 1.3;
    const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    const rotate = Math.floor(Math.random() * 360);

    return { left, delay, duration, color, rotate, key: `${confettiBurst}-${index}` };
  });

  const setNoPosition = useCallback((next) => {
    positionRef.current = next;
    setPosition(next);
  }, []);

  const isPointerNearNo = useCallback((pointerX, pointerY, metrics, buffer) => {
    const current = positionRef.current;
    const minX = current.x - buffer;
    const maxX = current.x + metrics.buttonRect.width + buffer;
    const minY = current.y - buffer;
    const maxY = current.y + metrics.buttonRect.height + buffer;

    return pointerX >= minX && pointerX <= maxX && pointerY >= minY && pointerY <= maxY;
  }, []);

  const getMetrics = useCallback(() => {
    const stage = buttonStageRef.current;
    const noButton = noButtonRef.current;

    if (!stage || !noButton) return null;

    const stageRect = stage.getBoundingClientRect();
    const buttonRect = noButton.getBoundingClientRect();

    return {
      stageRect,
      buttonRect,
      minX: 5,
      minY: 5,
      maxX: Math.max(5, stageRect.width - buttonRect.width - 5),
      maxY: Math.max(5, stageRect.height - buttonRect.height - 5)
    };
  }, []);

  const initNoButtonPosition = useCallback(() => {
    const metrics = getMetrics();
    if (!metrics) return;

    const x = Math.round(metrics.maxX);
    const y = Math.round(clamp(16, metrics.minY, metrics.maxY));
    setNoPosition({ x, y });
    setNoReady(true);
  }, [getMetrics, setNoPosition]);

  const dodgeFromPointer = useCallback((pointerEvent = null) => {
    const metrics = getMetrics();
    if (!metrics) return;

    const now = Date.now();
    if (now - dodgeCooldownRef.current < 45) return;
    dodgeCooldownRef.current = now;

    const { stageRect, buttonRect, minX, minY, maxX, maxY } = metrics;
    const current = positionRef.current;
    const jitter = 16;
    let x;
    let y;

    if (!pointerEvent) {
      const angle = Math.random() * Math.PI * 2;
      const jump = Math.max(100, Math.min(145, stageRect.width * 0.25));
      x = current.x + Math.cos(angle) * jump + (Math.random() * jitter - jitter / 2);
      y = current.y + Math.sin(angle) * jump + (Math.random() * jitter - jitter / 2);
    } else {
      const pointerX = pointerEvent.clientX - stageRect.left;
      const pointerY = pointerEvent.clientY - stageRect.top;
      const centerX = current.x + buttonRect.width / 2;
      const centerY = current.y + buttonRect.height / 2;
      const deltaX = centerX - pointerX;
      const deltaY = centerY - pointerY;
      const distance = Math.hypot(deltaX, deltaY) || 1;
      const jump = Math.max(165, Math.min(250, stageRect.width * 0.42));
      const unitX = deltaX / distance;
      const unitY = deltaY / distance;

      const directEscape = {
        x: current.x + unitX * jump + (Math.random() * jitter - jitter / 2),
        y: current.y + unitY * jump + (Math.random() * jitter - jitter / 2)
      };
      const oppositeRail = {
        x: pointerX < stageRect.width / 2 ? maxX - 14 : minX + 14,
        y: clamp(pointerY + (pointerY < stageRect.height / 2 ? 80 : -80), minY, maxY)
      };

      const sampledTargets = Array.from({ length: 22 }, () => ({
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY)
      }));

      const candidates = [directEscape, oppositeRail, ...sampledTargets].map((candidate) => ({
        x: clamp(candidate.x, minX, maxX),
        y: clamp(candidate.y, minY, maxY)
      }));

      const scored = candidates.map((candidate) => {
        const candidateCenterX = candidate.x + buttonRect.width / 2;
        const candidateCenterY = candidate.y + buttonRect.height / 2;
        const pointerDistance = Math.hypot(candidateCenterX - pointerX, candidateCenterY - pointerY);
        const moveDistance = Math.hypot(candidate.x - current.x, candidate.y - current.y);
        const edgeDistance = Math.min(
          candidate.x - minX,
          maxX - candidate.x,
          candidate.y - minY,
          maxY - candidate.y
        );

        let score = pointerDistance + Math.min(moveDistance, 170) * 0.35 + edgeDistance * 0.5;
        if (moveDistance < 42) score -= 140;
        if (edgeDistance < 18) score -= 80;
        if (pointerDistance < 125) score -= 100;
        return { candidate, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const shortlistSize = Math.min(5, scored.length);
      const picked = scored[Math.floor(Math.random() * shortlistSize)].candidate;

      x = picked.x;
      y = picked.y;
    }

    setNoPosition({
      x: Math.round(clamp(x, minX, maxX)),
      y: Math.round(clamp(y, minY, maxY))
    });
  }, [getMetrics, setNoPosition]);

  const onYesClick = useCallback(() => {
    const random = Math.floor(Math.random() * MESSAGES.length);
    setSelectedMessage(MESSAGES[random]);
    setAccepted(true);
    setConfettiBurst((prev) => prev + 1);
  }, []);

  const onMusicToggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicOn) {
      audio.pause();
      setMusicOn(false);
      return;
    }

    try {
      await audio.play();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  }, [musicOn]);

  const onStagePointerMove = useCallback((event) => {
    const metrics = getMetrics();
    if (!metrics) return;

    const pointerX = event.clientX - metrics.stageRect.left;
    const pointerY = event.clientY - metrics.stageRect.top;

    if (isPointerNearNo(pointerX, pointerY, metrics, 30)) {
      dodgeFromPointer(event);
    }
  }, [dodgeFromPointer, getMetrics, isPointerNearNo]);

  const onStagePointerDownCapture = useCallback((event) => {
    const metrics = getMetrics();
    if (!metrics) return;

    const pointerX = event.clientX - metrics.stageRect.left;
    const pointerY = event.clientY - metrics.stageRect.top;
    if (isPointerNearNo(pointerX, pointerY, metrics, 38)) {
      event.preventDefault();
      event.stopPropagation();
      dodgeFromPointer(event);
    }
  }, [dodgeFromPointer, getMetrics, isPointerNearNo]);

  useEffect(() => {
    const onResize = () => initNoButtonPosition();
    const frame = window.requestAnimationFrame(initNoButtonPosition);
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [initNoButtonPosition]);

  useEffect(() => {
    const fallbackImage = new Image();
    fallbackImage.src = FALLBACK_GIF_SRC;

    const photoProbe = new Image();
    photoProbe.src = '/swagata.jpg';
    photoProbe.onerror = () => setShowPhoto(false);
  }, []);

  return (
    <main className="page">
      <audio ref={audioRef} loop preload="none" src="/love-song.mp3" />

      <section className="card">
        <div className="top-actions">
          <button className="music" onClick={onMusicToggle} type="button">
            {musicOn ? 'Music: On 🎵' : 'Music: Off 🔇'}
          </button>
        </div>

        <p className="tag">Special Valentine Transmission</p>
        <h1>Swagata, will you be my Valentine? ❤️</h1>
        <p className="subtitle">Choose carefully. One button behaves suspiciously.</p>

        <div
          className="button-stage"
          ref={buttonStageRef}
          onPointerMove={onStagePointerMove}
          onPointerDownCapture={onStagePointerDownCapture}
        >
          <button className="yes" onClick={onYesClick} type="button">
            Yes, absolutely!
          </button>

          <button
            ref={noButtonRef}
            className="no"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              opacity: noReady ? 1 : 0,
              pointerEvents: 'none'
            }}
            aria-label="No (good luck clicking this)"
            type="button"
            tabIndex={-1}
          >
            No 😶
          </button>
        </div>
      </section>

      {accepted && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Valentine message">
          <article className="popup">
            <div className="confetti-layer" aria-hidden="true">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.key}
                  className="confetti"
                  style={{
                    left: `${piece.left}%`,
                    backgroundColor: piece.color,
                    animationDelay: `${piece.delay}s`,
                    animationDuration: `${piece.duration}s`,
                    transform: `rotate(${piece.rotate}deg)`
                  }}
                />
              ))}
            </div>
            <h2>Best Answer Ever 🎉</h2>
            <p>{selectedMessage}</p>
            {showPhoto ? (
              <img
                src="/swagata.jpg"
                alt="Swagata"
                onError={() => setShowPhoto(false)}
                loading="eager"
              />
            ) : (
              <img
                src={FALLBACK_GIF_SRC}
                alt="Funny excited cat dancing"
                loading="eager"
              />
            )}
            <button className="close" onClick={() => setAccepted(false)}>
              Replay the magic ✨
            </button>
          </article>
        </div>
      )}
    </main>
  );
}
