const backendAddress = 'https://t2-inf1407-2026-back.onrender.com/';
window.addEventListener('load', () => {
    const form = document.getElementById('formResetSenha');
    const senhaInput = document.getElementById('novaSenha');
    const confirmarInput = document.getElementById('confirmarSenha');
    const message = document.getElementById('message');
    if (!form || !senhaInput || !confirmarInput || !message) {
        return;
    }
    const token = localStorage.getItem('resetToken');
    if (!token) {
        message.textContent = 'Token de redefinicao nao encontrado. Solicite um novo.';
        message.style.color = 'red';
        setTimeout(() => {
            window.location.href = './esqueceuSenha.html';
        }, 2000);
        return;
    }
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const senha = senhaInput.value;
        const senha2 = confirmarInput.value;
        if (senha !== senha2) {
            message.textContent = 'As senhas nao coincidem.';
            message.style.color = 'red';
            return;
        }
        try {
            const response = await fetch(`${backendAddress}api/password-reset/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: token,
                    new_password: senha,
                }),
            });
            const data = (await response.json());
            if (!response.ok) {
                message.textContent = data.detail || 'Erro ao alterar a senha.';
                message.style.color = 'red';
                return;
            }
            localStorage.removeItem('resetToken');
            message.textContent = 'Senha alterada com sucesso! Redirecionando para o login...';
            message.style.color = 'green';
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1700);
        }
        catch (error) {
            message.textContent = `Erro de rede: ${error instanceof Error ? error.message : String(error)}`;
            message.style.color = 'red';
        }
    });
});
export {};
