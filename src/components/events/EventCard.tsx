'use client';

import { ArtEvent } from '@/types';

const CARD_COLORS = ['#E06927', '#EFCEEE', '#C8CC17', '#BFDBD8'];

function getCardColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

interface Props {
  event: ArtEvent;
  onClick: (e: ArtEvent) => void;
  fullWidth?: boolean;
}

export default function EventCard({ event, onClick, fullWidth = false }: Props) {
  const bgColor = getCardColor(event.id);

  return (
    <button
      onClick={() => onClick(event)}
      className={fullWidth ? 'w-full text-left' : 'text-left flex-none h-full'}
      style={fullWidth ? undefined : { width: 346 }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          backgroundColor: bgColor,
          borderRadius: 24,
          padding: 24,
          gap: 16,
          height: fullWidth ? 460 : '100%',
          maxHeight: 460,
        }}
      >
        {/* Title */}
        <h3
          className="text-black line-clamp-2 flex-none"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 600,
            fontSize: 32,
            lineHeight: '36px',
            letterSpacing: '-0.02em',
          }}
        >
          {event.title}
        </h3>

        {/* Image — grows to fill available space */}
        <div className="flex-1 min-h-0 overflow-hidden" style={{ borderRadius: 12 }}>
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-black/10" />
          )}
        </div>

        {/* Description */}
        <p
          className="flex-none text-black"
          style={{
            fontFamily: 'var(--font-oxygen)',
            fontWeight: 300,
            fontSize: 16,
            lineHeight: '24px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>

        {/* Details link */}
        <span
          className="flex-none text-black hover:underline underline-offset-2"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '24px',
          }}
        >
          Details
        </span>
      </div>
    </button>
  );
}
