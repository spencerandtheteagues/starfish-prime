import React, { useState } from 'react';
import Head from 'next/head';

interface GeneratedApp {
  id: string;
  name: string;
  description: string;
  framework: string;
  features: string[];
  preview: {
    id: string;
    url: string;
    status: string;
  };
  repository?: {
    url: string;
    clone_url: string;
  };
  deployment?: {
    url: string;
    platform: string;
  };
  ide_url: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('react');
  const [features, setFeatures] = useState<string[]>([]);
  const [deployment, setDeployment] = useState('render');
  const [loading, setLoading] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [error, setError] = useState('');

  const availableFeatures = [
    { id: 'authentication', label: 'User Authentication' },
    { id: 'database', label: 'Database Integration' },
    { id: 'api', label: 'REST API' },
    { id: 'realtime', label: 'Real-time Features' },
    { id: 'payments', label: 'Payment Processing' },
    { id: 'analytics', label: 'Analytics Tracking' },
    { id: 'file-upload', label: 'File Upload' },
    { id: 'email', label: 'Email Integration' },
    { id: 'search', label: 'Search Functionality' },
    { id: 'chat', label: 'Chat/Messaging' }
  ];

  const handleFeatureToggle = (featureId: string) => {
    setFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your app');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedApp(null);

    try {
      const response = await fetch('/api/generate/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          framework,
          features,
          deployment
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate app');
      }

      if (data.success) {
        setGeneratedApp(data.app);
      } else {
        setError(data.error || 'App generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Starfish Prime - AI App Builder</title>
        <meta name="description" content="Generate complete operational apps from a single prompt" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">
              ⭐ Starfish Prime
            </h1>
            <p className="text-xl text-blue-200 mb-8">
              AI-Powered Application Builder - Generate complete operational apps from a single prompt
            </p>
            <div className="flex justify-center space-x-4">
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                ✅ GitHub Integration
              </span>
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                ✅ Real-time IDE
              </span>
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                ✅ Auto Deploy
              </span>
            </div>
          </div>

          {/* Main Form */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="space-y-6">
              {/* App Description */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  🎯 Describe your app idea
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="e.g., Create a social media platform for pet owners with photo sharing, vet appointment booking, and community features..."
                />
              </div>

              {/* Framework Selection */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  🛠️ Choose Framework
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="react">React</option>
                  <option value="vue">Vue.js</option>
                  <option value="svelte">Svelte</option>
                  <option value="angular">Angular</option>
                </select>
              </div>

              {/* Features */}
              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  ⚡ Features to include
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableFeatures.map((feature) => (
                    <label key={feature.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features.includes(feature.id)}
                        onChange={() => handleFeatureToggle(feature.id)}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-white text-sm">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deployment Platform */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  🚀 Deployment Platform
                </label>
                <select
                  value={deployment}
                  onChange={(e) => setDeployment(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="render">Render</option>
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Generating App...</span>
                  </div>
                ) : (
                  '🚀 Generate App'
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300">❌ {error}</p>
              </div>
            )}

            {/* Generated App Result */}
            {generatedApp && (
              <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-green-300 mb-4">
                  🎉 App Generated Successfully!
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">📱 {generatedApp.name}</h4>
                    <p className="text-gray-300 text-sm mb-4">{generatedApp.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        <strong>Framework:</strong> {generatedApp.framework}
                      </p>
                      <p className="text-sm text-gray-300">
                        <strong>Features:</strong> {generatedApp.features.join(', ') || 'Basic'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a
                      href={generatedApp.ide_url}
                      className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                    >
                      🎨 Open in IDE
                    </a>
                    {generatedApp.preview.url && (
                      <a
                        href={generatedApp.preview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                      >
                        👁️ Preview App
                      </a>
                    )}
                    {generatedApp.repository && (
                      <a
                        href={generatedApp.repository.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-700 hover:bg-gray-600 text-white text-center py-2 px-4 rounded-lg transition-colors"
                      >
                        📂 View on GitHub
                      </a>
                    )}
                    {generatedApp.deployment && (
                      <a
                        href={generatedApp.deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                      >
                        🌐 Live Deployment
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}