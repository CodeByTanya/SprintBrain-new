import React from 'react';
import { Button } from '../components/ui';
import { ArrowRight, Sparkles, Zap, Trello, BarChart } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
            <Sparkles className="h-5 w-5" />
            SprintBrain
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onGetStarted}>Sign In</Button>
            <Button onClick={onGetStarted}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          Powered by Gemini 2.0 Flash
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight mb-8">
          Plan Sprints <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Intelligently</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Stop struggling with spreadsheets. Let AI analyze your backlog, estimate points, detect risks, and build the perfect sprint plan in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto px-8">
            Start Planning Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
            View Demo
          </Button>
        </div>

        {/* Mock UI */}
        <div className="mt-20 relative rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-50 to-white opacity-50 pointer-events-none" />
          <img 
            src="https://picsum.photos/1200/600" 
            alt="App Dashboard" 
            className="w-full h-auto opacity-90"
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Trello className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Backlog Parsing</h3>
              <p className="text-gray-600">Paste your raw notes or tickets. Our AI structures them, adds missing story points, and tags dependencies automatically.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Sprint Generation</h3>
              <p className="text-gray-600">Set your velocity and team size. We generate a sequenced plan optimized for delivery, highlighting risks before they happen.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Jira Export</h3>
              <p className="text-gray-600">One-click export to CSV compatible with Jira. Move from planning to execution without manual data entry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2024 SprintBrain. Built with React & Tailwind.</p>
        </div>
      </footer>
    </div>
  );
};