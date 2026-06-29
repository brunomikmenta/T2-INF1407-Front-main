const backendAddress = 'https://t2-inf1407-2026-back.onrender.com/';
window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario');
    const messageDiv = document.getElementById('message');
    if (!form || !messageDiv) {
        return;
    }
    form.addEventListener('submit', async (event) => {
        var _a;
        event.preventDefault();
        const emailInput = document.getElementById('email');
        const email = (_a = emailInput === null || emailInput === void 0 ? void 0 : emailInput.value.trim()) !== null && _a !== void 0 ? _a : '';
        if (!email) {
            messageDiv.textContent = 'Informe um e-mail valido.';
            messageDiv.style.color = 'red';
            return;
        }
        try {
            const response = await fetch(`${backendAddress}api/password-reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = (await response.json());
            if (!response.ok) {
                messageDiv.textContent = data.detail || 'Erro ao solicitar redefinicao de senha.';
                messageDiv.style.color = 'red';
                return;
            }
            const resetCode = data.reset_code;
            messageDiv.style.color = 'green';
            if (resetCode) {
                localStorage.setItem('resetToken', resetCode);
                messageDiv.textContent = 'Foi solicitado a recuperação de senha para sua conta.';
                setTimeout(() => {
                    window.location.href = './esqueceuSenhaReset.html';
                }, 1700);
            }
            else {
                messageDiv.textContent = 'Se o e-mail existir, a recuperacao foi iniciada.';
            }
        }
        catch (error) {
            messageDiv.textContent = `Erro de rede: ${error instanceof Error ? error.message : String(error)}`;
            messageDiv.style.color = 'red';
        }
    });
});
export {};
