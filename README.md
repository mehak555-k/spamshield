# SpamShield 🛡️LINK: "https://spamshield-x5kr.vercel.app"

**SpamShield** is an advanced full-stack Machine Learning email application that interfaces natively with Gmail to automatically intercept sophisticated scams, phishing links, and malicious emails without blocking your legitimate marketing newsletters.

---

## 🛑 Problem Statement
Modern email inboxes are chronically flooded with dangerous phishing attempts and deceptive scam messages that easily bypass standard spam filters. Concurrently, existing filters are notoriously overly aggressive—often treating innocent promotional emails as "spam" simply because they contain common tracking pixels or generic links. 
Users need a system that precisely identifies true threats without resulting in frustrating false positives that hide valid emails.

## 💡 Solution
SpamShield implements a hybrid **Machine Learning & Deterministic Heuristics** architecture to eliminate false positives:
- **Natural Naive Bayes Classification:** Instead of scanning large emails as a single block, the ML mechanism chunks the body text by sentence, evaluating smaller fragments to pinpoint precise spam-like terminology.
- **Strict Heuristics Override:** Legitimate marketing patterns (like embedded tracking pixels or valid HTTP links) explicitly *bypass* the spam filter. Emails are only quarantined if the machine learning identifies them as pure scams, OR if they contain confirmed phishing keywords (e.g., 'login', 'verify account') hiding inside their embedded links.

## 🚀 Key Features
- **Gmail API Synchronization:** Log in securely via Google OAuth to synchronize your live inbox environment.
- **Zero-False-Positive Filtering:** Ensures that standard external links are untouched while maliciously constructed phishing links are securely blocked into the Spam folder.
- **Detailed Insights Dashboard:** Visual breakdown showing the active rule-sets, classification latencies, and how effectively the ML engine is sorting data.
- **One-Click Data Scrubbing:** Instantly wipe out all isolated spam messages from the backend MongoDB cache with the "Empty Spam" function.

## 💻 Tech Stack
- **Frontend**: React.js, Vite, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Machine Learning**: `natural` (Node Bayesian Classifier)
- **Authentication**: External Google OAuth2

## ⚙️ Running Locally
1. Run `npm install` inside both the `/backend` and `/client` directories.
2. In the `/backend` directory, add your `.env` variables (MongoDB URI, Google OAuth client secrets).
3. Start the Node API: `node index.js`
4. Start the Vite React client: `npm run dev`
