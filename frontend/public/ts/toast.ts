export {};

const TOAST_STORAGE_KEY = 'appToastMessage';

interface ToastPayload {
    message: string;
    type: string;
    timestamp: number;
}

function buildToast(message: string, type: string = 'error'): HTMLDivElement {
    const toast = document.createElement('div');
    toast.className = `app-toast app-toast--${type === 'success' ? 'success' : 'error'}`;
    toast.textContent = message;
    return toast;
}

function showToast(message: string, type: string = 'error'): void {
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

function setFlashMessage(message: string, type: string = 'error'): void {
    if (!message) {
        return;
    }

    localStorage.setItem(
        TOAST_STORAGE_KEY,
        JSON.stringify({ message, type, timestamp: Date.now() })
    );
}

function consumeFlashMessage(): void {
    const raw = localStorage.getItem(TOAST_STORAGE_KEY);

    if (!raw) {
        return;
    }

    localStorage.removeItem(TOAST_STORAGE_KEY);

    try {
        const parsed = JSON.parse(raw) as ToastPayload;
        showToast(parsed.message, parsed.type);
    } catch (error) {
        // Ignore malformed data and avoid breaking the page.
    }
}

(window as Window & typeof globalThis & { showToast?: typeof showToast; setFlashMessage?: typeof setFlashMessage }).showToast = showToast;
(window as Window & typeof globalThis & { showToast?: typeof showToast; setFlashMessage?: typeof setFlashMessage }).setFlashMessage = setFlashMessage;

window.addEventListener('DOMContentLoaded', consumeFlashMessage);