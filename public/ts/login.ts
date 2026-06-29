export {};

const backendCandidates = ['https://t2-inf1407-2026-back.onrender.com/'];

interface LoginResposta {
    username: string;
    access?: string;
    refresh?: string;
    [key: string]: unknown;
}

function getOrderedBackends(): string[] {
    const saved = localStorage.getItem('activeBackendAddress');

    if (!saved || !backendCandidates.includes(saved)) {
        return backendCandidates;
    }

    return [saved, ...backendCandidates.filter((host) => host !== saved)];
}

window.onload = () => {
    const form = document.getElementById('loginForm') as HTMLFormElement | null;
    const msg = document.getElementById('msg') as HTMLDivElement | null;

    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById('username') as HTMLInputElement | null;
        const passwordInput = document.getElementById('password') as HTMLInputElement | null;

        const username = usernameInput?.value.trim() ?? '';
        const password = passwordInput?.value ?? '';

        try {
            const loginResult = await login(username, password);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', loginResult.username);
            if (loginResult.access) {
                localStorage.setItem('accessToken', loginResult.access);
            }
            if (loginResult.refresh) {
                localStorage.setItem('refreshToken', loginResult.refresh);
            }
            window.location.href = './index.html';
        } catch (error) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (msg) {
                msg.textContent = error instanceof Error ? error.message : 'Usuário ou senha inválidos';
            }
        }
    });
};

async function login(username: string, password: string): Promise<LoginResposta> {
    let lastError = 'Login inválido';

    for (const backendAddress of getOrderedBackends()) {
        try {
            const response = await fetch(`${backendAddress}api/login/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = (await response.json().catch(() => ({}))) as LoginResposta & { detail?: string };

            if (!response.ok) {
                lastError = data.detail || 'Login inválido';
                continue;
            }

            localStorage.setItem('activeBackendAddress', backendAddress);
            return data;
        } catch (error) {
            lastError = 'Falha de rede ao tentar login.';
        }
    }

    throw new Error(lastError);
}