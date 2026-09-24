import React from 'react';
import type { AppView, AnalyzeResponse, ExperimentConfig, ExperimentPhase } from './types';
import { LandingPage } from './pages/LandingPage';
import { ExperimentPage } from './pages/ExperimentPage';
import { ResultsPage } from './pages/ResultsPage';
import { Navbar } from './components/Navbar';

export default function App() {
  const [view, setView] = React.useState<AppView>('landing');
  const [results, setResults] = React.useState<AnalyzeResponse | null>(null);
  const [config, setConfig] = React.useState<ExperimentConfig | null>(null);
  const [phase, setPhase] = React.useState<ExperimentPhase>('idle');
  const [error, setError] = React.useState<string | null>(null);

  function handleStartExperiment() {
    setView('experiment');
    setResults(null);
    setError(null);
    setPhase('idle');
  }

  function handleResultsReady(data: AnalyzeResponse, cfg: ExperimentConfig) {
    setResults(data);
    setConfig(cfg);
    setView('results');
  }

  function handleNewExperiment() {
    setView('experiment');
    setResults(null);
    setError(null);
    setPhase('idle');
  }

  function handleGoHome() {
    setView('landing');
    setResults(null);
    setError(null);
    setPhase('idle');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        view={view}
        onGoHome={handleGoHome}
        onNewExperiment={view === 'results' ? handleNewExperiment : undefined}
      />
      <main style={{ flex: 1 }}>
        {view === 'landing' && (
          <LandingPage onStart={handleStartExperiment} />
        )}
        {view === 'experiment' && (
          <ExperimentPage
            phase={phase}
            setPhase={setPhase}
            error={error}
            setError={setError}
            onResults={handleResultsReady}
          />
        )}
        {view === 'results' && results && config && (
          <ResultsPage
            data={results}
            config={config}
            onNewExperiment={handleNewExperiment}
          />
        )}
      </main>
    </div>
  );
}
