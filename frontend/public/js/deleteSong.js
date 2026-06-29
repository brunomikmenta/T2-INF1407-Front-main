const backendCandidates = ['https://t2-inf1407-2026-back.onrender.com/'];
function getOrderedBackends() {
    const saved = localStorage.getItem('activeBackendAddress');
    if (!saved || !backendCandidates.includes(saved)) {
        return backendCandidates;
    }
    return [saved, ...backendCandidates.filter((host) => host !== saved)];
}
async function apiFetch(path, options = {}) {
    const hosts = getOrderedBackends();
    let lastResponse = null;
    for (const backendAddress of hosts) {
        try {
            const response = await fetch(`${backendAddress}${path}`, {
                credentials: 'include',
                ...options,
            });
            lastResponse = response;
            if (response.ok) {
                localStorage.setItem('activeBackendAddress', backendAddress);
                return response;
            }
            if (response.status !== 401) {
                localStorage.setItem('activeBackendAddress', backendAddress);
                return response;
            }
        }
        catch (error) {
            // Try next host.
        }
    }
    if (lastResponse) {
        return lastResponse;
    }
    throw new Error('Falha de rede ao conectar no backend.');
}
function buildAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
}
function showFeedback(message, type = 'error') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    alert(message);
}
function parseQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
}
window.addEventListener('DOMContentLoaded', () => {
    const songId = parseQueryParam('songId');
    const deleteSongInfo = document.getElementById('delete-song-info');
    const deleteSongMessage = document.getElementById('delete-song-message');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    if (!songId) {
        if (deleteSongMessage) {
            deleteSongMessage.textContent = 'ID da música não informado.';
            deleteSongMessage.style.color = 'red';
        }
        return;
    }
    const setMessage = (text, color = 'white') => {
        if (!deleteSongMessage) {
            return;
        }
        deleteSongMessage.textContent = text;
        deleteSongMessage.style.color = color;
    };
    const loadSong = async () => {
        try {
            const response = await apiFetch('api/songlist/', {
                method: 'GET',
                headers: buildAuthHeaders(),
            });
            if (response.status === 401) {
                window.location.href = './login.html';
                return;
            }
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setMessage(data.detail || 'Nao foi possivel carregar a musica.', 'red');
                return;
            }
            const data = await response.json();
            const song = (data.songs || []).find((item) => String(item.id) === songId);
            if (!song) {
                setMessage('Musica nao encontrada.', 'red');
                return;
            }
            if (deleteSongInfo) {
                deleteSongInfo.innerHTML = `
                    <p>Tem certeza que deseja deletar a música <strong>${song.name}</strong> de ${song.artist}?</p>
                `;
            }
        }
        catch (error) {
            setMessage('Erro de rede ao carregar a musica.', 'red');
        }
    };
    confirmDeleteButton === null || confirmDeleteButton === void 0 ? void 0 : confirmDeleteButton.addEventListener('click', async () => {
        try {
            const response = await apiFetch(`api/songlist/${songId}/`, {
                method: 'DELETE',
                headers: buildAuthHeaders(),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                showFeedback(data.detail || 'Erro ao deletar a musica.', 'error');
                return;
            }
            showFeedback('Musica removida com sucesso.', 'success');
            window.location.href = './perfil.html';
        }
        catch (error) {
            showFeedback('Erro de rede ao deletar a musica.', 'error');
        }
    });
    loadSong();
});
export {};
