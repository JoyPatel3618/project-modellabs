import type { AppView } from '../types';
import { FlaskConical, ArrowLeft, PlusCircle } from 'lucide-react';

interface NavbarProps {
  view: AppView;
  onGoHome: () => void;
  onNewExperiment?: () => void;
}

export function Navbar({ view, onGoHome, onNewExperiment }: NavbarProps) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <button
          onClick={onGoHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <img
            src="/logo.png"
            alt="ModelLabs"
            style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
          />
        </button>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {view === 'results' && onNewExperiment && (
            <button
              onClick={onNewExperiment}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              }}
            >
              <PlusCircle size={14} />
              New Experiment
            </button>
          )}
          {view === 'experiment' && (
            <button
              onClick={onGoHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'var(--color-accent-dim)',
              border: '1px solid rgba(3, 148, 137, 0.2)',
            }}
          >
            <FlaskConical size={12} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.05em' }}>
              BETA
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
