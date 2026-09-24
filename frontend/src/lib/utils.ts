import type { Metrics, ClassificationMetrics, RegressionMetrics } from '../types';

export function isClassificationMetrics(m: Metrics): m is ClassificationMetrics {
  return 'accuracy' in m && 'f1' in m;
}

export function isRegressionMetrics(m: Metrics): m is RegressionMetrics {
  return 'mae' in m && 'r2' in m;
}

export function formatMetricValue(value: number): string {
  return (value * 100).toFixed(2) + '%';
}

export function formatScore(value: number, isPercent = true): string {
  if (isPercent) return (value * 100).toFixed(2) + '%';
  return value.toFixed(4);
}

export function formatNumber(value: number): string {
  if (Math.abs(value) < 0.001) return value.toExponential(3);
  return value.toFixed(4);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function humanizeModelName(key: string): string {
  const map: Record<string, string> = {
    logistic_regression: 'Logistic Regression',
    random_forest: 'Random Forest',
    gradient_boosting: 'Gradient Boosting',
    knn: 'K-Nearest Neighbors',
    linear_regression: 'Linear Regression',
    ridge: 'Ridge Regression',
    random_forest_regressor: 'Random Forest',
    gradient_boosting_regressor: 'Gradient Boosting',
  };
  return map[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getPrimaryMetricLabel(objective: string): string {
  const map: Record<string, string> = {
    f1: 'F1 Score',
    accuracy: 'Accuracy',
    r2: 'R²',
    mae: 'MAE',
  };
  return map[objective] ?? objective.toUpperCase();
}

export function getPrimaryMetricValue(metrics: Metrics, objective: string): number {
  if (objective === 'f1' && isClassificationMetrics(metrics)) return metrics.f1;
  if (objective === 'accuracy' && isClassificationMetrics(metrics)) return metrics.accuracy;
  if (objective === 'r2' && isRegressionMetrics(metrics)) return metrics.r2;
  if (objective === 'mae' && isRegressionMetrics(metrics)) return metrics.mae;
  return 0;
}

export function isLowerBetter(objective: string): boolean {
  return objective === 'mae' || objective === 'mse' || objective === 'rmse';
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    feature: 'text-[var(--color-success)]',
    identifier: 'text-[var(--color-error)]',
    high_missing: 'text-[var(--color-error)]',
    high_cardinality: 'text-[var(--color-warning)]',
    constant: 'text-[var(--color-error)]',
    missing_values: 'text-[var(--color-warning)]',
  };
  return map[role] ?? 'text-[var(--color-text-muted)]';
}

export function getRoleBadge(action: string): string {
  if (action === 'keep') return 'bg-[var(--color-success-dim)] text-[var(--color-success)] border border-[var(--color-success)]/20';
  if (action === 'exclude') return 'bg-[var(--color-error-dim)] text-[var(--color-error)] border border-[var(--color-error)]/20';
  if (action === 'review') return 'bg-[var(--color-warning-dim)] text-[var(--color-warning)] border border-[var(--color-warning)]/20';
  return 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]';
}
