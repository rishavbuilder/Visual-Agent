(function() {
  'use strict';

  let ws = null;
  let config = null;
  let selectedElements = [];
  let overlay = null;
  let pendingChanges = [];
  let editHistory = [];
  let isMultiSelectMode = false;

  window.__VISUAL_AGENT_INIT__ = function(options) {
    config = options;
    console.log('[Visual Agent] Initializing...');

    // Wait for page to fully load - don't block loading screen
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        // Delay further to let loading animation complete
        setTimeout(initVisualAgent, 500);
      });
    } else {
      // Page already loaded, but still delay to be safe
      setTimeout(initVisualAgent, 500);
    }
  };

  function initVisualAgent() {
    initWebSocket();
    createOverlay();
    initInspector();
    console.log('[Visual Agent] Ready');
  }

  function initWebSocket() {
    ws = new WebSocket(`ws://localhost:${config.port}`);

    ws.onopen = function() {
      console.log('[Visual Agent] Connected to server');
    };

    ws.onmessage = function(event) {
      try {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (error) {
        console.error('[Visual Agent] Invalid message:', error);
      }
    };

    ws.onclose = function() {
      console.log('[Visual Agent] Disconnected from server');
      setTimeout(initWebSocket, 3000);
    };
  }

  function handleServerMessage(message) {
    switch (message.type) {
      case 'changes_approved':
        showNotification('Changes applied to code', 'success');
        editHistory.push(...message.changes);
        updateHistoryPanel();
        break;
      case 'changes_rejected':
        showNotification('Changes rejected', 'info');
        break;
      case 'source_changed':
        showNotification('Source files updated', 'success');
        break;
    }
  }

  function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'visual-agent-overlay';
    overlay.innerHTML = `
      <div class="va-panel">
        <div class="va-header">
          <div class="va-title">Visual Agent</div>
          <div class="va-controls">
            <button class="va-btn va-btn-minimize" title="Minimize">─</button>
            <button class="va-btn va-btn-close" title="Close">×</button>
          </div>
        </div>
        <div class="va-body">
          <div class="va-section">
            <div class="va-section-title">
              Selected Element
              <span class="va-selection-count" id="va-selection-count"></span>
            </div>
            <div class="va-element-info" id="va-element-info">
              <span class="va-placeholder">Click an element to select it</span>
            </div>
          </div>
          <div class="va-section">
            <div class="va-section-title">Properties</div>
            <div class="va-properties" id="va-properties">
              <span class="va-placeholder">No element selected</span>
            </div>
          </div>
          <div class="va-section">
            <div class="va-section-title">
              Pending Changes
              <span class="va-change-count" id="va-change-count">0</span>
            </div>
            <div class="va-changes" id="va-changes">
              <span class="va-placeholder">No changes yet</span>
            </div>
          </div>
          <div class="va-section va-history-section">
            <div class="va-section-title">History</div>
            <div class="va-history" id="va-history">
              <span class="va-placeholder">No edits yet</span>
            </div>
          </div>
        </div>
        <div class="va-footer">
          <button class="va-btn va-btn-undo" disabled>Undo</button>
          <button class="va-btn va-btn-redo" disabled>Redo</button>
          <button class="va-btn va-btn-apply">Apply to Code</button>
        </div>
      </div>
      <div class="va-approval-modal" id="va-approval-modal">
        <div class="va-approval-content">
          <div class="va-approval-header">
            <span class="va-approval-count" id="va-approval-count">0</span>
            <span>Changes Ready</span>
          </div>
          <div class="va-approval-list" id="va-approval-list"></div>
          <div class="va-approval-actions">
            <button class="va-btn va-btn-approve">Apply All</button>
            <button class="va-btn va-btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
      <div class="va-notification" id="va-notification"></div>
    `;

    document.body.appendChild(overlay);
    initOverlayEvents();
  }

  function initOverlayEvents() {
    overlay.querySelector('.va-btn-minimize').addEventListener('click', toggleMinimize);
    overlay.querySelector('.va-btn-close').addEventListener('click', closeOverlay);
    overlay.querySelector('.va-btn-undo').addEventListener('click', undo);
    overlay.querySelector('.va-btn-redo').addEventListener('click', redo);
    overlay.querySelector('.va-btn-apply').addEventListener('click', showApprovalModal);
    overlay.querySelector('.va-btn-approve').addEventListener('click', approveChanges);
    overlay.querySelector('.va-btn-cancel').addEventListener('click', hideApprovalModal);

    makeDraggable(overlay.querySelector('.va-panel'));
  }

  function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    const header = element.querySelector('.va-header');

    header.addEventListener('mousedown', function(e) {
      if (e.target.closest('.va-controls')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = element.offsetLeft;
      initialY = element.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      element.style.left = initialX + (e.clientX - startX) + 'px';
      element.style.top = initialY + (e.clientY - startY) + 'px';
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }

  function toggleMinimize() {
    overlay.classList.toggle('va-minimized');
  }

  function closeOverlay() {
    overlay.style.display = 'none';
  }

  function initInspector() {
    // Delay event listeners to not interfere with loading screen
    setTimeout(function() {
      document.addEventListener('click', handleDocumentClick, true);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }, 1000);
  }

  function handleKeyDown(e) {
    if (e.key === 'Shift') {
      isMultiSelectMode = true;
      document.body.classList.add('va-multiselect-mode');
    }
  }

  function handleKeyUp(e) {
    if (e.key === 'Shift') {
      isMultiSelectMode = false;
      document.body.classList.remove('va-multiselect-mode');
    }
  }

  function handleDocumentClick(e) {
    // Don't intercept clicks on loading screens
    if (document.querySelector('.loading') || 
        document.querySelector('[data-loading]') ||
        document.querySelector('#__next.Loading') ||
        document.querySelector('[class*="loading"]')) {
      return;
    }
    
    if (e.target.closest('#visual-agent-overlay')) return;
    if (e.target.closest('script') || e.target.closest('link')) return;

    // Don't block React events - just select element
    // e.preventDefault() and e.stopPropagation() removed to not block React hydration

    if (isMultiSelectMode) {
      toggleElementSelection(e.target);
    } else {
      selectElement(e.target);
    }
  }

  function selectElement(element) {
    clearSelection();
    selectedElements = [element];
    updateSelectionUI();
    highlightSelectedElements();
  }

  function toggleElementSelection(element) {
    const index = selectedElements.indexOf(element);
    if (index > -1) {
      selectedElements.splice(index, 1);
    } else {
      selectedElements.push(element);
    }
    updateSelectionUI();
    highlightSelectedElements();
  }

  function clearSelection() {
    selectedElements = [];
    updateSelectionUI();
    clearHighlights();
  }

  function updateSelectionUI() {
    const infoContainer = document.getElementById('va-element-info');
    const countSpan = document.getElementById('va-selection-count');
    const propsContainer = document.getElementById('va-properties');

    if (selectedElements.length === 0) {
      infoContainer.innerHTML = '<span class="va-placeholder">Click an element to select it</span>';
      countSpan.textContent = '';
      propsContainer.innerHTML = '<span class="va-placeholder">No element selected</span>';
      return;
    }

    if (selectedElements.length === 1) {
      const el = selectedElements[0];
      const selector = generateCSSSelector(el);
      const tag = el.tagName.toLowerCase();

      infoContainer.innerHTML = `
        <div class="va-element-tag">&lt;${tag}&gt;</div>
        <div class="va-element-selector">${selector}</div>
      `;
      countSpan.textContent = '';
      updatePropertiesForElement(el);
    } else {
      infoContainer.innerHTML = `<span class="va-placeholder">${selectedElements.length} elements selected</span>`;
      countSpan.textContent = selectedElements.length;
      propsContainer.innerHTML = '<span class="va-placeholder">Multi-edit mode active</span>';
    }
  }

  function updatePropertiesForElement(element) {
    const propsContainer = document.getElementById('va-properties');
    const styles = window.getComputedStyle(element);

    const editableProps = [
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'backgroundColor', label: 'Background', type: 'color' },
      { key: 'fontSize', label: 'Font Size', type: 'text' },
      { key: 'fontWeight', label: 'Weight', type: 'select', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
      { key: 'textAlign', label: 'Align', type: 'select', options: ['left', 'center', 'right', 'justify'] },
      { key: 'padding', label: 'Padding', type: 'text' },
      { key: 'margin', label: 'Margin', type: 'text' },
      { key: 'borderRadius', label: 'Radius', type: 'text' },
      { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.1 }
    ];

    propsContainer.innerHTML = editableProps.map(prop => {
      const value = styles[prop.key];
      let input = '';

      switch (prop.type) {
        case 'color':
          input = `<input type="color" class="va-input" data-property="${prop.key}" value="${rgbToHex(value)}">`;
          break;
        case 'select':
          input = `<select class="va-input" data-property="${prop.key}">
            ${prop.options.map(o => `<option value="${o}" ${styles[prop.key] === o ? 'selected' : ''}>${o}</option>`).join('')}
          </select>`;
          break;
        case 'range':
          input = `<input type="range" class="va-input" data-property="${prop.key}" min="${prop.min}" max="${prop.max}" step="${prop.step}" value="${value}">`;
          break;
        default:
          input = `<input type="text" class="va-input" data-property="${prop.key}" value="${value}">`;
      }

      return `<div class="va-property">
        <label class="va-property-label">${prop.label}</label>
        <div class="va-property-input">${input}</div>
      </div>`;
    }).join('');

    initPropertyInputs();
  }

  function initPropertyInputs() {
    const inputs = document.querySelectorAll('#va-properties .va-input');

    inputs.forEach(input => {
      const property = input.dataset.property;

      input.addEventListener('change', function() {
        const newValue = input.value;
        const selector = generateCSSSelector(selectedElements[0]);
        const oldValue = selectedElements[0].style[property] || window.getComputedStyle(selectedElements[0])[property];

        sendMessage({
          type: 'property_change',
          selector,
          property,
          oldValue,
          newValue
        });

        addPendingChange({
          selector,
          property,
          newValue,
          description: `Change ${property} on ${selectedElements.length > 1 ? selectedElements.length + ' elements' : selector}`
        });

        selectedElements.forEach(el => {
          el.style[property] = newValue;
        });
      });
    });
  }

  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return '#000000';
    return '#' + match.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  }

  function generateCSSSelector(element) {
    if (element.id) return '#' + element.id;

    const parts = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = '#' + current.id;
        parts.unshift(selector);
        break;
      }

      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).filter(c => c);
        if (classes.length > 0) {
          selector += '.' + classes.slice(0, 2).join('.');
        }
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) {
          selector += ':nth-of-type(' + (siblings.indexOf(current) + 1) + ')';
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ');
  }

  function highlightSelectedElements() {
    clearHighlights();

    selectedElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const highlight = document.createElement('div');
      highlight.className = 'va-highlight';
      highlight.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
      `;
      document.body.appendChild(highlight);
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.va-highlight').forEach(el => el.remove());
  }

  function addPendingChange(change) {
    fetch('/__visual-agent/change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(change)
    }).then(res => res.json()).then(data => {
      if (data.success && data.id) {
        pendingChanges.push({ ...change, id: data.id, timestamp: Date.now() });
        updateChangesList();
        updateApplyButton();
      }
    }).catch(err => {
      console.error('[Visual Agent] Failed to save change:', err);
    });
  }

  function updateChangesList() {
    const container = document.getElementById('va-changes');
    const countSpan = document.getElementById('va-change-count');

    countSpan.textContent = pendingChanges.length;

    if (pendingChanges.length === 0) {
      container.innerHTML = '<span class="va-placeholder">No changes yet</span>';
      return;
    }

    container.innerHTML = pendingChanges.map(change => `
      <div class="va-change-item">
        <span class="va-change-desc">${change.description}</span>
        <button class="va-change-remove" data-id="${change.id}">×</button>
      </div>
    `).join('');

    container.querySelectorAll('.va-change-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        pendingChanges = pendingChanges.filter(c => c.id !== id);
        updateChangesList();
        updateApplyButton();
      });
    });
  }

  function updateApplyButton() {
    const applyBtn = overlay.querySelector('.va-btn-apply');
    applyBtn.disabled = pendingChanges.length === 0;
    applyBtn.textContent = pendingChanges.length > 0
      ? `Apply ${pendingChanges.length} Change${pendingChanges.length > 1 ? 's' : ''}`
      : 'Apply to Code';
  }

  function showApprovalModal() {
    if (pendingChanges.length === 0) return;

    const modal = document.getElementById('va-approval-modal');
    const list = document.getElementById('va-approval-list');
    const count = document.getElementById('va-approval-count');

    count.textContent = pendingChanges.length;
    list.innerHTML = pendingChanges.map(change => `
      <div class="va-approval-item">
        <span class="va-approval-check">✓</span>
        <span class="va-approval-desc">${change.description}</span>
      </div>
    `).join('');

    modal.classList.add('va-approval-visible');
  }

  function hideApprovalModal() {
    document.getElementById('va-approval-modal').classList.remove('va-approval-visible');
  }

  function approveChanges() {
    const changes = [...pendingChanges];
    const changeIds = changes.map(c => c.id);

    fetch('/__visual-agent/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changeIds })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        editHistory.push(...changes);
        pendingChanges = [];
        updateChangesList();
        updateApplyButton();
        updateHistoryPanel();
        hideApprovalModal();
        showNotification(`${changes.length} change(s) applied to code!`, 'success');
      } else {
        showNotification('Failed to apply changes', 'error');
      }
    }).catch(err => {
      showNotification('Error: ' + err.message, 'error');
    });
  }

  function undo() {
    if (pendingChanges.length === 0) return;
    pendingChanges.pop();
    updateChangesList();
    updateApplyButton();
  }

  function redo() {
    showNotification('Redo not available for pending changes', 'info');
  }

  function updateHistoryPanel() {
    const container = document.getElementById('va-history');

    if (editHistory.length === 0) {
      container.innerHTML = '<span class="va-placeholder">No edits yet</span>';
      return;
    }

    container.innerHTML = editHistory.slice(-5).reverse().map(entry => `
      <div class="va-history-item">
        <span class="va-history-desc">${entry.description || 'Edit'}</span>
        <span class="va-history-time">${formatTime(entry.timestamp)}</span>
      </div>
    `).join('');
  }

  function formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    return Math.floor(diff / 3600000) + 'h ago';
  }

  function showNotification(message, type) {
    const notification = document.getElementById('va-notification');
    notification.textContent = message;
    notification.className = `va-notification va-notification-${type} va-notification-visible`;

    setTimeout(() => {
      notification.classList.remove('va-notification-visible');
    }, 3000);
  }
})();
