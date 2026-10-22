import React, { useState } from 'react';
import { X, Code, Copy, Check, ExternalLink } from 'lucide-react';

interface EmbedModalProps {
  onClose: () => void;
  charityName: string;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({ onClose, charityName }) => {
  const [copied, setCopied] = useState(false);
  const [embedHeight, setEmbedHeight] = useState('850');

  const origin = window.location.origin;
  const embedCode = `<iframe src="${origin}" width="100%" height="${embedHeight}" frameborder="0" style="border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);max-width:100%;" title="Oyo State Legislative Performance Tracker - ${charityName}" allow="clipboard-write"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Embed on Your Charity Page</h3>
              <p className="text-xs text-slate-500">Deploy this tracker on your WordPress, Wix, or custom website.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Embed Height</label>
            <div className="flex items-center gap-2">
              {['650', '850', '1000'].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setEmbedHeight(h)}
                  className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                    embedHeight === h
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {h}px {h === '850' ? '(Recommended)' : ''}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700">HTML IFrame Snippet</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed select-all">
              {embedCode}
            </pre>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] leading-relaxed">
            <strong>How to use:</strong> In WordPress or Elementor, add a "Custom HTML" widget and paste this code. Your website visitors will be able to see the live performance graphs, filter lawmakers, and read bill summaries directly without leaving your site.
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
