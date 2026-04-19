import natural from 'natural';

class SpamClassifier {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.isTrained = false;
    this.phishingKeywords = [
      'urgent', 'password', 'verify', 'account suspended', 'login', 'click here',
      'bank', 'update your information', 'unauthorized access', 'security alert',
      'invoice', 'billing', 'ssn', 'social security'
    ];
  }

  // Train with some basic seed data
  train() {
    // Ham examples (Normal conversations)
    this.classifier.addDocument('Hey, how are you doing today?', 'ham');
    this.classifier.addDocument('Can we reschedule our meeting for tomorrow?', 'ham');
    this.classifier.addDocument('Here is the report you asked for.', 'ham');
    this.classifier.addDocument('Lunch at 12?', 'ham');
    this.classifier.addDocument('I have attached the document you requested.', 'ham');
    this.classifier.addDocument('Please let me know if you need anything else.', 'ham');
    this.classifier.addDocument('Looking forward to seeing you at the event.', 'ham');

    // Spam examples (Scam, phishing, etc)
    this.classifier.addDocument('You have won a lottery! Click here to claim your prize.', 'spam');
    this.classifier.addDocument('Get cheap medications now! No prescription needed.', 'spam');
    this.classifier.addDocument('Urgent: Your account is locked. Verify your password.', 'spam');
    this.classifier.addDocument('Make money fast from home. Limited time offer.', 'spam');
    this.classifier.addDocument('Enlarge your business with these SEO tools.', 'spam');
    this.classifier.addDocument('Update your billing information to avoid account suspension.', 'spam');
    this.classifier.addDocument('Security alert: Unauthorized access detected. Click the secure link.', 'spam');
    this.classifier.addDocument('Congratulations! You have been selected for a free gift card.', 'spam');

    this.classifier.train();
    this.isTrained = true;
    console.log('Spam classifier trained with enhanced seed data.');
  }

  // Heuristics checks
  checkHeuristics(content, htmlContent = '') {
    let score = 0;
    const reasons = [];
    let hasSuspiciousLink = false;
    let hasImage = false;
    let hasPhishingKeywords = false;
    const text = (content + ' ' + htmlContent).toLowerCase();

    // Check phishing keywords (using strict word boundaries)
    const foundKeywords = this.phishingKeywords.filter(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        return regex.test(text);
    });
    
    if (foundKeywords.length > 0) {
      hasPhishingKeywords = true;
      score += foundKeywords.length * 0.2;
      reasons.push(`Phishing keywords detected: ${foundKeywords.join(', ')}`);
    }

    // Check for suspicious/unauthorized links
    // Basic regex for HTML links or raw URLs
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = text.match(linkRegex) || [];
    
    if (links.length > 0) {
      // Differentiate between generic links and highly suspicious phishing links
      const suspiciousLinkTerms = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'free', 'win', 'prize', 'claim'];
      const phishingLinks = links.filter(link => suspiciousLinkTerms.some(term => link.includes(term)));
      
      if (phishingLinks.length > 0) {
          hasSuspiciousLink = true;
          score += 0.5;
          reasons.push('Suspicious/Phishing link detected');
      } else {
          // Regular links don't trigger the malicious flag directly
          reasons.push('Contains valid external links');
      }
    }

    // Check for images (could be tracking pixel or spammy image)
    const imgRegex = /<img[^>]+src="?([^"\s]+)"?[^>]*>/g;
    const images = htmlContent.match(imgRegex) || [];
    if (images.length > 0) {
      hasImage = true;
      score += 0.2;
      reasons.push('Embedded images detected');
    }
    
    // Very short message with a link often implies spam
    if (text.length < 50 && hasSuspiciousLink) {
      score += 0.4;
      reasons.push('Unusually short message with a suspicious link');
    }

    return { score, reasons, hasSuspiciousLink, hasImage, hasPhishingKeywords };
  }

  classify(subject, content) {
    if (!this.isTrained) {
      this.train();
    }

    // Assume HTML is passed into content together.
    const htmlContent = content;
    const heuristics = this.checkHeuristics(content, htmlContent);

    // Chunking: Divide message into parts by newline or punctuation to check individually.
    const textChunks = `${subject} ${content}`.split(/[.\n\r!?]+/);
    
    let chunkIsSpam = false;
    let maxSpamProb = 0;
    let maxHamProb = 0;

    // Run ML predictions across each segmented chunk
    for (const chunk of textChunks) {
        const cleanChunk = chunk.trim();
        if (cleanChunk.length < 5) continue; // Skip very small parts

        const mlResult = this.classifier.getClassifications(cleanChunk);
        const spamProb = mlResult.find(c => c.label === 'spam')?.value || 0;
        const hamProb = mlResult.find(c => c.label === 'ham')?.value || 0;

        if (spamProb > maxSpamProb) maxSpamProb = spamProb;
        if (hamProb > maxHamProb) maxHamProb = hamProb;

        if (spamProb > hamProb && spamProb > 0.001) {
            chunkIsSpam = true;
        }
    }

    // STRICT CLASSIFICATION RULE:
    // User requested only classifying as spam if there is a phishing link, 
    // OR it's a strongly worded scam message, OR an image is attached.
    // Valid links flow through untouched.
    
    const isPureScamMessage = chunkIsSpam && heuristics.hasPhishingKeywords;
    const isPhishingLink = heuristics.hasSuspiciousLink;

    const meetsStrictSpamRules = isPhishingLink || isPureScamMessage;
    
    let isSpam = meetsStrictSpamRules;
    let baseScore = isSpam ? 0.6 : 0.1;
    
    const finalScore = Math.min(1.0, baseScore + heuristics.score);

    // Hard override
    if (finalScore >= 0.6 && !meetsStrictSpamRules) {
        isSpam = false; // Strictly enforce rule!
    } else if (meetsStrictSpamRules) {
        isSpam = true;
    }
    
    const allReasons = [];
    if (isPureScamMessage) allReasons.push('Highly suspicious text and keywords detected');
    if (isSpam && !chunkIsSpam) allReasons.push('High heuristic score triggered spam detection');
    allReasons.push(...heuristics.reasons);

    if (!isSpam && chunkIsSpam) {
        allReasons.push('Flagged safe because links are valid and no blatant scam keywords are present.');
    }

    return {
      isSpam,
      spamScore: Math.round(finalScore * 100),
      reason: allReasons.join('; ') || 'Looks safe',
      probabilities: {
        spam: maxSpamProb,
        ham: maxHamProb
      }
    };
  }
}

export default new SpamClassifier();
