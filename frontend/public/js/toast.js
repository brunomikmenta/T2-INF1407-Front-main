const TOAST_STORAGE_KEY = 'appToastMessage';
function buildToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `app-toast app-toast--${type === 'success' ? 'success' : 'error'}`;
    toast.textContent = message;
    return toast;
}
function showToast(message, type = 'error') {
    if (!message) {
        return;
    }
    const existing = document.querySelector('.app-toast');
    if (existing) {
        existing.remove();
    }
    const toast = buildToast(message, type);
    document.body.appendChild(toast);
    window.setTimeout(() => {
        toast.remove();
    }, 4600);
}
function setFlashMessage(message, type = 'error') {
    if (!message) {
        return;
    }
    localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify({ message, type, timestamp: Date.now() }));
}
function consumeFlashMessage() {
    const raw = localStorage.getItem(TOAST_STORAGE_KEY);
    if (!raw) {
        return;
    }
    localStorage.removeItem(TOAST_STORAGE_KEY);
    try {
        const parsed = JSON.parse(raw);
        showToast(parsed.message, parsed.type);
    }
    catch (error) {
        // Ignore malformed data and avoid breaking the page.
    }
}
window.showToast = showToast;
window.setFlashMessage = setFlashMessage;
window.addEventListener('DOMContentLoaded', consumeFlashMessage);
export {};
