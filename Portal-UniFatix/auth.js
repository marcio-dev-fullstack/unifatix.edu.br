document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error-message');

    // Exemplo de validação básica / integração (substitua pela chamada real à API/Supabase)
    if (email && password) {
        // Mock de usuário simulando perfil de Administrador ou Aluno
        let userRole = 'aluno';
        let userName = 'Estudante UniFATIX';

        if (email.includes('admin') || email.includes('gestor')) {
            userRole = 'admin';
            userName = 'Administrador Sistema';
        }

        const userData = {
            name: userName,
            email: email,
            role: userRole,
            token: 'token-jwt-simulado-123456'
        };

        // Salva os dados da sessão
        localStorage.setItem('unifatix_user', JSON.stringify(userData));

        // Redirecionamento baseado no perfil (RBAC)
        if (userData.role === 'admin') {
            window.location.href = './admin.html';
        } else {
            window.location.href = './index.html';
        }
    } else {
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Por favor, preencha todos os campos.';
    }
});