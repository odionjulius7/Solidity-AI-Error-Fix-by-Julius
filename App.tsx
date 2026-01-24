
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSolidityCode } from './services/geminiService.ts';
import { SolidityAnalysis } from './types.ts';
import CodeBlock from './components/CodeBlock.tsx';

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

  const resultRef = useRef<HTMLDivElement>(null);

  const handleFix = async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
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
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#020617] to-[#020617] text-slate-200 p-4 md:p-8 selection:bg-indigo-500/30 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
              <i className="fas fa-microchip text-indigo-400 text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Solidity<span className="text-indigo-500">Fix</span> AI
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Audit Engine Online
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-code text-indigo-400"></i>
                <h2 className="text-lg font-bold text-white/90">Smart Contract Code</h2>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 bg-[#020617]/60 text-emerald-400 font-mono p-5 rounded-2xl border border-slate-800/50 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all resize-none placeholder:text-slate-800 text-sm leading-relaxed"
                placeholder="Paste your Solidity code here..."
              />
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-bug text-rose-400"></i>
                <h2 className="text-lg font-bold text-white/90">Compiler Error</h2>
              </div>
              <textarea
                value={errorMsg}
                onChange={(e) => setErrorMsg(e.target.value)}
                className="w-full h-32 bg-[#020617]/60 text-rose-300 font-mono p-5 rounded-2xl border border-slate-800/50 focus:ring-2 focus:ring-rose-500/40 outline-none transition-all resize-none placeholder:text-slate-800 text-sm"
                placeholder="Paste the error message..."
              />
            </div>

            <button
              onClick={handleFix}
              disabled={isAnalyzing}
              className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
                isAnalyzing 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30 active:scale-[0.97]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-6 h-6 border-3 border-slate-500 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles"></i>
                  Analyze & Fix Contract
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {!analysis && !error && !isAnalyzing && (
              <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800/80 rounded-3xl flex flex-col items-center justify-center text-slate-600 p-12 text-center group">
                <div className="p-8 rounded-full bg-slate-900/40 mb-8 group-hover:scale-110 transition-transform duration-700 ease-out border border-white/5">
                  <i className="fas fa-shield-halved text-7xl opacity-10"></i>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-400">Analysis Engine Idle</h3>
                <p className="max-w-sm text-slate-500 leading-relaxed font-medium">Input your contract and the error to receive a full AI audit and code correction.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-6">
                <div className="h-14 bg-slate-900/50 rounded-2xl w-2/3 animate-pulse"></div>
                <div className="h-40 bg-slate-900/50 rounded-2xl animate-pulse"></div>
                <div className="h-80 bg-slate-900/50 rounded-2xl animate-pulse"></div>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8 text-rose-300 flex items-start gap-5 animate-in slide-in-from-right-4 duration-500">
                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                  <i className="fas fa-exclamation-circle text-2xl"></i>
                </div>
                <div className="flex-1 whitespace-pre-line">
                  <h3 className="font-black text-xl mb-2 text-rose-200 uppercase tracking-tight">System Message</h3>
                  <p className="text-rose-300/80 font-medium leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {analysis && (
              <div ref={resultRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl ring-1 ring-indigo-500/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                      <i className="fas fa-brain text-xl"></i>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">AI Diagnostic</h2>
                  </div>
                  
                  <div className="bg-[#020617]/50 rounded-2xl p-6 mb-8 border border-white/5">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base font-medium">
                      {analysis.explanation}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Corrected Implementation</h3>
                    </div>
                    <CodeBlock code={analysis.suggestedFix} />
                  </div>
                  
                  {analysis.missingFiles && analysis.missingFiles.length > 0 && (
                    <div className="mt-12 border-t border-slate-800 pt-10">
                      <div className="flex items-center gap-3 mb-6">
                        <i className="fas fa-cubes text-emerald-400 text-lg"></i>
                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Dependent Contracts</h3>
                      </div>
                      <div className="space-y-8">
                        {analysis.missingFiles.map((file, idx) => (
                          <div key={idx}>
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

        <footer className="mt-20 py-12 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">
            Audit Engine v1.0 • Gemini 3 Pro
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;