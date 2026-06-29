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
    console.debug('[criaLista] apiFetch', path, options);
    for (const backendAddress of hosts) {
        try {
            const response = await fetch(`${backendAddress}${path}`, {
                credentials: 'include',
                ...options,
            });
            console.debug('[criaLista] fetch response', backendAddress, path, response.status, response.statusText);
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
            console.error('[criaLista] fetch error', backendAddress, path, error);
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
async function safeParseJson(response) {
    try {
        return await response.json();
    }
    catch (_a) {
        const text = await response.text().catch(() => '');
        return text ? { detail: text } : undefined;
    }
}
function toggleElement(element, isVisible) {
    if (!element) {
        return;
    }
    if (isVisible) {
        element.classList.remove('d-none');
    }
    else {
        element.classList.add('d-none');
    }
}
window.addEventListener('DOMContentLoaded', () => {
    console.debug('[criaLista] DOMContentLoaded');
    const title = document.getElementById('page-title');
    const songSlots = document.getElementById('song-slots');
    const createListMessage = document.getElementById('create-list-message');
    const playlistForm = document.getElementById('create-playlist-form');
    if (!songSlots || !playlistForm || !createListMessage) {
        console.error('[criaLista] missing DOM element', {
            songSlots: !!songSlots,
            playlistForm: !!playlistForm,
            createListMessage: !!createListMessage,
        });
        return;
    }
    const setMessage = (text, color = 'white') => {
        if (!createListMessage) {
            return;
        }
        createListMessage.textContent = text;
        createListMessage.style.color = color;
    };
    const buildRow = (song, index) => {
        const slot = index + 1;
        return `
            <div class="profile-form-grid create-song-row">
                <h3>Música ${slot}</h3>
                <label>
                    Nome
                    <input type="text" class="form-control" name="song-name-${index}" value="${song.name}" required>
                </label>
                <label>
                    Artista
                    <input type="text" class="form-control" name="song-artist-${index}" value="${song.artist}" required>
                </label>
                <label>
                    Gênero
                    <input type="text" class="form-control" name="song-gender-${index}" value="${song.gender}" required>
                </label>
            </div>
        `;
    };
    const renderForm = (songs) => {
        if (!songSlots) {
            return;
        }
        const listLength = songs.length;
        const headerText = listLength === 0 ? 'Crie sua lista de 5 músicas' : 'Complete sua lista com 5 músicas';
        if (title) {
            title.textContent = headerText;
        }
        const paddedSongs = [...songs];
        while (paddedSongs.length < 5) {
            paddedSongs.push({ name: '', artist: '', gender: '' });
        }
        songSlots.innerHTML = paddedSongs.map(buildRow).join('');
        if (listLength > 0 && listLength < 5) {
            setMessage(`Sua playlist atual tem ${listLength} música${listLength === 1 ? '' : 's'}. Preencha os campos restantes para completar a lista.`, 'white');
        }
        else {
            setMessage('', 'white');
        }
    };
    const loadSonglist = async () => {
        console.debug('[criaLista] loadSonglist');
        try {
            const response = await apiFetch('api/songlist/', {
                method: 'GET',
                headers: buildAuthHeaders(),
            });
            console.debug('[criaLista] loadSonglist response', response.status, response.statusText);
            if (response.status === 401) {
                window.location.href = './login.html';
                return;
            }
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setMessage(data.detail || 'Nao foi possivel carregar a lista.', 'red');
                return;
            }
            const data = await response.json();
            renderForm(data.songs || []);
        }
        catch (error) {
            console.error('[criaLista] loadSonglist error', error);
            setMessage('Erro de rede ao carregar a lista.', 'red');
        }
    };
    const getSongsFromForm = () => {
        const songs = [];
        for (let index = 0; index < 5; index += 1) {
            const nameInput = document.querySelector(`input[name="song-name-${index}"]`);
            const artistInput = document.querySelector(`input[name="song-artist-${index}"]`);
            const genderInput = document.querySelector(`input[name="song-gender-${index}"]`);
            songs.push({
                name: (nameInput === null || nameInput === void 0 ? void 0 : nameInput.value.trim()) || '',
                artist: (artistInput === null || artistInput === void 0 ? void 0 : artistInput.value.trim()) || '',
                gender: (genderInput === null || genderInput === void 0 ? void 0 : genderInput.value.trim()) || '',
            });
        }
        return songs;
    };
    playlistForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const songs = getSongsFromForm();
        console.debug('[criaLista] submit songs', songs);
        const hasEmpty = songs.some((song) => !song.name || !song.artist || !song.gender);
        if (hasEmpty) {
            showFeedback('Preencha todas as colunas para cada uma das 5 músicas.', 'error');
            setMessage('Preencha todas as colunas para cada uma das 5 músicas.', 'red');
            return;
        }
        try {
            const response = await apiFetch('api/songlist/', {
                method: 'POST',
                headers: buildAuthHeaders(),
                body: JSON.stringify({ songs }),
            });
            console.debug('[criaLista] submit response', response.status, response.statusText);
            const data = (await safeParseJson(response)) || {};
            if (!response.ok) {
                showFeedback(data.detail || 'Erro ao salvar a playlist.', 'error');
                setMessage(data.detail || 'Erro ao salvar a playlist.', 'red');
                if (response.status === 401) {
                    window.location.href = './login.html';
                }
                return;
            }
            showFeedback('Playlist salva com sucesso.', 'success');
            window.location.href = './perfil.html';
        }
        catch (error) {
            console.error('[criaLista] submit error', error);
            showFeedback('Erro de rede ao salvar a playlist.', 'error');
            setMessage('Erro de rede ao salvar a playlist.', 'red');
        }
    });
    loadSonglist();
});
export {};
