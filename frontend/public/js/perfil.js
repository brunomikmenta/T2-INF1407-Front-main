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
    console.debug('[perfil] apiFetch', path, options);
    for (const backendAddress of hosts) {
        try {
            const response = await fetch(`${backendAddress}${path}`, {
                credentials: 'include',
                ...options,
            });
            console.debug('[perfil] fetch response', backendAddress, path, response.status, response.statusText);
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
            console.error('[perfil] fetch error', backendAddress, path, error);
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
function toggleElement(element, shouldShow) {
    if (!element) {
        return;
    }
    if (shouldShow) {
        element.classList.remove('is-hidden');
    }
    else {
        element.classList.add('is-hidden');
    }
}
window.addEventListener('DOMContentLoaded', () => {
    console.debug('[perfil] DOMContentLoaded');
    
    const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            window.location.href = './login.html';
            return;
        }

    const playlistView = document.getElementById('profile-playlist-view');
    const editView = document.getElementById('profile-edit-view');
    const btnShowPlaylist = document.getElementById('btn-show-playlist');
    const btnShowEdit = document.getElementById('btn-show-edit');
    const emptyState = document.getElementById('playlist-empty-state');
    const playlistTableWrapper = document.getElementById('playlist-table-wrapper');
    const playlistTableBody = document.getElementById('playlist-tbody');
    const playlistActions = document.getElementById('playlist-actions');
    const playlistCount = document.getElementById('playlist-count');
    const profileForm = document.getElementById('profile-form');
    const profileMessage = document.getElementById('profile-message');
    const sidebarUsername = document.getElementById('profile-username');
    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    const profileFirstNameInput = document.getElementById('profile-first-name');
    const profileLastNameInput = document.getElementById('profile-last-name');
    const profileGenderInput = document.getElementById('profile-gender');
    const setProfileMessage = (text, color = 'white') => {
        if (!profileMessage) {
            return;
        }
        profileMessage.textContent = text;
        profileMessage.style.color = color;
    };
    const setPanel = (panel) => {
        const isPlaylist = panel === 'playlist';
        toggleElement(playlistView, isPlaylist);
        toggleElement(editView, !isPlaylist);
        btnShowPlaylist === null || btnShowPlaylist === void 0 ? void 0 : btnShowPlaylist.classList.toggle('is-active', isPlaylist);
        btnShowEdit === null || btnShowEdit === void 0 ? void 0 : btnShowEdit.classList.toggle('is-active', !isPlaylist);
    };
    const renderPlaylistTable = (songs) => {
        if (!playlistTableBody || !playlistActions) {
            return;
        }
        playlistTableBody.innerHTML = '';
        playlistActions.innerHTML = '';
        if (!Array.isArray(songs) || songs.length === 0) {
            toggleElement(emptyState, true);
            toggleElement(playlistTableWrapper, false);
            return;
        }
        toggleElement(emptyState, false);
        toggleElement(playlistTableWrapper, true);
        if (songs.length < 5) {
            const addButton = document.createElement('a');
            addButton.className = 'btn btn-primary';
            addButton.textContent = 'Adicionar música';
            addButton.href = './criaLista.html';
            playlistActions.appendChild(addButton);
        }
        songs.forEach((song, index) => {
            const row = document.createElement('tr');
            const songId = song.id ? String(song.id) : '';
            row.innerHTML = `
                <td>#${song.slot || index + 1}</td>
                <td>${song.name || '-'}</td>
                <td>${song.artist || '-'}</td>
                <td>${song.gender || '-'}</td>
                <td>
                    <a href="./editSong.html?songId=${songId}">Editar</a>
                    <a href="./deleteSong.html?songId=${songId}">Deletar</a>
                </td>
            `;
            playlistTableBody.appendChild(row);
        });
    };
    const setProfileFields = (data) => {
        const username = data.username || '';
        const email = data.email || '';
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const gender = data.gender || '';
        if (profileNameInput)
            profileNameInput.value = username;
        if (profileEmailInput)
            profileEmailInput.value = email;
        if (profileFirstNameInput)
            profileFirstNameInput.value = firstName;
        if (profileLastNameInput)
            profileLastNameInput.value = lastName;
        if (profileGenderInput)
            profileGenderInput.value = gender;
        if (sidebarUsername)
            sidebarUsername.textContent = username || 'Usuário';
        if (username) {
            localStorage.setItem('username', username);
        }
    };
    const loadProfile = async () => {
        try {
            const profileResponse = await apiFetch('api/profile/', {
                method: 'GET',
                headers: buildAuthHeaders(),
            });
            
            if (profileResponse.status === 401) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('username');

                window.location.href = './login.html';
                return;
            }
            const data = await profileResponse.json();
            setProfileFields(data);
        }
        catch (error) {
            setProfileMessage('Nao foi possivel carregar seu perfil.', 'red');
        }
    };
    const loadPlaylist = async () => {
        try {
            const response = await apiFetch('api/songlist/', {
                method: 'GET',
                headers: buildAuthHeaders(),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                showFeedback(errorData.detail || 'Nao foi possivel carregar a songlist.', 'error');
                return;
            }
            const data = await response.json();
            renderPlaylistTable(data.songs || []);
        }
        catch (error) {
            showFeedback('Erro de rede ao carregar songlist.', 'error');
        }
    };
    btnShowPlaylist === null || btnShowPlaylist === void 0 ? void 0 : btnShowPlaylist.addEventListener('click', () => setPanel('playlist'));
    btnShowEdit === null || btnShowEdit === void 0 ? void 0 : btnShowEdit.addEventListener('click', () => setPanel('edit'));
    profileForm === null || profileForm === void 0 ? void 0 : profileForm.addEventListener('submit', async (event) => {
        var _a, _b, _c, _d;
        event.preventDefault();
        const payload = {
            username: ((_a = profileNameInput === null || profileNameInput === void 0 ? void 0 : profileNameInput.value) === null || _a === void 0 ? void 0 : _a.trim()) || '',
            email: ((_b = profileEmailInput === null || profileEmailInput === void 0 ? void 0 : profileEmailInput.value) === null || _b === void 0 ? void 0 : _b.trim()) || '',
            firstName: ((_c = profileFirstNameInput === null || profileFirstNameInput === void 0 ? void 0 : profileFirstNameInput.value) === null || _c === void 0 ? void 0 : _c.trim()) || '',
            lastName: ((_d = profileLastNameInput === null || profileLastNameInput === void 0 ? void 0 : profileLastNameInput.value) === null || _d === void 0 ? void 0 : _d.trim()) || '',
            gender: (profileGenderInput === null || profileGenderInput === void 0 ? void 0 : profileGenderInput.value) || '',
        };
        try {
            const response = await apiFetch('api/profile/', {
                method: 'PUT',
                headers: buildAuthHeaders(),
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setProfileMessage(data.detail || 'Erro ao salvar perfil.', 'red');
                return;
            }
            setProfileFields(data);
            setProfileMessage('Perfil atualizado com sucesso.', '#4ade80');
            showFeedback('Perfil atualizado com sucesso.', 'success');
        }
        catch (error) {
            setProfileMessage('Erro de rede ao salvar perfil.', 'red');
        }
    });
    setPanel('playlist');
    loadProfile();
    loadPlaylist();
});
export {};
