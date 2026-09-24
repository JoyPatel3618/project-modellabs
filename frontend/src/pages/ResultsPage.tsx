import React from 'react';
import type { AnalyzeResponse, ExperimentConfig, EvaluatedModel } from '../types';
import {
  humanizeModelName,
  getPrimaryMetricLabel,
  getPrimaryMetricValue,
  isClassificationMetrics,
  isRegressionMetrics,
  formatNumber,
  isLowerBetter,
} from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Trophy, TrendingUp, TrendingDown, Database, Layers, Cpu, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface ResultsPageProps {
  data: AnalyzeResponse;
  config: ExperimentConfig;
  onNewExperiment: () => void;
}

export function ResultsPage({ data, config, onNewExperiment }: ResultsPageProps) {
  const { profile, results } = data;
  const { task, objective } = config;
  const { feature_analysis, models, best_model, optimization } = results;

  const primaryMetricLabel = getPrimaryMetricLabel(objective);
  const lowerBetter = isLowerBetter(objective);

  // Sort models by primary metric
  const sortedModels = [...models].sort((a, b) => {
    const va = getPrimaryMetricValue(a.metrics, objective);
    const vb = getPrimaryMetricValue(b.metrics, objective);
    return lowerBetter ? va - vb : vb - va;
  });

  // Feature breakdown
  const included = Object.entries(feature_analysis).filter(([, v]) => v.action === 'keep');
  const excluded = Object.entries(feature_analysis).filter(([, v]) => v.action === 'exclude');
  const reviewed = Object.entries(feature_analysis).filter(([, v]) => v.action === 'review');

  // HPO outcome
  const hpoImproved =
    optimization &&
    optimization.optimized_metrics &&
    optimization.baseline_metrics &&
    (() => {
      const opt = getPrimaryMetricValue(optimization.optimized_metrics!, objective);
      const base = getPrimaryMetricValue(optimization.baseline_metrics, objective);
      return lowerBetter ? opt < base : opt > base;
    })();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 100px', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '48px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-accent)', margin: '0 0 8px' }}>
            EXPERIMENT RESULTS
          </p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', margin: 0 }}>
            {data.filename}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {task === 'classification' ? 'Classification' : 'Regression'} · Target: <code style={{ color: 'var(--color-accent)' }}>{data.target}</code> · Objective: {primaryMetricLabel}
          </p>
        </div>
        <button
          onClick={onNewExperiment}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '9px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
        >
          New Experiment
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Recommended model — top card */}
      <RecommendedModelCard
        bestModel={best_model}
        objective={objective}
        task={task}
        hpoImproved={hpoImproved ?? false}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Dataset summary */}
        <DatasetSummaryCard profile={profile} />
        {/* Feature analysis */}
        <FeatureAnalysisCard
          included={included}
          excluded={excluded}
          reviewed={reviewed}
        />
      </div>

      {/* Model comparison */}
      <ModelComparisonSection
        models={sortedModels}
        objective={objective}
        bestModelName={best_model.name}
        lowerBetter={lowerBetter}
        primaryMetricLabel={primaryMetricLabel}
      />

      {/* HPO */}
      {optimization && (
        <HPOSection
          optimization={optimization}
          objective={objective}
          hpoImproved={hpoImproved ?? false}
          lowerBetter={lowerBetter}
          primaryMetricLabel={primaryMetricLabel}
        />
      )}
    </div>
  );
}

// ─── Recommended Model ─────────────────────────────────────────────────────

