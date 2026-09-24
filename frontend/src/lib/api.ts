import axios from 'axios';
import type { AnalyzeResponse, ExperimentConfig } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function runExperiment(config: ExperimentConfig): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append('file', config.file);
  form.append('task', config.task);
  form.append('target', config.target);
  form.append('objective', config.objective);

  const response = await axios.post<AnalyzeResponse>(
    `${BASE_URL}/api/experiments/analyze`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data;
}
