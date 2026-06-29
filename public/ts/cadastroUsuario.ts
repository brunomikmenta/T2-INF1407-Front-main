export {};

const backendAddress = 'https://t2-inf1407-2026-back.onrender.com/';

function getCookie(name: string): string {
    const cookieValue = `; ${document.cookie}`;
    const parts = cookieValue.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() ?? '';
    }

    return '';
}

interface UsuarioCadastro {
    username: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    email: string;
    senha: string;
}

async function cadastrarUsuario(usuario: UsuarioCadastro): Promise<Response> {
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

const form = document.getElementById('cadastro-form') as HTMLFormElement | null;

if (form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = (document.getElementById('username') as HTMLInputElement | null)?.value.trim() ?? '';
        const email = (document.getElementById('email') as HTMLInputElement | null)?.value.trim() ?? '';
        const senha = (document.getElementById('senha') as HTMLInputElement | null)?.value ?? '';
        const confirmarSenha = (document.getElementById('confirmar-senha') as HTMLInputElement | null)?.value ?? '';

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
        } catch (error) {
            if (error instanceof TypeError) {
                alert('Erro ao cadastrar usuário: não foi possível conectar ao backend (porta 8000).');
                return;
            }

            alert(`Erro ao cadastrar usuário: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}