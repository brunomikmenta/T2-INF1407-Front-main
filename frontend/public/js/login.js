const backendCandidates = ['https://t2-inf1407-2026-back.onrender.com/'];
function getOrderedBackends() {
    const saved = localStorage.getItem('activeBackendAddress');
    if (!saved || !backendCandidates.includes(saved)) {
        return backendCandidates;
    }
    return [saved, ...backendCandidates.filter((host) => host !== saved)];
}
window.onload = () => {
    const form = document.getElementById('loginForm');
    const msg = document.getElementById('msg');
    if (!form) {
        return;
    }
    form.addEventListener('submit', async (event) => {
        var _a, _b;
        event.preventDefault();
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const username = (_a = usernameInput === null || usernameInput === void 0 ? void 0 : usernameInput.value.trim()) !== null && _a !== void 0 ? _a : '';
        const password = (_b = passwordInput === null || passwordInput === void 0 ? void 0 : passwordInput.value) !== null && _b !== void 0 ? _b : '';
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
        }
        catch (error) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (msg) {
                msg.textContent = error instanceof Error ? error.message : 'Usuário ou senha inválidos';
            }
        }
    });
};
async function login(username, password) {
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
            const data = (await response.json().catch(() => ({})));
            if (!response.ok) {
                lastError = data.detail || 'Login inválido';
                continue;
            }
            localStorage.setItem('activeBackendAddress', backendAddress);
            return data;
        }
        catch (error) {
            lastError = 'Falha de rede ao tentar login.';
        }
    }
    throw new Error(lastError);
}
export {};
