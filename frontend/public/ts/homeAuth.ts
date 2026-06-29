export {};

window.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn') as HTMLAnchorElement | null;
    const perfilBtn = document.getElementById('perfil-btn') as HTMLAnchorElement | null;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');

    if (perfilBtn) {
        perfilBtn.href = './perfil.html';
    }

    if (!authBtn) {
        return;
    }

    if (isLoggedIn) {
        authBtn.textContent = 'Logout';
        authBtn.href = '#';
        authBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
            window.location.href = './login.html';
        });
    } else {
        authBtn.textContent = 'Login';
        authBtn.href = './login.html';
    }

});