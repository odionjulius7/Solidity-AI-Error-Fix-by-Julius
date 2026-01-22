
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSolidityCode } from './services/geminiService';
import { SolidityAnalysis } from './types';
import CodeBlock from './components/CodeBlock';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { SimpleStorage } from "./SimpleStorage";

// Inheritance - just like class in Js extending another parent class 
contract AddFiveToStorage is SimpleStorage {
    function sayHello() public pure returns(string memory) {
        return "Hello";
    }
}`);
  const [errorMsg, setErrorMsg] = useState<string>("Error: not found contracts/SimpleStorage");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<SolidityAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeployGuide, setShowDeployGuide] = useState<boolean>(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleFix = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      // Check if API key is available before making the call
      if (!process.env.API_KEY) {
        throw new Error("Missing API Key. Ensure API_KEY is set in your environment variables. If you just added it to Vercel, you may need to redeploy your project for it to take effect.");
      }
      
      const result = await analyzeSolidityCode(code, errorMsg);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (analysis && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [analysis]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <i className="fas fa-microchip text-indigo-400 text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Solidity<span className="text-indigo-500">Fix</span> AI
              </h1>
              <p className="text-slate-500 text-sm font-medium">Smart Contract Debugger v1.0</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowDeployGuide(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all text-sm font-semibold"
          >
            <i className="fas fa-circle-question"></i>
            Troubleshoot
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="fas fa-code text-indigo-400"></i>
                  <h2 className="text-xl font-bold">Solidity Code</h2>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 bg-slate-950/50 text-emerald-400 font-mono p-4 rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                placeholder="Paste your Solidity contract here..."
              />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-bug text-rose-400"></i>
                <h2 className="text-xl font-bold">Error Message</h2>
              </div>
              <textarea
                value={errorMsg}
                onChange={(e) => setErrorMsg(e.target.value)}
                className="w-full h-32 bg-slate-950/50 text-rose-300 font-mono p-4 rounded-xl border border-slate-800 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                placeholder="Paste the compiler error here..."
              />
            </div>

            <button
              onClick={handleFix}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                isAnalyzing 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-[0.98]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                  Analyzing Contract...
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles"></i>
                  Fix This Error
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {!analysis && !error && !isAnalyzing && (
              <div className="h-full border-2 border-dashed border-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-600 p-12 text-center group">
                <div className="p-6 rounded-full bg-slate-900/30 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <i className="fas fa-shield-halved text-6xl opacity-20"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-400">Ready for Analysis</h3>
                <p className="max-w-xs text-slate-500">Upload your code and let Gemini identify the root cause of your smart contract issues.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-slate-900 rounded-xl w-3/4"></div>
                <div className="h-32 bg-slate-900 rounded-xl"></div>
                <div className="h-64 bg-slate-900 rounded-xl"></div>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-rose-300 flex items-start gap-4 animate-in slide-in-from-top-4 duration-300">
                <i className="fas fa-triangle-exclamation text-xl mt-1"></i>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Configuration Required</h3>
                  <p className="mb-4">{error}</p>
                </div>
              </div>
            )}

            {analysis && (
              <div ref={resultRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl ring-1 ring-indigo-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <h2 className="text-xl font-bold text-white">Analysis & Fix</h2>
                  </div>
                  <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                      {analysis.explanation}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Corrected Main Contract</h3>
                    </div>
                    <CodeBlock code={analysis.suggestedFix} />
                  </div>
                  
                  {analysis.missingFiles && analysis.missingFiles.length > 0 && (
                    <div className="mt-10 border-t border-slate-800 pt-8">
                      <div className="flex items-center gap-2 mb-4">
                        <i className="fas fa-folder-tree text-emerald-400"></i>
                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Required Dependencies</h3>
                      </div>
                      <div className="space-y-6">
                        {analysis.missingFiles.map((file, idx) => (
                          <div key={idx} className="space-y-2">
                            <CodeBlock code={file.content} filename={file.filename} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Modal */}
        {showDeployGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-white/10">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-extrabold text-white">Troubleshooting Deployment</h2>
                  <button 
                    onClick={() => setShowDeployGuide(false)}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-400">
                      <i className="fas fa-key text-xl"></i>
                      <h3 className="text-lg font-bold">1. Why is the screen blank?</h3>
                    </div>
                    <p className="text-slate-400 ml-11">
                      If the screen is blank on Vercel, it's often because the project is missing a <code className="text-indigo-300 bg-slate-800 px-2 py-1 rounded">package.json</code> file or the browser cannot parse <code className="text-indigo-300 bg-slate-800 px-2 py-1 rounded">.tsx</code> files directly. In a production environment, you typically need a build step (like Vite or Next.js) to transpile the code.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <i className="fas fa-sync text-xl"></i>
                      <h3 className="text-lg font-bold">2. How to fix the API Key error?</h3>
                    </div>
                    <p className="text-slate-400 ml-11">
                      The environment variable must be named <code className="text-emerald-400 bg-slate-800 px-2 py-1 rounded">API_KEY</code>. After adding it in Vercel, you <strong>must redeploy</strong> your project (Deployments -> Redeploy) for the changes to take effect.
                    </p>
                  </section>
                </div>

                <button 
                  onClick={() => setShowDeployGuide(false)}
                  className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-slate-900 text-center">
          <div className="text-slate-500 text-sm">
            <p>© 2024 SolidityFix AI. Powered by Google Gemini.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
