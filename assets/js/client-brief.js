// client-brief.js — Client Brand Questionnaire System
// v20260224v1
// Handles: Client-facing questionnaire form + admin brief viewer
// Integrates with: client-portal.js, admin-designer.js moodboard system

(function() {
'use strict';

// ═══════════════════════════════════════════════
// QUESTIONNAIRE DATA — From NUI Brand Questionnaire
// ═══════════════════════════════════════════════

const BRAND_QUESTIONS = {
  section1: {
    title: 'Getting to Know Your Business',
    subtitle: 'These questions help us understand the core of your brand.',
    questions: [
      { id: 'q1', type: 'textarea', label: 'What does your business do? What is your service or product?' },
      { id: 'q2', type: 'textarea', label: 'Is there a unique story behind the name and business?' },
      { id: 'q3', type: 'textarea', label: 'How and why was your business started and where did the idea come from?' },
      { id: 'q4', type: 'checkbox', label: 'What are your main business goals?', options: [
        'Clear brand recognition', 'To increase sales', 'Improved social presence',
        'To connect with your audience better', 'To stand out from competitors',
        'To refresh brand visuals', 'Other'
      ], hasOther: true },
      { id: 'q5', type: 'textarea', label: 'Who is your ideal audience/customer? Think about age, gender, personality, income, etc.' },
      { id: 'q6', type: 'textarea', label: "What are your audiences' frustrations/problems they face?" },
      { id: 'q7', type: 'textarea', label: 'Why would your customers specifically pick YOUR service or product over your competitors?' },
      { id: 'q8', type: 'list3', label: 'Who are your top 3 competitors?' },
      { id: 'q9', type: 'textarea', label: 'How is your business run? How do they find you, make a purchase and receive their goods?' },
      { id: 'q10', type: 'textarea', label: 'What is the vision for your brand? What future does your brand want to create?' },
      { id: 'q11', type: 'textarea', label: 'What are your brand values? How do those values resonate with you and your business?' },
      { id: 'q12', type: 'textarea', label: "What words would you use to describe your brand's personality?" },
      { id: 'q13', type: 'textarea', label: 'What message do you want to convey to your customers? How do you want your customers to feel when they interact with your business?' }
    ]
  },
  section2: {
    title: 'Creative Direction & Visual Identity',
    subtitle: 'Help us understand your visual preferences and aesthetic.',
    questions: [
      { id: 'q14', type: 'url', label: 'Please link your Pinterest/vision board here:' },
      { id: 'q15', type: 'textarea', label: 'What do you like about your Pinterest board? Go into specifics about certain images/aesthetics.' },
      { id: 'q16', type: 'textarea', label: 'What words would you choose to describe your desired vibe and look?' },
      { id: 'q17', type: 'textarea', label: "If you have an existing brand identity, why isn't it working for you?" },
      { id: 'q18', type: 'textarea', label: 'Any font styles that you like and why?' },
      { id: 'q19', type: 'textarea', label: 'Any font styles that you dislike and why?' },
      { id: 'q20', type: 'textarea', label: 'Any colour schemes that you like and why?' },
      { id: 'q21', type: 'textarea', label: 'Any colour schemes that you dislike and why?' },
      { id: 'q22', type: 'textarea', label: 'Any icon, symbol or image that you are connected to that you might want to include within your brand?' },
      { id: 'q23', type: 'textarea', label: 'Any icon, symbol or image that you definitely don\'t want to include within your brand?' },
      { id: 'q24', type: 'textarea', label: "Are you envious of any business' branding? If so, who and what makes it so special?" },
      { id: 'q25', type: 'textarea', label: "Are there any business' branding that you just don't resonate with? If so, who and what specifically do you dislike?" }
    ]
  }
};

// Make questions available globally
window.NUI_BRAND_QUESTIONS = BRAND_QUESTIONS;

// ═══════════════════════════════════════════════
// CLIENT-FACING QUESTIONNAIRE RENDERER
// ═══════════════════════════════════════════════

window.renderBrandQuestionnaire = function(containerId, clientData, onSubmit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const savedResponses = clientData?.briefResponses || {};
  const isCompleted = clientData?.briefStatus === 'submitted';

  container.innerHTML = `
    <div class="nui-brief-wrap">
      <div class="nui-brief-hero">
        <div class="nui-brief-hero-glow"></div>
        <div class="nui-brief-hero-content">
          <div class="nui-brief-badge">${isCompleted ? '✓ Completed' : 'Action Required'}</div>
          <h2 class="nui-brief-title">Brand Discovery Questionnaire</h2>
          <p class="nui-brief-subtitle">Help us understand your vision so we can create something extraordinary.</p>
          ${isCompleted ? '<p class="nui-brief-done-msg">Thank you for completing the questionnaire! Your creative team is reviewing your responses.</p>' : ''}
        </div>
      </div>

      <form id="nuiBriefForm" class="nui-brief-form" ${isCompleted ? 'style="pointer-events:none;opacity:0.7;"' : ''}>
        ${_renderSection(BRAND_QUESTIONS.section1, savedResponses, 1)}
        ${_renderSection(BRAND_QUESTIONS.section2, savedResponses, 2)}
        
        ${!isCompleted ? `
        <div class="nui-brief-submit-wrap">
          <button type="submit" class="nui-brief-submit-btn">
            <span>Submit Questionnaire</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <p class="nui-brief-save-note">Your progress is saved automatically.</p>
        </div>` : ''}
      </form>
    </div>
  `;

  // Auto-save on input change
  container.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('change', () => _autosaveBrief(clientData));
    el.addEventListener('blur', () => _autosaveBrief(clientData));
  });

  // Form submission
  const form = document.getElementById('nuiBriefForm');
  if (form && !isCompleted) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const responses = _collectResponses();
      if (onSubmit) await onSubmit(responses);
    });
  }
};

