import React from 'react';
import { Mail, ShieldAlert, Calendar, User as UserIcon } from 'lucide-react';

export default function EmailList({ emails, type, onEmailClick }) {
  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 glass rounded-2xl border border-white/5">
        <Mail className="w-16 h-16 text-gray-500 mb-4 opacity-50" />
        <p className="text-gray-400 font-medium text-lg">No {type} emails found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <div 
          key={email._id} 
          onClick={() => onEmailClick(email)}
          className="glass p-5 rounded-2xl border border-white/5 hover:bg-white/5 cursor-pointer transition-all duration-200 group relative overflow-hidden"
        >
          {email.isSpam && (
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          )}
          {!email.isSpam && (
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          )}
          
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white truncate pr-4 group-hover:text-blue-400 transition-colors">
                  {email.subject || 'No Subject'}
                </h3>
                {email.isSpam && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/20">
                    {email.spamScore}% SPAM
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 truncate mb-2">
                {email.snippet}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">{email.sender}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(email.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
