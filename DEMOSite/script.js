document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    const pageTransition = document.getElementById('page-transition');

    // Correct credentials
    const correctUsername = "VerifEye";
    const correctPassword = "HookHunters";

    // Add button click animation
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });

        loginBtn.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === correctUsername && password === correctPassword) {
            // Show success message first
            errorMessage.textContent = "Authentication successful! Redirecting...";
            errorMessage.style.color = "#28a745";

            // Animate the login button
            loginBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
            loginBtn.style.background = 'linear-gradient(to right, #28a745, #20c997)';

            // Trigger page transition effect
            setTimeout(() => {
                pageTransition.classList.add('active');

                // Redirect after transition completes
                setTimeout(() => {
                    window.location.href = "danger_enhanced.html";
                }, 500);
            }, 800);
        } else {
            // Shake effect for error
            loginForm.classList.add('shake');
            setTimeout(() => {
                loginForm.classList.remove('shake');
            }, 500);

            // Show error message
            errorMessage.textContent = "Invalid username or password. Please try again.";
            errorMessage.style.color = "#ff3333";

            // Clear password field
            document.getElementById('password').value = '';
        }
    });

    // Add shake animation for error
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .shake {
            animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
    `;
    document.head.appendChild(style);
});