import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EmailList from '../components/EmailList';
import EmailDetailModal from '../components/EmailDetailModal';
import { RefreshCw } from 'lucide-react';

export default function Inbox() {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gmail/inbox`, {
        headers: { Authorization: `Bearer ${user._id}` }
      });
      setEmails(res.data);
    } catch (err) {
      console.error('Fetch inbox error', err);
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
      await fetchInbox();
    } catch (err) {
      console.error('Sync error', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInbox();
    }
  }, [user]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Clean Inbox</h1>
          <p className="text-gray-400 mt-1">Safe emails verified by SpamShield</p>
        </div>
        <button 
          onClick={syncGmail}
          disabled={syncing}
          className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-colors border border-blue-500/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Gmail'}
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <EmailList emails={emails} type="clean" onEmailClick={(email) => setSelectedEmail(email)} />
        </div>
      )}

      {selectedEmail && (
        <EmailDetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  );
}
