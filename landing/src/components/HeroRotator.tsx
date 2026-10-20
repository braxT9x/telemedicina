import { useEffect, useState } from 'react';

const words = ['suas consultas', 'sua receita', 'seu cuidado', 'sua vida'];

export default function HeroRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-grid overflow-hidden align-bottom" aria-live="polite">
      {words.map((w, idx) => (
        <span
          key={w}
          aria-hidden={idx !== i}
          className="col-start-1 row-start-1 whitespace-nowrap text-[#00D37B] font-bold transition-all duration-500 ease-out"
          style={{
            opacity: idx === i ? 1 : 0,
            transform: `translateY(${idx === i ? 0 : idx < i ? -100 : 100}%)`,
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
