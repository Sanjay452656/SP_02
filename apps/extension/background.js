// Background service worker - can fetch from localhost without mixed content restrictions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_QUESTION') {
    const { data, token } = message;

    fetch('https://sp-02.onrender.com/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(data)
    })
    .then(async (response) => {
      const body = await response.text();
      if (response.ok) {
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: `Server error (${response.status}): ${body.substring(0, 100)}` });
      }
    })
    .catch((err) => {
      sendResponse({ success: false, error: 'Fetch error: ' + err.message });
    });

    // Return true to keep the message channel open for async response
    return true;
  }
});