function _renderSection(section, saved, sectionNum) {
  return `
    <div class="nui-brief-section">
      <div class="nui-brief-section-header">
        <span class="nui-brief-section-num">0${sectionNum}</span>
        <div>
          <h3 class="nui-brief-section-title">${section.title}</h3>
          <p class="nui-brief-section-sub">${section.subtitle}</p>
        </div>
      </div>
      <div class="nui-brief-questions">
        ${section.questions.map((q, i) => _renderQuestion(q, saved, i)).join('')}
      </div>
    </div>
  `;
}

function _renderQuestion(q, saved, index) {
  const val = saved[q.id] || '';
  
  if (q.type === 'textarea') {
    return `
      <div class="nui-brief-q" data-qid="${q.id}">
        <label class="nui-brief-label">${q.label}</label>
        <textarea class="nui-brief-textarea" name="${q.id}" placeholder="Type your answer...">${typeof val === 'string' ? val : ''}</textarea>
      </div>`;
  }
  
  if (q.type === 'url') {
    return `
      <div class="nui-brief-q" data-qid="${q.id}">
        <label class="nui-brief-label">${q.label}</label>
        <input type="url" class="nui-brief-input" name="${q.id}" value="${typeof val === 'string' ? val : ''}" placeholder="https://pinterest.com/...">
      </div>`;
  }
  
  if (q.type === 'checkbox') {
    const checked = Array.isArray(val) ? val : [];
    const otherVal = saved[q.id + '_other'] || '';
    return `
      <div class="nui-brief-q" data-qid="${q.id}">
        <label class="nui-brief-label">${q.label}</label>
        <div class="nui-brief-checks">
          ${q.options.map(opt => `
            <label class="nui-brief-check-item">
              <input type="checkbox" name="${q.id}" value="${opt}" ${checked.includes(opt) ? 'checked' : ''}>
              <span class="nui-brief-check-box"></span>
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
        ${q.hasOther ? `<input type="text" class="nui-brief-input nui-brief-other" name="${q.id}_other" value="${otherVal}" placeholder="If other, please specify..." style="margin-top:8px;">` : ''}
      </div>`;
  }
  
  if (q.type === 'list3') {
    const items = Array.isArray(val) ? val : ['','',''];
    return `
      <div class="nui-brief-q" data-qid="${q.id}">
        <label class="nui-brief-label">${q.label}</label>
        <div class="nui-brief-list3">
          <div class="nui-brief-list3-item"><span class="nui-brief-list3-num">1</span><input type="text" class="nui-brief-input" name="${q.id}_1" value="${items[0]||''}" placeholder="Competitor 1"></div>
          <div class="nui-brief-list3-item"><span class="nui-brief-list3-num">2</span><input type="text" class="nui-brief-input" name="${q.id}_2" value="${items[1]||''}" placeholder="Competitor 2"></div>
          <div class="nui-brief-list3-item"><span class="nui-brief-list3-num">3</span><input type="text" class="nui-brief-input" name="${q.id}_3" value="${items[2]||''}" placeholder="Competitor 3"></div>
        </div>
      </div>`;
  }
  
  return '';
}

function _collectResponses() {
  const responses = {};
  document.querySelectorAll('.nui-brief-q').forEach(qEl => {
    const qid = qEl.dataset.qid;
    const textarea = qEl.querySelector('textarea');
    const urlInput = qEl.querySelector('input[type="url"]');
    const checkboxes = qEl.querySelectorAll('input[type="checkbox"]');
    const list3 = qEl.querySelectorAll('.nui-brief-list3 input');
    const otherInput = qEl.querySelector('.nui-brief-other');
    
    if (textarea) responses[qid] = textarea.value.trim();
    else if (urlInput) responses[qid] = urlInput.value.trim();
    else if (checkboxes.length > 0) {
      responses[qid] = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
      if (otherInput) responses[qid + '_other'] = otherInput.value.trim();
    }
    else if (list3.length > 0) {
      responses[qid] = Array.from(list3).map(inp => inp.value.trim());
    }
  });
  return responses;
}

function _autosaveBrief(clientData) {
  if (!clientData) return;
  const responses = _collectResponses();
  clientData.briefResponses = responses;
  // Save to localStorage
  if (typeof clients !== 'undefined') {
    const idx = clients.findIndex(c => c.id === clientData.id);
    if (idx > -1) { clients[idx].briefResponses = responses; }
    try { localStorage.setItem('nui_clients', JSON.stringify(clients)); } catch(e) {}
  }
}

// ═══════════════════════════════════════════════
// SUBMIT TO SUPABASE + ADMIN NOTIFICATION
// ═══════════════════════════════════════════════

window.submitBrandBrief = async function(clientData, responses) {
  try {
    if (typeof showNotification === 'function') showNotification('Submitting questionnaire...', 'info');
    
    const payload = {
      clientId: clientData?.id || null,
      clientName: clientData?.name || '',
      clientEmail: clientData?.email || '',
      clientPhone: clientData?.phone || '',
      serviceType: clientData?.serviceType || 'branding',
      responses: responses
    };

    const resp = await fetch('/.netlify/functions/save-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await resp.json();
    
    if (result.success) {
      // Update local client data
      clientData.briefResponses = responses;
      clientData.briefStatus = 'submitted';
      clientData.briefSubmittedAt = new Date().toISOString();
      
      if (typeof clients !== 'undefined') {
        const idx = clients.findIndex(c => c.id === clientData.id);
        if (idx > -1) {
          clients[idx].briefResponses = responses;
          clients[idx].briefStatus = 'submitted';
          clients[idx].briefSubmittedAt = new Date().toISOString();
        }
        try { localStorage.setItem('nui_clients', JSON.stringify(clients)); } catch(e) {}
      }
      
      if (typeof showNotification === 'function') showNotification('Questionnaire submitted successfully!', 'success');
      return true;
    } else {
      // Supabase might not have the table yet — save locally anyway
      clientData.briefResponses = responses;
      clientData.briefStatus = 'submitted';
      if (typeof clients !== 'undefined') {
        const idx = clients.findIndex(c => c.id === clientData.id);
        if (idx > -1) {
          clients[idx].briefResponses = responses;
          clients[idx].briefStatus = 'submitted';
        }
        try { localStorage.setItem('nui_clients', JSON.stringify(clients)); } catch(e) {}
      }
      if (typeof showNotification === 'function') showNotification('Saved locally (server sync pending)', 'warning');
      return true;
    }
  } catch (err) {
    console.warn('Brief submit error:', err);
    // Fallback: save locally
    clientData.briefResponses = responses;
    clientData.briefStatus = 'submitted';
    if (typeof showNotification === 'function') showNotification('Saved locally', 'warning');
    return true;
  }
};

// ═══════════════════════════════════════════════
// ADMIN BRIEF VIEWER — Glass panel in moodboard editor
// ═══════════════════════════════════════════════

window.renderAdminBriefPanel = function(clientId) {
  const client = (typeof clients !== 'undefined') ? clients.find(c => c.id == clientId) : null;
  if (!client) return '<div class="mb-brief-empty">No client selected</div>';
  
  const responses = client.briefResponses || {};
  const hasResponses = Object.keys(responses).length > 0;
  const questions = { ...BRAND_QUESTIONS.section1.questions, ...BRAND_QUESTIONS.section2.questions };
  const allQ = [...BRAND_QUESTIONS.section1.questions, ...BRAND_QUESTIONS.section2.questions];

  if (!hasResponses) {
    return `
      <div class="mb-brief-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5">
          <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p style="color:rgba(255,255,255,0.5);margin:12px 0 4px;">No brief submitted yet</p>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;">Send the questionnaire link to your client</p>
      </div>`;
  }

  let html = '<div class="mb-brief-responses">';
  allQ.forEach(q => {
    const val = responses[q.id];
    if (!val || (Array.isArray(val) && val.every(v => !v))) return;
    
    let displayVal = '';
    if (Array.isArray(val)) {
      displayVal = val.filter(v => v).join(', ');
      if (responses[q.id + '_other']) displayVal += ' — ' + responses[q.id + '_other'];
    } else {
      displayVal = val;
    }
    if (!displayVal) return;
    
    html += `
      <div class="mb-brief-item">
        <div class="mb-brief-q-label">${q.label}</div>
        <div class="mb-brief-q-answer">${displayVal}</div>
      </div>`;
  });
  html += '</div>';
  return html;
};

// ═══════════════════════════════════════════════
// BRIEF → MOODBOARD AUTO-GENERATION
// ═══════════════════════════════════════════════

window.generateMoodboardFromBrief = function(clientId) {
  const client = (typeof clients !== 'undefined') ? clients.find(c => c.id == clientId) : null;
  if (!client || !client.briefResponses) return null;
  
  const r = client.briefResponses;
  const items = [];
  let y = 40;

  // Title
  items.push({
    type: 'text', text: (client.name || 'Client') + ' — Brand Direction',
    font: 'Playfair Display, serif', fontSize: 36, color: '#ffffff',
    x: 60, y: y, rotation: 0, zIndex: 1
  });
  y += 80;

  // Brand Story card (from q1, q2, q3)
  const storyParts = [r.q1, r.q2, r.q3].filter(Boolean);
  if (storyParts.length) {
    items.push({
      type: 'note', title: 'Brand Story',
      body: storyParts.join('\n\n'),
      stripColor: '#e63946',
      x: 60, y: y, width: 340, height: 200, rotation: 0, zIndex: items.length + 1
    });
  }

  // Target Audience (q5)
  if (r.q5) {
    items.push({
      type: 'note', title: 'Target Audience',
      body: r.q5,
      stripColor: '#2a9d8f',
      x: 420, y: y, width: 300, height: 160, rotation: 0, zIndex: items.length + 1
    });
  }
  y += 230;

  // Brand Values & Personality (q11, q12)
  if (r.q11 || r.q12) {
    items.push({
      type: 'note', title: 'Values & Personality',
      body: [r.q11 ? 'Values: ' + r.q11 : '', r.q12 ? 'Personality: ' + r.q12 : ''].filter(Boolean).join('\n\n'),
      stripColor: '#4a90d9',
      x: 60, y: y, width: 300, height: 180, rotation: 0, zIndex: items.length + 1
    });
  }

  // Vision (q10)
  if (r.q10) {
    items.push({
      type: 'note', title: 'Brand Vision',
      body: r.q10,
      stripColor: '#7c3aed',
      x: 380, y: y, width: 300, height: 160, rotation: 0, zIndex: items.length + 1
    });
  }
  y += 210;

  // Customer Message (q13)
  if (r.q13) {
    items.push({
      type: 'note', title: 'Customer Experience',
      body: r.q13,
      stripColor: '#e9c46a',
      x: 60, y: y, width: 320, height: 140, rotation: 0, zIndex: items.length + 1
    });
  }

  // Competitors (q8)
  if (r.q8 && Array.isArray(r.q8) && r.q8.some(c => c)) {
    items.push({
      type: 'note', title: 'Competitors',
      body: r.q8.filter(Boolean).map((c,i) => (i+1) + '. ' + c).join('\n'),
      stripColor: '#e76f51',
      x: 400, y: y, width: 260, height: 120, rotation: 0, zIndex: items.length + 1
    });
  }
  y += 170;

  // Creative Direction header
  items.push({
    type: 'text', text: 'Creative Direction',
    font: 'Inter, sans-serif', fontSize: 24, color: 'rgba(255,255,255,0.6)',
    x: 60, y: y, rotation: 0, zIndex: items.length + 1
  });
  y += 50;

  // Vibe words (q16)
  if (r.q16) {
    items.push({
      type: 'note', title: 'Desired Vibe & Look',
      body: r.q16,
      stripColor: '#db2777',
      x: 60, y: y, width: 300, height: 140, rotation: 0, zIndex: items.length + 1
    });
  }

  // Font preferences (q18)
  if (r.q18) {
    items.push({
      type: 'note', title: 'Font Preferences (Like)',
      body: r.q18,
      stripColor: '#264653',
      x: 380, y: y, width: 280, height: 120, rotation: 0, zIndex: items.length + 1
    });
  }
  y += 170;

  // Color preferences (q20)
  if (r.q20) {
    items.push({
      type: 'note', title: 'Color Preferences (Like)',
      body: r.q20,
      stripColor: '#2a9d8f',
      x: 60, y: y, width: 300, height: 120, rotation: 0, zIndex: items.length + 1
    });
  }

  // Brand envy (q24)
  if (r.q24) {
    items.push({
      type: 'note', title: 'Brands They Admire',
      body: r.q24,
      stripColor: '#f4a261',
      x: 380, y: y, width: 280, height: 120, rotation: 0, zIndex: items.length + 1
    });
  }
  y += 150;

  // Pinterest link
  if (r.q14) {
    items.push({
      type: 'link', url: r.q14, title: 'Client Pinterest Board',
      x: 60, y: y, width: 300, rotation: 0, zIndex: items.length + 1
    });
  }

  // Symbols/imagery (q22)
  if (r.q22) {
    items.push({
      type: 'note', title: 'Symbols & Imagery (Include)',
      body: r.q22,
      stripColor: '#059669',
      x: 380, y: y, width: 280, height: 100, rotation: 0, zIndex: items.length + 1
    });
  }

  return {
    collageItems: items,
    canvasBackground: '#0a0a0a',
    briefSnapshot: r
  };
};

})(); // end IIFE
