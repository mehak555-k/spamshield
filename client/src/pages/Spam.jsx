import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EmailList from '../components/EmailList';
import EmailDetailModal from '../components/EmailDetailModal';
import { RefreshCw, Trash2 } from 'lucide-react';

export default function Spam() {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchSpam = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gmail/spam`, {
        headers: { Authorization: `Bearer ${user._id}` }
      });
      setEmails(res.data);
    } catch (err) {
      console.error('Fetch spam error', err);
    } finally {
      setLoading(false);
    }
  };

  const emptySpam = async () => {
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gmail/spam`, {
        headers: { Authorization: `Bearer ${user._id}` }
      });
      setEmails([]);
    } catch (err) {
      console.error('Empty spam error', err);
    } finally {
      setLoading(false);
    }
  };

  const syncGmail = async () => {
    try {
      setSyncing(true);
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gmail/sync`, {}, {
        headers: { Authorization: `Bearer ${user._id}` }
      });
      await fetchSpam();
    } catch (err) {
      console.error('Sync error', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSpam();
    }
  }, [user]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight text-red-400">Spam Folder</h1>
          <p className="text-gray-400 mt-1">Blocked malicious and unwanted emails</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={emptySpam}
            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-colors border border-red-500/20"
          >
            <Trash2 className="w-5 h-5" />
            Empty Spam
          </button>
          <button 
            onClick={syncGmail}
            disabled={syncing}
            className="bg-white/5 text-gray-300 hover:bg-white/10 px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-colors border border-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Gmail'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <EmailList emails={emails} type="spam" onEmailClick={(email) => setSelectedEmail(email)} />
        </div>
      )}

      {selectedEmail && (
        <EmailDetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  );
}
