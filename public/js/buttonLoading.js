export const setButtonLoading = (button, loadingText) => {
  if (!button) return;

  button.dataset.originalText = button.textContent.trim();
  button.disabled = true;
  button.classList.add('btn--loading');
  button.innerHTML = `
        <span class="btn__spinner" aria-hidden="true"></span>
        <span>${loadingText}</span>
    `;
};

export const resetButtonLoading = (button) => {
  if (!button) return;

  button.disabled = false;
  button.classList.remove('btn--loading');

  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
};
