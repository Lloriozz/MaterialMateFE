// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const loginButton = document.querySelector('.btn-login');

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        // Get form values
        const username = usernameField.value.trim();
        const password = passwordField.value.trim();
        
        // Basic validation
        if (!username) {
            alert('Please enter your username, email or phone number');
            usernameField.focus();
            return;
        }
        
        if (!password) {
            alert('Please enter your password');
            passwordField.focus();
            return;
        }
        
        // Show loading state
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...';
        
        // Simulate login process (replace with actual authentication)
        setTimeout(() => {
            // For demo purposes, accept any non-empty credentials
            // In real application, you would validate against your backend
            if (username && password) {
                // Success - redirect to home.html
                window.location.href = 'home.html';
            } else {
                // Reset button state
                loginButton.disabled = false;
                loginButton.innerHTML = 'Log in';
                alert('Invalid username or password');
            }
        }, 1000);
    });

    // Handle "Forgot password?" link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Forgot password functionality would be implemented here');
    });

    // Handle Enter key navigation
    usernameField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordField.focus();
        }
    });

    passwordField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginButton.click();
        }
    });

    // Social media links functionality
    document.querySelectorAll('.social-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const iconClass = this.querySelector('i').className;
            if (iconClass.includes('linkedin')) {
                window.open('https://linkedin.com', '_blank');
            } else if (iconClass.includes('facebook')) {
                window.open('https://facebook.com', '_blank');
            } else if (iconClass.includes('twitter')) {
                window.open('https://twitter.com', '_blank');
            } else if (iconClass.includes('instagram')) {
                window.open('https://instagram.com', '_blank');
            }
        });
    });
});