document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error-message');
    errorMsg.style.display = 'none';

    try {
        // Autenticação real com o Supabase Auth
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        const user = data.user;
        
        // Extrai perfil (Role) do user_metadata ou define padrão 'aluno'
        const userRole = user.user_metadata?.role || 'aluno';
        const userName = user.user_metadata?.name || user.email.split('@')[0];

        const userData = {
            id: user.id,
            email: user.email,
            name: userName,
            role: userRole,
            token: data.session.access_token
        };

        // Salva os dados da sessão localmente
        localStorage.setItem('unifatix_user', JSON.stringify(userData));

        // Redirecionamento baseado no perfil (RBAC)
        if (userData.role === 'admin') {
            window.location.href = './admin.html';
        } else {
            window.location.href = './index.html';
        }

    } catch (error) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Erro ao entrar: ' + (error.message || 'Credenciais inválidas.');
    }
});