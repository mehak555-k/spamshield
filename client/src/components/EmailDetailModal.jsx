import React from 'react';
import { X, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function EmailDetailModal({ email, onClose }) {
  if (!email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div 
        className="glass border border-white/10 rounded-2xl w-full max-w-4xl max-h-full flex flex-col shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#1e1e2d]">
          <div className="flex-1 pr-8">
            <h2 className="text-2xl font-bold text-white mb-2">{email.subject}</h2>
            <div className="flex flex-col gap-1 text-sm text-gray-400">
              <p><span className="text-gray-500 w-16 inline-block">From:</span> <span className="text-white">{email.sender}</span></p>
              <p><span className="text-gray-500 w-16 inline-block">Date:</span> <span>{new Date(email.date).toLocaleString()}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors absolute top-6 right-6"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Classification Banner */}
        {email.isSpam ? (
          <div className="bg-red-500/10 border-y border-red-500/20 px-6 py-3 flex items-center gap-3 text-red-400">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Classified as Spam (Confidence: {email.spamScore}%)</p>
              <p className="text-xs opacity-80">{email.spamReason}</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-500/10 border-y border-green-500/20 px-6 py-3 flex items-center gap-3 text-green-400">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Classified as Safe</p>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#151521]">
          {email.content ? (
            <div 
              className="text-gray-300 email-content-html"
              dangerouslySetInnerHTML={{ __html: email.content }} 
              style={{all: 'revert'}}
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap">{email.snippet}</p>
          )}
        </div>
      </div>
    </div>
  );
}
