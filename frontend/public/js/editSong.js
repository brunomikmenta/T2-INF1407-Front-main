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
    const songNameInput = document.getElementById('song-name');
    const songArtistInput = document.getElementById('song-artist');
    const songGenderSelect = document.getElementById('song-gender');
    const editSongMessage = document.getElementById('edit-song-message');
    const editSongForm = document.getElementById('edit-song-form');
    if (!songId) {
        if (editSongMessage) {
            editSongMessage.textContent = 'ID da música não informado.';
            editSongMessage.style.color = 'red';
        }
        return;
    }
    const setMessage = (text, color = 'white') => {
        if (!editSongMessage) {
            return;
        }
        editSongMessage.textContent = text;
        editSongMessage.style.color = color;
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
            if (songNameInput)
                songNameInput.value = song.name || '';
            if (songArtistInput)
                songArtistInput.value = song.artist || '';
            if (songGenderSelect)
                songGenderSelect.value = song.gender || '';
        }
        catch (error) {
            setMessage('Erro de rede ao carregar a musica.', 'red');
        }
    };
    editSongForm === null || editSongForm === void 0 ? void 0 : editSongForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = (songNameInput === null || songNameInput === void 0 ? void 0 : songNameInput.value.trim()) || '';
        const artist = (songArtistInput === null || songArtistInput === void 0 ? void 0 : songArtistInput.value.trim()) || '';
        const gender = (songGenderSelect === null || songGenderSelect === void 0 ? void 0 : songGenderSelect.value) || '';
        if (!name || !artist || !gender) {
            showFeedback('Preencha nome, artista e genero.', 'error');
            return;
        }
        try {
            const response = await apiFetch(`api/songlist/${songId}/`, {
                method: 'PUT',
                headers: buildAuthHeaders(),
                body: JSON.stringify({ name, artist, gender }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                showFeedback(data.detail || 'Erro ao atualizar a musica.', 'error');
                return;
            }
            showFeedback('Musica atualizada com sucesso.', 'success');
            window.location.href = './perfil.html';
        }
        catch (error) {
            showFeedback('Erro de rede ao atualizar a musica.', 'error');
        }
    });
    loadSong();
});
export {};
