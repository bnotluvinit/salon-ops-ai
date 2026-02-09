import { useState } from 'react';
import { CostsForm } from './features/costs/CostsForm';
import { ForecastDashboard } from './features/forecast/ForecastDashboard';
import { ProjectCostsPage } from './features/project-costs/ProjectCostsPage';

type PageType = 'forecast' | 'costs' | 'project-costs';

function App() {
  const [activePage, setActivePage] = useState<PageType>('forecast');

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Salon Ops <span className="font-light text-slate-400">AI</span>
            </h1>
            <div className="text-xs text-slate-500 font-mono">v1.0</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800/60 inline-flex shadow-lg shadow-black/20">
            <button
              onClick={() => setActivePage('forecast')}
              className={`${activePage === 'forecast'
                ? 'bg-slate-800 text-indigo-400 shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200'
                } px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`}
            >
              Sales Projections
            </button>
            <button
              onClick={() => setActivePage('costs')}
              className={`${activePage === 'costs'
                ? 'bg-slate-800 text-indigo-400 shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200'
                } px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`}
            >
              Fixed Costs
            </button>
            <button
              onClick={() => setActivePage('project-costs')}
              className={`${activePage === 'project-costs'
                ? 'bg-slate-800 text-indigo-400 shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200'
                } px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`}
            >
              Project Costs
            </button>
          </div>
        </div>

        {/* Content Area with Animation Wrapper */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activePage === 'forecast' && <ForecastDashboard />}
          {activePage === 'costs' && (
            <div className="max-w-3xl mx-auto">
              <CostsForm />
            </div>
          )}
          {activePage === 'project-costs' && <ProjectCostsPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
