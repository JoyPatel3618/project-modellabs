import React from 'react';
import { Search, Sliders, Cpu, ArrowRight, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero */}
      <section
        style={{
          minHeight: 'calc(100vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            maxWidth: '720px',
            width: '100%',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo.png"
              alt="ModelLabs"
              style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '100px',
              border: '1px solid rgba(3, 148, 137, 0.25)',
              background: 'rgba(3, 148, 137, 0.06)',
              marginBottom: '28px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.05em' }}>
              AUTOMATED MODEL DISCOVERY
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(40px, 6vw, 68px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
              color: 'var(--color-text)',
            }}
          >
            MODEL
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #039489 0%, #0d7977 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              LABS
            </span>
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}
          >
            Automated Model &amp; Architecture Discovery
          </p>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-faint)',
              marginBottom: '48px',
              lineHeight: 1.7,
              maxWidth: '480px',
              margin: '0 auto 48px',
            }}
          >
            Stop guessing which model to use.
            <br />
            Let ModelLabs search, optimize, and evaluate it.
          </p>

          {/* CTA */}
          <button
            onClick={onStart}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '10px',
              background: 'var(--color-accent)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 16px rgba(3, 148, 137, 0.25)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'var(--color-accent-hover)';
              el.style.transform = 'translateY(-1px)';
              el.style.boxShadow = '0 6px 24px rgba(3, 148, 137, 0.35)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'var(--color-accent)';
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = '0 4px 16px rgba(3, 148, 137, 0.25)';
            }}
          >
            Start an Experiment
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section
        style={{
          padding: '80px 24px 120px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          <FeatureCard
            icon={<Search size={20} style={{ color: 'var(--color-accent)' }} />}
            label="MODEL DISCOVERY"
            title="Automated Model Evaluation"
            description="ModelLabs evaluates all candidate models against your dataset — automatically benchmarked and ranked."
            available
          />
          <FeatureCard
            icon={<Sliders size={20} style={{ color: 'var(--color-accent)' }} />}
            label="HYPERPARAMETER OPTIMIZATION"
            title="Optuna-Powered HPO"
            description="The best baseline is automatically tuned using Optuna. Only accepted if it beats the baseline."
            available
          />
          <FeatureCard
            icon={<Cpu size={20} style={{ color: 'var(--color-text-faint)' }} />}
            label="NEURAL ARCHITECTURE SEARCH"
            title="NAS"
            description="Automated discovery of neural network architectures. Deeper intelligence for deep learning."
            available={false}
          />
        </div>

        {/* Pipeline visual */}
        <PipelineVisual />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  label,
  title,
  description,
  available,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  available: boolean;
}) {
  return (
    <div
      style={{
        padding: '28px',
        borderRadius: '12px',
        border: `1px solid ${available ? 'var(--color-border)' : 'var(--color-border-subtle)'}`,
        background: available ? 'var(--color-surface)' : 'var(--color-surface-2)',
        opacity: available ? 1 : 0.7,
        position: 'relative',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        boxShadow: available ? '0 1px 3px rgba(3, 31, 53, 0.04), 0 4px 12px rgba(3, 31, 53, 0.02)' : 'none',
      }}
      onMouseEnter={e => {
        if (available) {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(3, 148, 137, 0.4)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(3, 31, 53, 0.08)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = available ? 'var(--color-border)' : 'var(--color-border-subtle)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = available ? '0 1px 3px rgba(3, 31, 53, 0.04), 0 4px 12px rgba(3, 31, 53, 0.02)' : 'none';
      }}
    >
      {!available && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '3px 10px',
            borderRadius: '100px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            fontSize: '10px',
            color: 'var(--color-text-faint)',
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          COMING SOON
        </div>
      )}
      <div style={{ marginBottom: '16px' }}>{icon}</div>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: available ? 'var(--color-accent)' : 'var(--color-text-faint)',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

function PipelineVisual() {
  const steps = [
    'Dataset',
    'Validation',
    'Feature Analysis',
    'Preprocessing',
    'Model Selection',
    'HPO',
    'Recommendation',
  ];

  return (
    <div style={{ marginTop: '80px', textAlign: 'center' }}>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--color-text-faint)',
          marginBottom: '24px',
        }}
      >
        PIPELINE
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '4px',
        }}
      >
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              {step}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} style={{ color: 'var(--color-text-faint)', flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
