let popupInjected = false;

function injectPopup() {
  if (popupInjected) return;
  popupInjected = true;

  // Try to parse title from window title "Two Sum - LeetCode"
  let problemTitle = document.title.split(' - ')[0] || 'Unknown Problem';
  let problemLink = window.location.href.split('/submissions/')[0]; // clean up URL

  const overlay = document.createElement('div');
  overlay.id = 'lc-tracker-overlay';

  overlay.innerHTML = `
    <div id="lc-tracker-header">
      <span>🎯 Track this Problem</span>
      <button id="lc-tracker-close">×</button>
    </div>
    <div id="lc-tracker-body">
      <div class="lc-tracker-form-group">
        <label>Title</label>
        <input type="text" id="lc-tracker-title" class="lc-tracker-input" value="${problemTitle}">
      </div>
      <div class="lc-tracker-form-group">
        <label>Difficulty</label>
        <select id="lc-tracker-difficulty" class="lc-tracker-input">
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>
      <div class="lc-tracker-form-group">
        <label>Topic / Pattern</label>
        <input type="text" id="lc-tracker-pattern" class="lc-tracker-input" placeholder="e.g. Sliding Window">
      </div>
      <div class="lc-tracker-form-group">
        <label>Key Insights / Notes</label>
        <textarea id="lc-tracker-notes" class="lc-tracker-input" rows="3" placeholder="What was the trick?"></textarea>
      </div>
      <div class="lc-tracker-form-group">
        <label>Confidence (1-5)</label>
        <input type="number" id="lc-tracker-confidence" class="lc-tracker-input" min="1" max="5" value="3">
      </div>
      
      <button id="lc-tracker-btn">Save to Tracker</button>
      <div id="lc-tracker-status"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('lc-tracker-close').addEventListener('click', () => {
    overlay.remove();
    popupInjected = false;
  });

  document.getElementById('lc-tracker-btn').addEventListener('click', async () => {
    const btn = document.getElementById('lc-tracker-btn');
    const statusDiv = document.getElementById('lc-tracker-status');
    
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const data = {
      title: document.getElementById('lc-tracker-title').value,
      problemLink: problemLink,
      difficulty: document.getElementById('lc-tracker-difficulty').value,
      topic: document.getElementById('lc-tracker-pattern').value || 'General',
      pattern: document.getElementById('lc-tracker-pattern').value,
      notes: document.getElementById('lc-tracker-notes').value,
      confidenceLevel: parseInt(document.getElementById('lc-tracker-confidence').value),
      platform: 'LeetCode'
    };

    chrome.storage.local.get(['jwtToken'], (result) => {
      const token = result.jwtToken;
      if (!token) {
        statusDiv.style.color = 'red';
        statusDiv.textContent = 'Error: JWT token not set in extension popup.';
        btn.textContent = 'Save to Tracker';
        btn.disabled = false;
        return;
      }

      // Send to background service worker which can fetch from localhost without restrictions
      chrome.runtime.sendMessage({ type: 'SAVE_QUESTION', data, token }, (response) => {
        if (response && response.success) {
          statusDiv.style.color = '#10b981';
          statusDiv.textContent = '✅ Successfully saved!';
          setTimeout(() => {
            overlay.remove();
            popupInjected = false;
          }, 2000);
        } else {
          statusDiv.style.color = 'red';
          statusDiv.textContent = response?.error || 'Unknown error occurred.';
          btn.textContent = 'Save to Tracker';
          btn.disabled = false;
        }
      });
    });
  });
}

// Observe the DOM for the "Accepted" text
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      const text = mutation.target.textContent || '';
      // A simple heuristic for LeetCode's success state
      if (text.includes('Accepted') && document.querySelector('[data-e2e-locator="submission-result"]')) {
        injectPopup();
        break;
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Also inject a manual floating button just in case auto-detect fails
function injectManualButton() {
  const manualBtn = document.createElement('button');
  manualBtn.textContent = '🧠';
  manualBtn.title = 'Add to Spaced Repetition Tracker';
  manualBtn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background-color: #4f46e5;
    color: white;
    font-size: 24px;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    cursor: pointer;
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  manualBtn.addEventListener('click', () => injectPopup());
  document.body.appendChild(manualBtn);
}

injectManualButton();
