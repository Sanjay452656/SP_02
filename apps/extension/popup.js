document.addEventListener('DOMContentLoaded', () => {
  const jwtInput = document.getElementById('jwtToken');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load existing token
  chrome.storage.local.get(['jwtToken'], (result) => {
    if (result.jwtToken) {
      jwtInput.value = result.jwtToken;
    }
  });

  saveBtn.addEventListener('click', () => {
    const token = jwtInput.value.trim();
    chrome.storage.local.set({ jwtToken: token }, () => {
      statusDiv.style.display = 'block';
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    });
  });
});