function RecommendedModelCard({
  bestModel,
  objective,
  task,
  hpoImproved,
}: {
  bestModel: ResultsPageProps['data']['results']['best_model'];
  objective: string;
  task: string;
  hpoImproved: boolean;
}) {
  const primaryValue = getPrimaryMetricValue(bestModel.metrics, objective);
  const primaryLabel = getPrimaryMetricLabel(objective);

  const formattedPrimary = objective === 'mae' || objective === 'mse' || objective === 'rmse'
    ? formatNumber(primaryValue)
    : (primaryValue * 100).toFixed(2) + '%';

  return (
    <div
      style={{
        padding: '28px 32px',
        borderRadius: '14px',
        border: '1px solid rgba(3, 148, 137, 0.25)',
        background: 'linear-gradient(135deg, rgba(3, 148, 137, 0.05) 0%, var(--color-surface) 60%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(3, 31, 53, 0.05), 0 6px 18px rgba(3, 31, 53, 0.03)',
      }}
    >
      {/* Accent glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '250px',
          height: '180px',
          background: 'radial-gradient(ellipse at top right, rgba(3, 148, 137, 0.08), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', position: 'relative' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Trophy size={16} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-accent)' }}>
              RECOMMENDED MODEL
            </span>
          </div>
          <h3
            style={{
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
              margin: '0 0 8px',
            }}
          >
            {humanizeModelName(bestModel.name)}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Best {task} model for your dataset · trained in {bestModel.training_time.toFixed(2)}s
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {formattedPrimary}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{primaryLabel}</div>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
        {isClassificationMetrics(bestModel.metrics) && (
          <>
            <MetricPill label="Accuracy" value={(bestModel.metrics.accuracy * 100).toFixed(2) + '%'} />
            <MetricPill label="Precision" value={(bestModel.metrics.precision * 100).toFixed(2) + '%'} />
            <MetricPill label="Recall" value={(bestModel.metrics.recall * 100).toFixed(2) + '%'} />
            <MetricPill label="F1" value={(bestModel.metrics.f1 * 100).toFixed(2) + '%'} highlight={objective === 'f1'} />
          </>
        )}
        {isRegressionMetrics(bestModel.metrics) && (
          <>
            <MetricPill label="R²" value={formatNumber(bestModel.metrics.r2)} highlight={objective === 'r2'} />
            <MetricPill label="MAE" value={formatNumber(bestModel.metrics.mae)} highlight={objective === 'mae'} />
            <MetricPill label="RMSE" value={formatNumber(bestModel.metrics.rmse)} />
          </>
        )}
      </div>

      {hpoImproved && (
        <div
          style={{
            marginTop: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '7px',
            background: 'var(--color-success-dim)',
            border: '1px solid rgba(34,211,160,0.2)',
          }}
        >
          <TrendingUp size={12} style={{ color: 'var(--color-success)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 500 }}>
            Optimized model selected — HPO improved performance
          </span>
        </div>
      )}
    </div>
  );
}

function MetricPill({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        padding: '8px 14px',
        borderRadius: '8px',
        border: `1px solid ${highlight ? 'rgba(3, 148, 137, 0.3)' : 'var(--color-border)'}`,
        background: highlight ? 'var(--color-accent-dim)' : 'var(--color-surface-2)',
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', color: highlight ? 'var(--color-accent)' : 'var(--color-text-faint)', marginBottom: '2px' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: highlight ? 'var(--color-accent)' : 'var(--color-text)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
    </div>
  );
}

// ─── Dataset Summary ───────────────────────────────────────────────────────

function DatasetSummaryCard({ profile }: { profile: ResultsPageProps['data']['profile'] }) {
  return (
    <SectionCard
      icon={<Database size={14} style={{ color: 'var(--color-accent)' }} />}
      label="DATASET"
      title="Dataset Summary"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <StatBlock label="Rows" value={profile.rows.toLocaleString()} />
        <StatBlock label="Columns" value={profile.columns.toString()} />
        <StatBlock label="Missing Values" value={profile.missing_values.toLocaleString()} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <StatBlock label="Numeric Features" value={profile.numeric_columns.length.toString()} />
        <StatBlock label="Categorical Features" value={profile.categorical_columns.length.toString()} />
      </div>
      {profile.duplicate_rows > 0 && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: '7px',
            background: 'var(--color-warning-dim)',
            border: '1px solid rgba(245,158,11,0.2)',
            fontSize: '12px',
            color: 'var(--color-warning)',
          }}
        >
          ⚠ {profile.duplicate_rows} duplicate row{profile.duplicate_rows !== 1 ? 's' : ''} detected
        </div>
      )}
    </SectionCard>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
      <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-faint)', marginBottom: '4px' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
    </div>
  );
}

// ─── Feature Analysis ──────────────────────────────────────────────────────

function FeatureAnalysisCard({
  included,
  excluded,
  reviewed,
}: {
  included: [string, { action: string; role: string; reason: string; dtype: string }][];
  excluded: [string, { action: string; role: string; reason: string; dtype: string }][];
  reviewed: [string, { action: string; role: string; reason: string; dtype: string }][];
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <SectionCard
      icon={<Layers size={14} style={{ color: 'var(--color-accent)' }} />}
      label="FEATURES"
      title="Feature Analysis"
    >
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <FeaturePill count={included.length} label="Included" color="var(--color-success)" dimColor="var(--color-success-dim)" />
        {excluded.length > 0 && <FeaturePill count={excluded.length} label="Excluded" color="var(--color-error)" dimColor="var(--color-error-dim)" />}
        {reviewed.length > 0 && <FeaturePill count={reviewed.length} label="Review" color="var(--color-warning)" dimColor="var(--color-warning-dim)" />}
      </div>

      {/* Show flagged features */}
      {(excluded.length > 0 || reviewed.length > 0) && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              fontSize: '12px',
              padding: 0,
              marginBottom: '10px',
            }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide' : 'Show'} flagged features
          </button>
          {expanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', animation: 'fadeIn 0.2s ease-out' }}>
              {[...excluded, ...reviewed].slice(0, 8).map(([name, info]) => (
                <div
                  key={name}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '7px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      flexShrink: 0,
                      ...parseBadgeStyle(info.action),
                    }}
                  >
                    {info.action.toUpperCase()}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <code style={{ fontSize: '12px', color: 'var(--color-text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </code>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{info.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function parseBadgeStyle(action: string): React.CSSProperties {
  if (action === 'exclude') return { background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' };
  if (action === 'review') return { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' };
  return { background: 'rgba(34,211,160,0.12)', color: '#22d3a0', border: '1px solid rgba(34,211,160,0.2)' };
}

function FeaturePill({ count, label, color, dimColor }: { count: number; label: string; color: string; dimColor: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '7px',
        background: dimColor,
        border: `1px solid ${color}33`,
      }}
    >
      <span style={{ fontSize: '14px', fontWeight: 700, color }}>{count}</span>
      <span style={{ fontSize: '12px', color, opacity: 0.8 }}>{label}</span>
    </div>
  );
}

// ─── Model Comparison ──────────────────────────────────────────────────────

function ModelComparisonSection({
  models,
  objective,
  bestModelName,
  lowerBetter,
  primaryMetricLabel,
}: {
  models: EvaluatedModel[];
  objective: string;
  bestModelName: string;
  lowerBetter: boolean;
  primaryMetricLabel: string;
}) {
  const chartData = models.map(m => ({
    name: humanizeModelName(m.model),
    value: getPrimaryMetricValue(m.metrics, objective),
    isBest: m.model === bestModelName,
  }));

  return (
    <div style={{ marginTop: '20px' }}>
      <SectionCard
        icon={<Cpu size={14} style={{ color: 'var(--color-accent)' }} />}
        label="MODEL DISCOVERY"
        title="Model Comparison"
      >
        {/* Chart */}
        <div style={{ height: '200px', marginBottom: '24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis
                type="number"
                domain={lowerBetter ? [0, 'auto'] : [0, 1]}
                tickFormatter={v => objective === 'mae' || objective === 'mse' || objective === 'rmse' ? formatNumber(v) : (v * 100).toFixed(0) + '%'}
                tick={{ fill: 'var(--color-text-faint)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--color-text)',
                }}
                formatter={(v) => {
                  const num = typeof v === 'number' ? v : 0;
                  return [
                    objective === 'mae' || objective === 'mse' || objective === 'rmse'
                      ? formatNumber(num)
                      : (num * 100).toFixed(2) + '%',
                    primaryMetricLabel,
                  ];
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isBest ? 'var(--color-accent)' : 'rgba(3, 148, 137, 0.25)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Rank</th>
                <th style={thStyle}>Model</th>
                {models[0] && isClassificationMetrics(models[0].metrics) && (
                  <>
                    <th style={thStyle}>Accuracy</th>
                    <th style={thStyle}>Precision</th>
                    <th style={thStyle}>Recall</th>
                    <th style={{ ...thStyle, color: 'var(--color-accent)' }}>F1</th>
                  </>
                )}
                {models[0] && isRegressionMetrics(models[0].metrics) && (
                  <>
                    <th style={thStyle}>R²</th>
                    <th style={thStyle}>MAE</th>
                    <th style={thStyle}>RMSE</th>
                  </>
                )}
                <th style={thStyle}>Train Time</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => {
                const isBest = m.model === bestModelName;
                return (
                  <tr
                    key={m.model}
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      background: isBest ? 'rgba(3, 148, 137, 0.04)' : 'transparent',
                    }}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, color: i === 0 ? 'var(--color-accent)' : 'var(--color-text-faint)' }}>
                        #{i + 1}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: isBest ? 700 : 400, color: isBest ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {humanizeModelName(m.model)}
                      {isBest && (
                        <span
                          style={{
                            marginLeft: '8px',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: 'var(--color-accent-dim)',
                            color: 'var(--color-accent)',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}
                        >
                          BEST
                        </span>
                      )}
                    </td>
                    {isClassificationMetrics(m.metrics) && (
                      <>
                        <td style={tdStyle}>{(m.metrics.accuracy * 100).toFixed(2)}%</td>
                        <td style={tdStyle}>{(m.metrics.precision * 100).toFixed(2)}%</td>
                        <td style={tdStyle}>{(m.metrics.recall * 100).toFixed(2)}%</td>
                        <td style={{ ...tdStyle, color: 'var(--color-accent)', fontWeight: 600 }}>{(m.metrics.f1 * 100).toFixed(2)}%</td>
                      </>
                    )}
                    {isRegressionMetrics(m.metrics) && (
                      <>
                        <td style={{ ...tdStyle, color: objective === 'r2' ? 'var(--color-accent)' : undefined, fontWeight: objective === 'r2' ? 600 : 400 }}>{formatNumber(m.metrics.r2)}</td>
                        <td style={{ ...tdStyle, color: objective === 'mae' ? 'var(--color-accent)' : undefined, fontWeight: objective === 'mae' ? 600 : 400 }}>{formatNumber(m.metrics.mae)}</td>
                        <td style={tdStyle}>{formatNumber(m.metrics.rmse)}</td>
                      </>
                    )}
                    <td style={{ ...tdStyle, color: 'var(--color-text-faint)' }}>{m.training_time.toFixed(2)}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'var(--color-text-faint)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '11px 12px',
  color: 'var(--color-text-muted)',
  whiteSpace: 'nowrap',
};

// ─── HPO Section ──────────────────────────────────────────────────────────

function HPOSection({
  optimization,
  objective,
  hpoImproved,
  lowerBetter,
  primaryMetricLabel,
}: {
  optimization: NonNullable<ResultsPageProps['data']['results']['optimization']>;
  objective: string;
  hpoImproved: boolean;
  lowerBetter: boolean;
  primaryMetricLabel: string;
}) {
  const baselineVal = getPrimaryMetricValue(optimization.baseline_metrics, objective);
  const optimizedVal = optimization.optimized_metrics
    ? getPrimaryMetricValue(optimization.optimized_metrics, objective)
    : null;

  const formatVal = (v: number) =>
    objective === 'mae' || objective === 'mse' || objective === 'rmse'
      ? formatNumber(v)
      : (v * 100).toFixed(2) + '%';

  const delta = optimizedVal !== null ? optimizedVal - baselineVal : null;
  const deltaSign = delta !== null ? (lowerBetter ? (delta < 0 ? 'improved' : 'worse') : (delta > 0 ? 'improved' : 'worse')) : null;


  return (
    <div style={{ marginTop: '20px' }}>
      <SectionCard
        icon={<TrendingUp size={14} style={{ color: 'var(--color-accent)' }} />}
        label="HYPERPARAMETER OPTIMIZATION"
        title="HPO Results"
      >
        {/* Outcome banner */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: hpoImproved ? 'var(--color-success-dim)' : 'var(--color-surface-2)',
            border: `1px solid ${hpoImproved ? 'rgba(34,211,160,0.2)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {hpoImproved ? (
            <TrendingUp size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          ) : (
            <TrendingDown size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          )}
          <p style={{ fontSize: '13px', fontWeight: 500, color: hpoImproved ? 'var(--color-success)' : 'var(--color-text-muted)', margin: 0 }}>
            {hpoImproved
              ? 'Optimized model selected — optimization improved performance.'
              : 'Baseline model retained — optimization did not improve performance.'}
          </p>
        </div>

        {/* Score comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <ScoreCard
            label="Baseline Score"
            value={formatVal(baselineVal)}
            metric={primaryMetricLabel}
          />
          {optimizedVal !== null && (
            <ScoreCard
              label="Optimized Score"
              value={formatVal(optimizedVal)}
              metric={primaryMetricLabel}
              highlight={hpoImproved}
            />
          )}
          {optimization.cv_score !== null && optimization.cv_score !== undefined && (
            <ScoreCard
              label="CV Score (HPO)"
              value={formatVal(optimization.cv_score)}
              metric="5-fold weighted F1"
            />
          )}
        </div>

        {/* Delta */}
        {delta !== null && (
          <div
            style={{
              marginBottom: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '7px',
              background: deltaSign === 'improved' ? 'var(--color-success-dim)' : 'var(--color-error-dim)',
              border: `1px solid ${deltaSign === 'improved' ? 'rgba(34,211,160,0.2)' : 'rgba(248,113,113,0.2)'}`,
              fontSize: '12px',
              color: deltaSign === 'improved' ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {deltaSign === 'improved' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta > 0 ? '+' : ''}{formatVal(Math.abs(delta))} delta
          </div>
        )}

        {/* Trials */}
        {optimization.trials && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-faint)', marginBottom: '16px', margin: '0 0 16px' }}>
            {optimization.trials} Optuna trials completed · StratifiedKFold (5-fold)
          </p>
        )}

        {/* Best parameters */}
        {optimization.best_parameters && Object.keys(optimization.best_parameters).length > 0 && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-faint)', marginBottom: '10px' }}>
              BEST HYPERPARAMETERS
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '8px',
              }}
            >
              {Object.entries(optimization.best_parameters).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-faint)', marginBottom: '4px' }}>
                    {key.toUpperCase().replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                    {typeof val === 'number' ? (Number.isInteger(val) ? val : (val as number).toFixed(4)) : String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function ScoreCard({ label, value, metric, highlight = false }: { label: string; value: string; metric: string; highlight?: boolean }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '10px',
        border: `1px solid ${highlight ? 'rgba(3, 148, 137, 0.3)' : 'var(--color-border)'}`,
        background: highlight ? 'var(--color-accent-dim)' : 'var(--color-surface-2)',
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', color: highlight ? 'var(--color-accent)' : 'var(--color-text-faint)', marginBottom: '6px' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: highlight ? 'var(--color-accent)' : 'var(--color-text)', letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '2px' }}>{metric}</div>
    </div>
  );
}

// ─── Reusable section card ─────────────────────────────────────────────────

function SectionCard({
  icon,
  label,
  title,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        boxShadow: '0 1px 3px rgba(3, 31, 53, 0.04), 0 4px 12px rgba(3, 31, 53, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {icon}
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-faint)' }}>
          {label}
        </span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
