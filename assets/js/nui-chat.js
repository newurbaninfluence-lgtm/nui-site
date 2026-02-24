// NUI Chat Widget — "Sona" AI Assistant
// Bottom-right chat bubble powered by Claude API

(function() {
  'use strict';

  const CHAT_ENDPOINT = '/.netlify/functions/nui-chat';
  const SESSION_ID = 'nui_' + Math.random().toString(36).substr(2, 9);
  let messages = [];
  let isOpen = false;
  let isTyping = false;

  // ── Inject Styles ──────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #nui-chat-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #e63946, #c1121f);
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(230,57,70,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #nui-chat-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(230,57,70,0.5); }
    #nui-chat-bubble svg { width: 28px; height: 28px; fill: #fff; }
    #nui-chat-bubble .close-icon { display: none; }
    #nui-chat-bubble.open .chat-icon { display: none; }
    #nui-chat-bubble.open .close-icon { display: block; }

    #nui-chat-window {
      position: fixed; bottom: 96px; right: 24px; z-index: 99998;
      width: 380px; max-width: calc(100vw - 32px); height: 520px; max-height: calc(100vh - 140px);
      background: #111; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; overflow: hidden; display: none; flex-direction: column;
      box-shadow: 0 12px 48px rgba(0,0,0,0.6);
      font-family: 'Montserrat', sans-serif;
    }
    #nui-chat-window.open { display: flex; animation: chatSlideUp 0.25s ease-out; }
    @keyframes chatSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    .nui-chat-header {
      padding: 16px 20px; background: linear-gradient(135deg, #1a1a1a, #111);
      border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px;
    }
    .nui-chat-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #e63946, #c1121f);
      display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 14px;
      font-family: 'Syne', sans-serif;
    }
    .nui-chat-header-info h4 { margin: 0; font-size: 14px; font-weight: 700; color: #fff; }
    .nui-chat-header-info span { font-size: 11px; color: rgba(255,255,255,0.5); }

    .nui-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    .nui-chat-messages::-webkit-scrollbar { width: 4px; }
    .nui-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .nui-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; word-wrap: break-word; }
    .nui-msg.bot {
      align-self: flex-start; background: #1a1a1a; color: rgba(255,255,255,0.9);
      border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.04);
    }
    .nui-msg.user {
      align-self: flex-end; background: linear-gradient(135deg, #e63946, #c1121f); color: #fff;
      border-bottom-right-radius: 4px;
    }
    .nui-msg.bot strong { color: #e63946; font-weight: 600; }

    .nui-typing { align-self: flex-start; padding: 10px 16px; background: #1a1a1a; border-radius: 12px; border-bottom-left-radius: 4px; display: flex; gap: 4px; align-items: center; }
    .nui-typing span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); animation: typeDot 1.2s infinite; }
    .nui-typing span:nth-child(2) { animation-delay: 0.2s; }
    .nui-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typeDot { 0%,60%,100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }

    .nui-chat-input-area {
      padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06);
      background: #0d0d0d; display: flex; gap: 8px; align-items: center;
    }
    .nui-chat-input-area input {
      flex: 1; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 13px;
      font-family: 'Montserrat', sans-serif; outline: none; transition: border-color 0.2s;
    }
    .nui-chat-input-area input:focus { border-color: rgba(230,57,70,0.4); }
    .nui-chat-input-area input::placeholder { color: rgba(255,255,255,0.3); }
    .nui-chat-send {
      width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #e63946, #c1121f); display: flex;
      align-items: center; justify-content: center; transition: opacity 0.2s; flex-shrink: 0;
    }
    .nui-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
    .nui-chat-send svg { width: 16px; height: 16px; fill: #fff; }

    .nui-chat-quick-btns { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
    .nui-chat-quick {
      background: rgba(230,57,70,0.1); border: 1px solid rgba(230,57,70,0.2);
      color: #e63946; border-radius: 20px; padding: 6px 14px; font-size: 11px;
      cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 600;
      transition: background 0.2s; white-space: nowrap;
    }
    .nui-chat-quick:hover { background: rgba(230,57,70,0.2); }

    @media (max-width: 480px) {
      #nui-chat-window { width: calc(100vw - 16px); right: 8px; bottom: 80px; height: calc(100vh - 120px); }
      #nui-chat-bubble { width: 52px; height: 52px; bottom: 16px; right: 16px; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ───────────────────────────────────────────
  const chatHTML = `
    <div id="nui-chat-window">
      <div class="nui-chat-header">
        <div class="nui-chat-avatar">S</div>
        <div class="nui-chat-header-info">
          <h4>Sona</h4>
          <span>NUI AI Assistant — typically replies instantly</span>
        </div>
      </div>
      <div class="nui-chat-messages" id="nuiChatMessages"></div>
      <div class="nui-chat-quick-btns" id="nuiQuickBtns">
        <button class="nui-chat-quick" onclick="nuiQuickAsk(this)">What services do you offer?</button>
        <button class="nui-chat-quick" onclick="nuiQuickAsk(this)">I need more customers</button>
        <button class="nui-chat-quick" onclick="nuiQuickAsk(this)">What's Brand Heavy?</button>
        <button class="nui-chat-quick" onclick="nuiQuickAsk(this)">Pricing for a website</button>
      </div>
      <div class="nui-chat-input-area">
        <input type="text" id="nuiChatInput" placeholder="Ask Sona anything..." autocomplete="off" />
        <button class="nui-chat-send" id="nuiChatSend" onclick="nuiSendMessage()">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
    <button id="nui-chat-bubble" onclick="nuiToggleChat()" aria-label="Chat with Sona">
      <svg class="chat-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      <svg class="close-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = chatHTML;
  document.body.appendChild(wrapper);

  // ── Welcome message ────────────────────────────────────────
  function showWelcome() {
    addBotMessage("Hey! I'm Sona, NUI's AI assistant. I can help you find the right branding, marketing, or tech service for your business. What are you looking for?");
  }

  // ── Toggle chat ────────────────────────────────────────────
  window.nuiToggleChat = function() {
    isOpen = !isOpen;
    var win = document.getElementById('nui-chat-window');
    var bubble = document.getElementById('nui-chat-bubble');
    if (isOpen) {
      win.classList.add('open');
      bubble.classList.add('open');
      if (messages.length === 0) showWelcome();
      setTimeout(function() { document.getElementById('nuiChatInput').focus(); }, 300);
    } else {
      win.classList.remove('open');
      bubble.classList.remove('open');
    }
  };

  // ── Quick ask buttons ──────────────────────────────────────
  window.nuiQuickAsk = function(btn) {
    var text = btn.textContent;
    document.getElementById('nuiQuickBtns').style.display = 'none';
    sendUserMessage(text);
  };

  // ── Send message ───────────────────────────────────────────
  window.nuiSendMessage = function() {
    var input = document.getElementById('nuiChatInput');
    var text = input.value.trim();
    if (!text || isTyping) return;
    input.value = '';
    document.getElementById('nuiQuickBtns').style.display = 'none';
    sendUserMessage(text);
  };

  // Handle Enter key
  document.getElementById('nuiChatInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.nuiSendMessage();
    }
  });

  function sendUserMessage(text) {
    // Add user message to UI
    addUserMessage(text);
    messages.push({ role: 'user', content: text });

    // Show typing indicator
    isTyping = true;
    showTyping();
    document.getElementById('nuiChatSend').disabled = true;

    // Call API
    fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages, sessionId: SESSION_ID })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      hideTyping();
      isTyping = false;
      document.getElementById('nuiChatSend').disabled = false;

      if (data.error) {
        addBotMessage("Sorry, I'm having trouble connecting right now. You can always book a free strategy call and talk to our team directly!");
      } else {
        var reply = data.reply;
        messages.push({ role: 'assistant', content: reply });
        addBotMessage(reply);
      }
    })
    .catch(function(err) {
      hideTyping();
      isTyping = false;
      document.getElementById('nuiChatSend').disabled = false;
      console.error('Chat error:', err);
      addBotMessage("Connection issue — try again in a moment, or book a strategy call and we'll help you directly.");
    });
  }

  // ── DOM helpers ────────────────────────────────────────────
  function addBotMessage(text) {
    var container = document.getElementById('nuiChatMessages');
    var div = document.createElement('div');
    div.className = 'nui-msg bot';
    // Basic markdown: **bold** and line breaks
    var html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    div.innerHTML = html;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function addUserMessage(text) {
    var container = document.getElementById('nuiChatMessages');
    var div = document.createElement('div');
    div.className = 'nui-msg user';
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    var container = document.getElementById('nuiChatMessages');
    var div = document.createElement('div');
    div.className = 'nui-typing';
    div.id = 'nuiTypingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('nuiTypingIndicator');
    if (el) el.remove();
  }

})();
