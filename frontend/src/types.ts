// API response types based on backend contract

export type Task = 'classification' | 'regression';

export type ClassificationObjective = 'f1' | 'accuracy';
export type RegressionObjective = 'r2' | 'mae';
export type Objective = ClassificationObjective | RegressionObjective;

export interface ExperimentConfig {
  file: File;
  task: Task;
  target: string;
  objective: Objective;
}

// Profile response
export interface ColumnDetail {
  dtype: string;
  missing: number;
  unique: number;
}

export interface Profile {
  rows: number;
  columns: number;
  column_names: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  missing_values: number;
  duplicate_rows: number;
  column_details: Record<string, ColumnDetail>;
}

// Feature analysis
export interface FeatureInfo {
  dtype: string;
  unique: number;
  unique_ratio: number;
  missing: number;
  missing_ratio: number;
  role: string;
  action: 'keep' | 'exclude' | 'review';
  reason: string;
}

// Classification metrics
export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

// Regression metrics
export interface RegressionMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
}

export type Metrics = ClassificationMetrics | RegressionMetrics;

// Model evaluation result
export interface EvaluatedModel {
  model: string;
  metrics: Metrics;
  training_time: number;
}

// Optimization result
export interface OptimizationResult {
  baseline_model: string;
  baseline_metrics: Metrics;
  best_parameters: Record<string, unknown> | null;
  cv_score: number | null;
  trials: number | null;
  optimized_metrics: Metrics | null;
}

// Validation result
export interface ValidationResult {
  task: string;
  target: string;
  target_dtype: string;
  unique_classes?: number;
}

// Best model
export interface BestModel {
  name: string;
  metrics: Metrics;
  training_time: number;
}

// Experiment results
export interface ExperimentResults {
  validation: ValidationResult;
  feature_analysis: Record<string, FeatureInfo>;
  excluded_features: string[];
  models: EvaluatedModel[];
  best_model: BestModel;
  optimization: OptimizationResult | null;
}

// Full API response
export interface AnalyzeResponse {
  filename: string;
  task: Task;
  target: string;
  objective: Objective;
  profile: Profile;
  results: ExperimentResults;
}

// App state
export type AppView = 'landing' | 'experiment' | 'results';

export type ExperimentPhase =
  | 'idle'
  | 'uploading'
  | 'validating'
  | 'feature_analysis'
  | 'preprocessing'
  | 'model_discovery'
  | 'optimization'
  | 'recommendation'
  | 'done'
  | 'error';
