import React, { useCallback, useRef, useState } from 'react';
import type { AnalyzeResponse, ExperimentConfig, ExperimentPhase, Task, Objective } from '../types';
import { runExperiment } from '../lib/api';
import { formatBytes } from '../lib/utils';
import { Upload, X, FileText, CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface ExperimentPageProps {
  phase: ExperimentPhase;
  setPhase: (p: ExperimentPhase) => void;
  error: string | null;
  setError: (e: string | null) => void;
  onResults: (data: AnalyzeResponse, config: ExperimentConfig) => void;
}

// Pipeline steps
const PIPELINE_STEPS: { key: ExperimentPhase; label: string }[] = [
  { key: 'validating', label: 'Dataset validation' },
  { key: 'feature_analysis', label: 'Feature analysis' },
  { key: 'preprocessing', label: 'Preprocessing' },
  { key: 'model_discovery', label: 'Model discovery' },
  { key: 'optimization', label: 'Hyperparameter optimization' },
  { key: 'recommendation', label: 'Final recommendation' },
];

const PHASE_ORDER: ExperimentPhase[] = [
  'validating',
  'feature_analysis',
  'preprocessing',
  'model_discovery',
  'optimization',
  'recommendation',
  'done',
];

function getStepStatus(stepKey: ExperimentPhase, currentPhase: ExperimentPhase): 'done' | 'active' | 'pending' {
  const stepIdx = PHASE_ORDER.indexOf(stepKey);
  const currentIdx = PHASE_ORDER.indexOf(currentPhase);
  if (currentIdx === -1) return 'pending';
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export function ExperimentPage({ phase, setPhase, error, setError, onResults }: ExperimentPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [task, setTask] = useState<Task>('classification');
  const [target, setTarget] = useState('');
  const [objective, setObjective] = useState<Objective>('f1');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRunning = phase !== 'idle' && phase !== 'done' && phase !== 'error';

  // Sync objective when task changes
  React.useEffect(() => {
    if (task === 'classification') setObjective('f1');
    else setObjective('r2');
  }, [task]);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    setError(null);
    setFile(f);
  }, [setError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError('Please upload a CSV file.'); return; }
    if (!target.trim()) { setError('Please enter the target column name.'); return; }

    const config: ExperimentConfig = { file, task, target: target.trim(), objective };
    setError(null);

    // Animate through phases while the single API request runs
    setPhase('validating');
    const phaseTimer = simulatePhases(setPhase);

    try {
      const data = await runExperiment(config);
      clearTimeout(phaseTimer.validating);
      clearTimeout(phaseTimer.feature);
      clearTimeout(phaseTimer.preprocessing);
      clearTimeout(phaseTimer.discovery);
      clearTimeout(phaseTimer.optimization);
      clearTimeout(phaseTimer.recommendation);
      setPhase('done');
      onResults(data, config);
    } catch (err) {
      clearTimeout(phaseTimer.validating);
      clearTimeout(phaseTimer.feature);
      clearTimeout(phaseTimer.preprocessing);
      clearTimeout(phaseTimer.discovery);
      clearTimeout(phaseTimer.optimization);
      clearTimeout(phaseTimer.recommendation);
      setPhase('error');
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'Experiment failed. Check your configuration and try again.');
      } else {
        setError('Could not connect to the ModelLabs backend. Make sure it is running on port 8000.');
      }
    }
  }

  // Simulate pipeline phase transitions with rough timing
  // (real progress comes from backend completion, not percentages)
  function simulatePhases(sp: (p: ExperimentPhase) => void) {
    const t1 = setTimeout(() => sp('feature_analysis'), 1500);
    const t2 = setTimeout(() => sp('preprocessing'), 3000);
    const t3 = setTimeout(() => sp('model_discovery'), 4500);
    const t4 = setTimeout(() => sp('optimization'), 8000);
    const t5 = setTimeout(() => sp('recommendation'), 15000);
    const t6 = 0;
    return { validating: t1, feature: t2, preprocessing: t3, discovery: t4, optimization: t5, recommendation: t6 };
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-accent)', marginBottom: '8px' }}>
          EXPERIMENT WORKSPACE
        </p>
        <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', margin: 0 }}>
          Run an Experiment
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          Upload your dataset and configure the experiment. ModelLabs will do the rest.
        </p>
      </div>

      {/* Running state */}
      {isRunning && (
        <div
          style={{
            marginBottom: '40px',
            padding: '28px',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Loader2 size={16} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
              Running ModelLabs Pipeline
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PIPELINE_STEPS.map(step => {
              const status = getStepStatus(step.key, phase);
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {status === 'done' && <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />}
                  {status === 'active' && <Loader2 size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, animation: 'spin 1s linear infinite' }} />}
                  {status === 'pending' && <Circle size={16} style={{ color: 'var(--color-text-faint)', flexShrink: 0 }} />}
                  <span
                    style={{
                      fontSize: '13px',
                      color: status === 'done'
                        ? 'var(--color-success)'
                        : status === 'active'
                        ? 'var(--color-text)'
                        : 'var(--color-text-faint)',
                      fontWeight: status === 'active' ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: '24px',
            padding: '14px 16px',
            borderRadius: '10px',
            background: 'var(--color-error-dim)',
            border: '1px solid rgba(248,113,113,0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <AlertCircle size={15} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-error)', margin: 0, lineHeight: 1.5 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Dataset */}
        <div style={{ marginBottom: '40px' }}>
          <StepLabel number="01" label="Dataset" />

          {/* Drop zone */}
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '12px',
                padding: '48px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <Upload size={28} style={{ color: 'var(--color-text-faint)', marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: 500, margin: '0 0 4px' }}>
                Drop your CSV file here
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 16px' }}>
                or click to browse
              </p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: '7px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                }}
              >
                Browse files
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          ) : (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'fadeIn 0.25s ease-out',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--color-accent-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={16} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setFile(null); setError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-faint)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-faint)'; }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Configuration */}
        <div style={{ marginBottom: '48px' }}>
          <StepLabel number="02" label="Configuration" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Task */}
            <div>
              <label style={labelStyle}>Task</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['classification', 'regression'] as Task[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTask(t)}
                    disabled={isRunning}
                    style={{
                      flex: 1,
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${task === t ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: task === t ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                      color: task === t ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontSize: '13px',
                      fontWeight: task === t ? 600 : 400,
                      cursor: isRunning ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Objective */}
            <div>
              <label style={labelStyle}>Objective</label>
              <select
                value={objective}
                onChange={e => setObjective(e.target.value as Objective)}
                disabled={isRunning}
                style={selectStyle}
              >
                {task === 'classification' ? (
                  <>
                    <option value="f1">F1 Score (weighted)</option>
                    <option value="accuracy">Accuracy</option>
                  </>
                ) : (
                  <>
                    <option value="r2">R² Score</option>
                    <option value="mae">MAE (lower is better)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Target */}
          <div>
            <label style={labelStyle}>Target Column</label>
            <input
              type="text"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="e.g. species, price, survived"
              disabled={isRunning}
              style={{
                ...inputStyle,
                opacity: isRunning ? 0.5 : 1,
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '6px', margin: '6px 0 0' }}>
              The column you want ModelLabs to predict.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isRunning || !file}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '14px 24px',
            borderRadius: '10px',
            background: isRunning || !file ? 'var(--color-surface-2)' : 'var(--color-accent)',
            color: isRunning || !file ? 'var(--color-text-faint)' : '#ffffff',
            fontSize: '15px',
            fontWeight: 600,
            border: `1px solid ${isRunning || !file ? 'var(--color-border)' : 'transparent'}`,
            cursor: isRunning || !file ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            letterSpacing: '-0.01em',
            boxShadow: isRunning || !file ? 'none' : '0 4px 16px rgba(3, 148, 137, 0.25)',
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Running ModelLabs...
            </>
          ) : (
            'Run Experiment'
          )}
        </button>
      </form>
    </div>
  );
}

function StepLabel({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--color-accent)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        STEP {number}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  marginBottom: '8px',
  letterSpacing: '0.02em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
};
