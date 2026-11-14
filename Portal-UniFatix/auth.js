import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form') || document.getElementById('form-login');
    const errorBox = document.getElementById('error-message') || document.getElementById('login-error');

    if (!loginForm) {
        console.warn('Formulário de login não encontrado nesta página.');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password') || document.getElementById('senha');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (errorBox) {
            errorBox.classList.add('hidden');
            errorBox.textContent = '';
        }

        const originalBtnText = submitBtn ? submitBtn.textContent : 'Entrar no Sistema';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Autenticando...';
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            const role = data.user?.user_metadata?.role || 'aluno';

            if (role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (err) {
            console.error('Erro de autenticação:', err);
            const msg = err.message === 'Invalid login credentials'
                ? 'E-mail ou senha incorretos.'
                : `Erro ao entrar: ${err.message}`;

            if (errorBox) {
                errorBox.textContent = msg;
                errorBox.classList.remove('hidden');
            } else {
                alert(msg);
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
});