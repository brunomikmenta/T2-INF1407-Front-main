export {};

const backendCandidates = ['https://t2-inf1407-2026-back.onrender.com/'];

declare global {
    interface Window {
        showToast?: (message: string, type?: string) => void;
    }
}

interface Song {
    slot?: number;
    id?: string | number;
    name?: string;
    artist?: string;
    gender?: string;
}

interface ProfilePayload {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
}

function getOrderedBackends(): string[] {
    const saved = localStorage.getItem('activeBackendAddress');

    if (!saved || !backendCandidates.includes(saved)) {
        return backendCandidates;
    }

    return [saved, ...backendCandidates.filter((host) => host !== saved)];
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const hosts = getOrderedBackends();
    let lastResponse: Response | null = null;

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
        } catch (error) {
            console.error('[perfil] fetch error', backendAddress, path, error);
            // Try next host.
        }
    }

    if (lastResponse) {
        return lastResponse;
    }

    throw new Error('Falha de rede ao conectar no backend.');
}

function buildAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
}

function showFeedback(message: string, type: string = 'error'): void {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }

    alert(message);
}

function toggleElement(element: HTMLElement | null, shouldShow: boolean): void {
    if (!element) {
        return;
    }

    if (shouldShow) {
        element.classList.remove('is-hidden');
    } else {
        element.classList.add('is-hidden');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    console.debug('[perfil] DOMContentLoaded');
    const playlistView = document.getElementById('profile-playlist-view') as HTMLElement | null;
    const editView = document.getElementById('profile-edit-view') as HTMLElement | null;
    const btnShowPlaylist = document.getElementById('btn-show-playlist') as HTMLButtonElement | null;
    const btnShowEdit = document.getElementById('btn-show-edit') as HTMLButtonElement | null;

    const emptyState = document.getElementById('playlist-empty-state') as HTMLElement | null;
    const playlistTableWrapper = document.getElementById('playlist-table-wrapper') as HTMLElement | null;
    const playlistTableBody = document.getElementById('playlist-tbody') as HTMLTableSectionElement | null;

    const playlistActions = document.getElementById('playlist-actions') as HTMLElement | null;
    const playlistCount = document.getElementById('playlist-count') as HTMLElement | null;
    const profileForm = document.getElementById('profile-form') as HTMLFormElement | null;
    const profileMessage = document.getElementById('profile-message') as HTMLElement | null;
    const sidebarUsername = document.getElementById('profile-username') as HTMLElement | null;

    const profileNameInput = document.getElementById('profile-name') as HTMLInputElement | null;
    const profileEmailInput = document.getElementById('profile-email') as HTMLInputElement | null;
    const profileFirstNameInput = document.getElementById('profile-first-name') as HTMLInputElement | null;
    const profileLastNameInput = document.getElementById('profile-last-name') as HTMLInputElement | null;
    const profileGenderInput = document.getElementById('profile-gender') as HTMLInputElement | null;

    const setProfileMessage = (text: string, color: string = 'white'): void => {
        if (!profileMessage) {
            return;
        }

        profileMessage.textContent = text;
        profileMessage.style.color = color;
    };

    const setPanel = (panel: 'playlist' | 'edit'): void => {
        const isPlaylist = panel === 'playlist';

        toggleElement(playlistView, isPlaylist);
        toggleElement(editView, !isPlaylist);

        btnShowPlaylist?.classList.toggle('is-active', isPlaylist);
        btnShowEdit?.classList.toggle('is-active', !isPlaylist);
    };

    const renderPlaylistTable = (songs: Song[]): void => {
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
                    <a class="btn btn-warning" href="./editSong.html?songId=${songId}">Editar</a>
                    <a class="btn btn-danger" href="./deleteSong.html?songId=${songId}">Deletar</a>
                </td>
            `;
            playlistTableBody.appendChild(row);
        });
    };

    const setProfileFields = (data: { username?: string; email?: string; firstName?: string; lastName?: string; gender?: string }): void => {
        const username = data.username || '';
        const email = data.email || '';
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const gender = data.gender || '';

        if (profileNameInput) profileNameInput.value = username;
        if (profileEmailInput) profileEmailInput.value = email;
        if (profileFirstNameInput) profileFirstNameInput.value = firstName;
        if (profileLastNameInput) profileLastNameInput.value = lastName;
        if (profileGenderInput) profileGenderInput.value = gender;
        if (sidebarUsername) sidebarUsername.textContent = username || 'Usuário';

        if (username) {
            localStorage.setItem('username', username);
        }
    };

    const loadProfile = async (): Promise<void> => {
        try {
            const profileResponse = await apiFetch('api/profile/', {
                method: 'GET',
                headers: buildAuthHeaders(),
            });

            if (!profileResponse.ok) {
                localStorage.removeItem('isLoggedIn');
                setProfileMessage('Sessao expirada. Faca login novamente.', 'red');
                showFeedback('Sessao expirada. Faca login novamente.', 'error');
                return;
            }

            const data = await profileResponse.json();
            setProfileFields(data);
        } catch (error) {
            setProfileMessage('Nao foi possivel carregar seu perfil.', 'red');
        }
    };

    const loadPlaylist = async (): Promise<void> => {
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
        } catch (error) {
            showFeedback('Erro de rede ao carregar songlist.', 'error');
        }
    };

    btnShowPlaylist?.addEventListener('click', () => setPanel('playlist'));
    btnShowEdit?.addEventListener('click', () => setPanel('edit'));

    profileForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload: ProfilePayload = {
            username: profileNameInput?.value?.trim() || '',
            email: profileEmailInput?.value?.trim() || '',
            firstName: profileFirstNameInput?.value?.trim() || '',
            lastName: profileLastNameInput?.value?.trim() || '',
            gender: profileGenderInput?.value || '',
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
        } catch (error) {
            setProfileMessage('Erro de rede ao salvar perfil.', 'red');
        }
    });

    setPanel('playlist');
    loadProfile();
    loadPlaylist();
});