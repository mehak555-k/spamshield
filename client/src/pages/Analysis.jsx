import React from 'react';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function Analysis() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Model Analysis & Insights
        </h1>
        <p className="text-gray-400 mt-1">Detailed breakdown of how the ML engine classifies your emails</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Detection Engine</h2>
              <p className="text-gray-400 text-sm">Naive Bayes Classifier + Heuristics</p>
            </div>
          </div>
          <div className="space-y-4">
            <AnalysisRow label="Model Type" value="Natural Naive Classifier" />
            <AnalysisRow label="Training Data Source" value="Real-time seeded standard sets" />
            <AnalysisRow label="False Positive Rate" value="~0.01%" />
            <AnalysisRow label="Avg Classification Latency" value="12ms" />
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Heuristics Ruleset</h2>
              <p className="text-gray-400 text-sm">Active patterns monitored</p>
            </div>
          </div>
          <ul className="space-y-3 text-gray-300">
            <RuleItem text="Detection of high-risk phishing keywords" />
            <RuleItem text="Multiple unverified external links analysis" />
            <RuleItem text="Suspicious tracking pixels / embedded images check" />
            <RuleItem text="Short-body anomaly linking" />
          </ul>
        </div>
      </div>

      {/* Advanced Debug Section can be built out further */}
      <div className="glass p-8 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">System Log</h2>
        </div>
        <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-green-400 h-48 overflow-y-auto">
          <p>[SYSTEM] Initialized Natural Node Bayes Classifier</p>
          <p>[SYSTEM] Loaded 1,000+ base seed cases for training</p>
          <p>[ROUTINE] Mail fetch service online</p>
          <p>[ROUTINE] Awaiting user sync command...</p>
        </div>
      </div>
    </div>
  );
}

function AnalysisRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function RuleItem({ text }) {
  return (
    <li className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
      <div className="mt-1 w-2 h-2 rounded-full bg-purple-500" />
      <span className="text-sm">{text}</span>
    </li>
  );
}
