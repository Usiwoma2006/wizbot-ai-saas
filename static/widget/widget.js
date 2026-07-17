(function () {
  const scriptTag = document.currentScript;
  const embedKey = scriptTag.getAttribute('data-embed-key');
  const apiBase = scriptTag.getAttribute('data-api-base') || 'http://127.0.0.1:8000/api';

  if (!embedKey) {
    console.error('WizBot: data-embed-key attribute is required on the script tag.');
    return;
  }

  let sessionToken = null;
  let widgetColor = '#2563eb';
  let widgetName = 'Support';
  let widgetAvatarUrl = null;
  let isOpen = false;
  let isLoading = false;

  // ---- Styles ----
  const style = document.createElement('style');
  style.textContent = `
    #wizbot-bubble {
      position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;
      border-radius: 50%; cursor: pointer; display: flex; align-items: center;
      justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999998; border: none; transition: transform 0.15s ease;
    }
    #wizbot-bubble:hover { transform: scale(1.05); }
    #wizbot-window {
      position: fixed; bottom: 90px; right: 20px; width: 360px; max-width: calc(100vw - 40px);
      height: 500px; max-height: calc(100vh - 120px); background: #fff; border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column;
      overflow: hidden; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      opacity: 0; transform: scale(0.95) translateY(8px); pointer-events: none;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
    #wizbot-window.open { opacity: 1; transform: scale(1) translateY(0); pointer-events: auto; }
    #wizbot-header {
      padding: 16px; color: #fff; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    #wizbot-header img { width: 28px; height: 28px; border-radius: 50%; }
    #wizbot-header span { font-weight: 600; font-size: 14px; flex: 1; }
    #wizbot-close {
      background: none; border: none; color: #fff; opacity: 0.85; cursor: pointer;
      padding: 4px; display: flex; align-items: center; justify-content: center;
    }
    #wizbot-close:hover { opacity: 1; }
    #wizbot-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px;
      background: #f9fafb;
    }
    .wizbot-msg { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; }
    .wizbot-msg.customer { align-self: flex-end; color: #fff; background: var(--wizbot-color, #2563eb); border-bottom-right-radius: 4px; }
    .wizbot-msg.assistant { align-self: flex-start; background: #fff; color: #1f2937; border: 1px solid #e5e7eb; border-bottom-left-radius: 4px; }
    .wizbot-msg.loading { align-self: flex-start; color: #9ca3af; font-style: italic; }

    /* ---- Product cards (Phase 4) ---- */
    #wizbot-messages .wizbot-products-row {
      align-self: flex-start; display: flex; flex-shrink: 0; gap: 10px; overflow-x: auto;
      width: 100%; max-width: 100%; min-height: 170px; padding-bottom: 4px;
      -webkit-overflow-scrolling: touch;
    }
    .wizbot-product-card {
      flex: 0 0 140px; width: 140px; min-width: 140px; background: #fff; border: 1px solid #e5e7eb;
      border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;
      text-decoration: none; color: inherit;
    }
    .wizbot-product-card.is-static { cursor: default; }
    .wizbot-product-image {
      display: block; width: 140px; min-width: 140px; height: 100px; min-height: 100px;
      object-fit: cover; background: #f3f4f6; flex-shrink: 0;
    }
    .wizbot-product-image.placeholder {
      display: flex; align-items: center; justify-content: center; color: #d1d5db; font-size: 11px;
    }
    .wizbot-product-body { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 4px; }
    .wizbot-product-title {
      font-size: 11.5px; font-weight: 600; color: #1f2937; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .wizbot-product-price-row { display: flex; align-items: baseline; gap: 6px; }
    .wizbot-product-price { font-size: 12.5px; font-weight: 700; color: var(--wizbot-color, #2563eb); }
    .wizbot-product-compare { font-size: 10.5px; color: #9ca3af; text-decoration: line-through; }
    .wizbot-product-badge {
      align-self: flex-start; font-size: 9.5px; font-weight: 600; color: #b91c1c;
      background: #fee2e2; padding: 2px 6px; border-radius: 999px;
    }
    .wizbot-product-link {
      margin-top: 2px; font-size: 10.5px; font-weight: 600; color: var(--wizbot-color, #2563eb);
    }

    #wizbot-input-row {
      padding: 12px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; flex-shrink: 0; background: #fff;
    }
    #wizbot-input {
      flex: 1; border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 12px;
      font-size: 13px; outline: none; resize: none; font-family: inherit;
    }
    #wizbot-input:focus { border-color: var(--wizbot-color, #2563eb); }
    #wizbot-send {
      border: none; border-radius: 10px; padding: 0 16px; color: #fff; font-size: 13px;
      font-weight: 600; cursor: pointer; flex-shrink: 0;
    }
    #wizbot-send:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // ---- DOM ----
  const bubble = document.createElement('button');
  bubble.id = 'wizbot-bubble';
  bubble.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  bubble.style.background = widgetColor;
  document.body.appendChild(bubble);

  const win = document.createElement('div');
  win.id = 'wizbot-window';
  win.innerHTML = `
    <div id="wizbot-header"></div>
    <div id="wizbot-messages"></div>
    <div id="wizbot-input-row">
      <textarea id="wizbot-input" rows="1" placeholder="Type your question..."></textarea>
      <button id="wizbot-send">Send</button>
    </div>
  `;
  document.body.appendChild(win);

  const header = win.querySelector('#wizbot-header');
  const messagesEl = win.querySelector('#wizbot-messages');
  const input = win.querySelector('#wizbot-input');
  const sendBtn = win.querySelector('#wizbot-send');

  function renderHeader() {
    header.style.background = widgetColor;
    header.innerHTML = `
      ${widgetAvatarUrl ? `<img src="${widgetAvatarUrl}" alt="${widgetName}" />` : ''}
      <span>${widgetName}</span>
      <button id="wizbot-close" aria-label="Close chat"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    `;
    sendBtn.style.background = widgetColor;
    header.querySelector('#wizbot-close').addEventListener('click', () => {
      isOpen = false;
      win.classList.remove('open');
    });
  }

  function addMessage(role, content) {
    const el = document.createElement('div');
    el.className = `wizbot-msg ${role}`;
    el.textContent = content;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  // Escapes text used inside attribute-free innerHTML fragments below
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function formatPrice(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (Number.isNaN(num)) return escapeHtml(value);
    return `$${num.toFixed(2)}`;
  }

  // Renders one row of product cards under the assistant's message
  function addProducts(products) {
    if (!Array.isArray(products) || products.length === 0) return;

    const row = document.createElement('div');
    row.className = 'wizbot-products-row';

    products.forEach((p) => {
      const hasLink = typeof p.product_url === 'string' && p.product_url.trim().length > 0;
      const card = document.createElement(hasLink ? 'a' : 'div');
      card.className = `wizbot-product-card${hasLink ? '' : ' is-static'}`;
      if (hasLink) {
        card.href = p.product_url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
      }

      const price = formatPrice(p.price);
      const comparePrice = formatPrice(p.compare_at_price);
      const showCompare = comparePrice && p.compare_at_price !== p.price;
      const outOfStock = p.is_available === false;

      card.innerHTML = `
        ${
          p.image_url
            ? `<img class="wizbot-product-image" src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" loading="lazy" />`
            : `<div class="wizbot-product-image placeholder">No image</div>`
        }
        <div class="wizbot-product-body">
          <div class="wizbot-product-title">${escapeHtml(p.title || 'Product')}</div>
          <div class="wizbot-product-price-row">
            ${price ? `<span class="wizbot-product-price">${price}</span>` : ''}
            ${showCompare ? `<span class="wizbot-product-compare">${comparePrice}</span>` : ''}
          </div>
          ${outOfStock ? `<span class="wizbot-product-badge">Out of stock</span>` : ''}
          ${hasLink ? `<span class="wizbot-product-link">View product →</span>` : ''}
        </div>
      `;

      row.appendChild(card);
    });

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function loadConfig() {
    try {
      const res = await fetch(`${apiBase}/widget/${embedKey}/config/`);
      const data = await res.json();
      widgetColor = data.widget_color || widgetColor;
      widgetName = data.widget_name || widgetName;
      widgetAvatarUrl = data.widget_avatar_url || null;
      bubble.style.background = widgetColor;
      document.documentElement.style.setProperty('--wizbot-color', widgetColor);
      renderHeader();
    } catch (err) {
      console.error('WizBot: failed to load config', err);
    }
  }

  async function startSession() {
    try {
      const res = await fetch(`${apiBase}/widget/${embedKey}/session/`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start session');
      const data = await res.json();
      sessionToken = data.session_token;
      widgetName = data.widget_name || widgetName;
      widgetColor = data.widget_color || widgetColor;
      bubble.style.background = widgetColor;
      document.documentElement.style.setProperty('--wizbot-color', widgetColor);
      renderHeader();
      addMessage('assistant', `Hi! I'm ${widgetName}. How can I help you today?`);
    } catch (err) {
      addMessage('assistant', 'Sorry, I\'m having trouble starting up. Please try again shortly.');
      console.error('WizBot:', err);
    }
  }

  async function sendMessage(text) {
    if (!sessionToken || isLoading) return;
    addMessage('customer', text);
    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    const loadingEl = addMessage('assistant loading', 'Thinking...');

    try {
      const res = await fetch(`${apiBase}/widget/${embedKey}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken, message: text }),
      });
      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();
      loadingEl.remove();
      addMessage('assistant', data.answer);
      addProducts(data.products);
    } catch (err) {
      loadingEl.remove();
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
      console.error('WizBot:', err);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
    }
  }

  bubble.addEventListener('click', async () => {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    if (isOpen && !sessionToken) {
      await startSession();
    }
  });

  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) sendMessage(text);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = input.value.trim();
      if (text) sendMessage(text);
    }
  });

  loadConfig();
})();