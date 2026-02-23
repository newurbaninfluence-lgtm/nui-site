// ==================== SMS VOICE ENGINE ====================
// Message variation pools + assembly logic
// Faren's voice: Detroit-rooted, friendly, nostalgic, casual

const SMS_VOICE = {

  // ─── OLD CLIENT REACTIVATION ───────────────
  reactivation: {
    opening: [
      "Hi {{first_name}}, this is Faren.",
      "Hey {{first_name}}, Faren here.",
      "What's up {{first_name}}, Faren here."
    ],
    memory_trigger: [
      "You might remember me from the old Bravo Graphix days — our store was on Livernois in Detroit.",
      "Not sure if you remember Bravo Graphix on Livernois.",
      "Back when we had the shop on Livernois years ago."
    ],
    service_reminder: [
      "We might've worked on your logo or flyer design.",
      "I believe we did some print work for you.",
      "We may have handled some branding or graphics for your business."
    ],
    close: [
      "Just checking — is this still a good number for you?",
      "Wanted to see if this is still the best number to reach you.",
      "Is this number still active for you?"
    ],
    // Follow-up Message 2 (only after reply)
    followup_2: {
      opener: [
        "Great to hear from you.",
        "Good to reconnect.",
        "Glad you're still around."
      ],
      body: [
        "I've since launched New Urban Influence helping small businesses refresh their branding.",
        "We've been working with Detroit businesses on brand updates and marketing."
      ],
      close: [
        "Are you still operating under the same business?"
      ]
    },
    // Follow-up Message 3 (only after engagement)
    followup_3: {
      body: [
        "Would it be okay if I sent over a quick overview of what we're doing now?"
      ]
    }
  },

  // ─── COLD OUTREACH ─────────────────────────
  cold_outreach: {
    opening: [
      "Hi {{first_name}}, this is Faren — I run a Detroit branding studio.",
      "Hey {{first_name}}, Faren here. I work with Detroit businesses on branding."
    ],
    business_ref: [
      "I came across {{business_name}}.",
      "I was checking out {{business_name}} online."
    ],
    observation: [
      "I really like what you're building.",
      "{{short_observation}}"
    ],
    close: [
      "Are you the right person to speak with about branding?",
      "Quick question — are you the owner?"
    ],
    // Follow-up Message 2 (only after reply)
    followup_2: {
      body: [
        "Appreciate it. I noticed a couple opportunities where your branding could stand out even more locally. Would you be open to a quick 10-minute conversation?"
      ]
    }
  }
};

// ─── ASSEMBLY ENGINE ─────────────────────────
// Picks one random phrase from each pool and assembles

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function assembleMessage(type, vars, tier = 1) {
  const voice = SMS_VOICE[type];
  if (!voice) return null;

  let parts = [];

  if (tier === 1) {
    if (type === 'reactivation') {
      parts = [
        pickRandom(voice.opening),
        pickRandom(voice.memory_trigger),
        pickRandom(voice.service_reminder),
        pickRandom(voice.close)
      ];
    } else if (type === 'cold_outreach') {
      parts = [
        pickRandom(voice.opening),
        pickRandom(voice.business_ref),
        pickRandom(voice.observation),
        pickRandom(voice.close)
      ];
    }
  } else if (tier === 2 && voice.followup_2) {
    const fu = voice.followup_2;
    parts = [
      fu.opener ? pickRandom(fu.opener) : '',
      pickRandom(fu.body),
      fu.close ? pickRandom(fu.close) : ''
    ].filter(Boolean);
  } else if (tier === 3 && voice.followup_3) {
    parts = [pickRandom(voice.followup_3.body)];
  }

  let message = parts.join(' ');

  // Variable substitution
  if (vars) {
    message = message.replace(/\{\{first_name\}\}/g, vars.first_name || 'there');
    message = message.replace(/\{\{business_name\}\}/g, vars.business_name || 'your business');
    message = message.replace(/\{\{short_observation\}\}/g, vars.short_observation || 'I really like what you\'re building.');
  }

  // Enforce 300 char max
  if (message.length > 300) {
    message = message.substring(0, 297) + '...';
  }

  return message;
}

// ─── DRAFT GENERATOR ─────────────────────────
// Generates unique drafts for a batch of contacts, no duplicate message bodies

function generateDrafts(contacts, type, tier = 1) {
  const usedMessages = new Set();
  const drafts = [];
  const maxAttempts = 10;

  for (const contact of contacts) {
    let message = null;
    let attempts = 0;

    // Keep generating until we get a unique message
    while (attempts < maxAttempts) {
      message = assembleMessage(type, {
        first_name: (contact.name || contact.first_name || '').split(' ')[0] || 'there',
        business_name: contact.business_name || '',
        short_observation: contact.short_observation || ''
      }, tier);

      if (!usedMessages.has(message)) {
        usedMessages.add(message);
        break;
      }
      attempts++;
    }

    // Cold outreach: block if observation field empty
    if (type === 'cold_outreach' && !contact.short_observation && !contact.business_name) {
      drafts.push({
        ...contact,
        message,
        blocked: true,
        block_reason: 'Missing business_name or observation'
      });
    } else {
      drafts.push({
        ...contact,
        message,
        blocked: false
      });
    }
  }

  return drafts;
}

// ─── OPT-OUT DETECTION ──────────────────────
const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'remove', "don't text", 'dont text', 'opt out', 'optout', 'leave me alone', 'no more'];

function isOptOut(text) {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  return OPT_OUT_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── COMPLIANCE CHECK ───────────────────────
// Returns { safe: boolean, reason: string }
async function checkCampaignCompliance(campaignId) {
  if (!db) return { safe: false, reason: 'No database connection' };

  const { data: campaign } = await db.from('sms_campaigns').select('*').eq('id', campaignId).single();
  if (!campaign) return { safe: false, reason: 'Campaign not found' };

  const { data: queue } = await db.from('sms_drip_queue').select('status').eq('campaign_id', campaignId);
  const total = (queue || []).length;
  const sent = (queue || []).filter(q => q.status === 'sent').length;

  // Check opt-out rate
  const { data: replies } = await db.from('sms_replies').select('is_optout').eq('campaign_id', campaignId);
  const optouts = (replies || []).filter(r => r.is_optout).length;
  const totalReplies = (replies || []).length;

  const optoutRate = sent > 0 ? (optouts / sent) * 100 : 0;
  const replyRate = sent > 0 ? (totalReplies / sent) * 100 : 0;

  // Reactivation: pause at 5% opt-out
  // Cold outreach: pause at 3% opt-out
  const threshold = campaign.campaign_type === 'cold_outreach' ? 3 : 5;

  if (optoutRate > threshold) {
    return { safe: false, reason: `Opt-out rate ${optoutRate.toFixed(1)}% exceeds ${threshold}% threshold` };
  }

  return {
    safe: true,
    stats: { total, sent, optouts, totalReplies, optoutRate, replyRate }
  };
}
