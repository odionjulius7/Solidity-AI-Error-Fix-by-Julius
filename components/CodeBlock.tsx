
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  filename?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, filename }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 my-4 shadow-xl">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400">{filename || 'solidity-code'}</span>
        <button 
          onClick={copyToClipboard}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
        >
          {copied ? (
            <><i className="fas fa-check text-green-400"></i> Copied</>
          ) : (
            <><i className="fas fa-copy"></i> Copy</>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-emerald-400 leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
};

export default CodeBlock;
