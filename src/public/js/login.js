document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('#loginForm');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const email = loginForm.querySelector('#email').value;
        const password = loginForm.querySelector('#password').value;

        const formData = { email, password };

        try {
            const response = await fetch('/api/auth/login', {  // Ajusta al endpoint correcto
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('authToken', data.token);  // Almacena el token
                window.location.href = '/products';  // Redirige a la página de productos o la página adecuada
            } else {
                const messageElement = document.getElementById('message');
                messageElement.textContent = data.error || 'Error al iniciar sesión';
            }
        } catch (error) {
            console.error('Error:', error);
            const messageElement = document.getElementById('message');
            messageElement.textContent = 'No se pudo iniciar sesión';
        }
    });

    const githubLoginButton = document.querySelector('#githubLogin');
    githubLoginButton.addEventListener('click', function() {
        window.location.href = '/api/auth/ghlogin';  // Ajusta la URL de GitHub si es necesario
    });

    document.getElementById('forgotPasswordBtn').addEventListener('click', function() {
        window.location.href = '/api/auth/forgot-password';  // Ajusta la URL si es necesario
    }); 
});