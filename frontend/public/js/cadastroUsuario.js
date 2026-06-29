const backendAddress = 'https://t2-inf1407-2026-back.onrender.com/';
function getCookie(name) {
    var _a, _b;
    const cookieValue = `; ${document.cookie}`;
    const parts = cookieValue.split(`; ${name}=`);
    if (parts.length === 2) {
        return (_b = (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift()) !== null && _b !== void 0 ? _b : '';
    }
    return '';
}
async function cadastrarUsuario(usuario) {
    const csrfToken = getCookie('csrftoken');
    const response = await fetch(`${backendAddress}api/users/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(usuario),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Falha ao cadastrar usuário: ${response.status}`);
    }
    return response;
}
const form = document.getElementById('cadastro-form');
if (form) {
    form.addEventListener('submit', async (event) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        event.preventDefault();
        const username = (_b = (_a = document.getElementById('username')) === null || _a === void 0 ? void 0 : _a.value.trim()) !== null && _b !== void 0 ? _b : '';
        const email = (_d = (_c = document.getElementById('email')) === null || _c === void 0 ? void 0 : _c.value.trim()) !== null && _d !== void 0 ? _d : '';
        const senha = (_f = (_e = document.getElementById('senha')) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : '';
        const confirmarSenha = (_h = (_g = document.getElementById('confirmar-senha')) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : '';
        if (senha !== confirmarSenha) {
            alert('As senhas não conferem.');
            return;
        }
        try {
            await cadastrarUsuario({
                username,
                email,
                senha,
            });
            alert('Usuário cadastrado com sucesso.');
            window.location.href = './login.html';
        }
        catch (error) {
            if (error instanceof TypeError) {
                alert('Erro ao cadastrar usuário: não foi possível conectar ao backend (porta 8000).');
                return;
            }
            alert(`Erro ao cadastrar usuário: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
export {};
