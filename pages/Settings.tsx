import React from 'react';
import { generateSampleData } from '../services/db';
import { ThemeName } from '../types';
import { Moon, Sun, Monitor, RefreshCw, Palette } from 'lucide-react';

interface SettingsProps {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentTheme, setTheme, isDark, toggleDarkMode }) => {
  
  const handleGenerateData = async () => {
    if (confirm("This will generate 10 random records. Continue?")) {
      await generateSampleData();
      alert("Data generated successfully! Check Records page.");
      window.location.reload(); // Simple reload to refresh all states
    }
  };

  const themes: { id: ThemeName; name: string; color: string }[] = [
    { id: 'default', name: 'Blue (Default)', color: 'bg-blue-500' },
    { id: 'purple', name: 'Royal Purple', color: 'bg-purple-600' },
    { id: 'emerald', name: 'Emerald Green', color: 'bg-emerald-500' },
    { id: 'rose', name: 'Rose Red', color: 'bg-rose-500' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
          <Palette className="text-primary" />
          Appearance
        </h2>

        {/* Mode Toggle */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Mode</h3>
          <div className="flex gap-4">
            <button
              onClick={toggleDarkMode}
              className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all
                ${!isDark 
                  ? 'border-primary bg-blue-50 dark:bg-transparent text-primary' 
                  : 'border-gray-200 dark:border-gray-700 text-gray-500'
                }`}
            >
              <Sun size={24} />
              <span className="font-medium">Light</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all
                ${isDark 
                  ? 'border-primary bg-gray-800 text-primary' 
                  : 'border-gray-200 text-gray-500'
                }`}
            >
              <Moon size={24} />
              <span className="font-medium">Dark</span>
            </button>
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Accent Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`
                  p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all
                  ${currentTheme === t.id 
                    ? `border-${t.color.replace('bg-', '')} bg-gray-50 dark:bg-gray-900 ring-2 ring-offset-2 ring-${t.color.replace('bg-', '')}` 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className={`w-8 h-8 rounded-full ${t.color}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
          <Monitor className="text-primary" />
          System Tools
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Sample Data Seeder</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Populate the database with dummy records for testing.</p>
          </div>
          <button
            onClick={handleGenerateData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={18} />
            Generate Data
          </button>
        </div>
      </div>
    </div>
  );
};