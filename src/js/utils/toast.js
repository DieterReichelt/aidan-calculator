// Lightweight transient toast/popup. Reuses a single shared element, shows a
// message for `duration` ms, then fades it out. No dependencies; safe text only
// (uses textContent, so no HTML injection).
let toastEl = null;
let hideTimer = null;

export function showToast(message, duration = 2500) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'app-toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;

  // Restart the fade-in even if a toast is already showing.
  toastEl.classList.remove('visible');
  void toastEl.offsetWidth; // force reflow so re-adding the class re-triggers the transition
  toastEl.classList.add('visible');

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toastEl.classList.remove('visible'), duration);
}
