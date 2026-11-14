(function() {
    const sessionUser = localStorage.getItem('unifatix_user');
    const currentPath = window.location.pathname;

    if (!sessionUser) {
        if (!currentPath.includes('login.html') && !currentPath.includes('index.html')) {
            window.location.href = './login.html';
        }
        return;
    }

    const user = JSON.parse(sessionUser);

    // Proteção da página de Administração
    if (currentPath.includes('admin.html') && user.role !== 'admin') {
        alert('Acesso negado! Área restrita a administradores.');
        window.location.href = './index.html';
    }
})();