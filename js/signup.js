// API Base URL - Update this to match your Spring Boot server
const API_BASE_URL = 'http://localhost:8080/mm'; // Change this to your actual server URL

// Form validation and handling
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('termsAccept');

    // Real-time validation on input
    usernameField.addEventListener('input', validateUsername);
    usernameField.addEventListener('blur', checkUsernameAvailability);
    passwordField.addEventListener('input', validatePassword);
    passwordField.addEventListener('blur', validatePassword);
    confirmPasswordField.addEventListener('input', validateConfirmPassword);
    confirmPasswordField.addEventListener('blur', validateConfirmPassword);
    termsCheckbox.addEventListener('change', validateTerms);

    // Form submission
    signupForm.addEventListener('submit', handleFormSubmission);

    // Username validation (basic client-side validation)
    function validateUsername() {
        const username = usernameField.value.trim();
        
        // Clear previous validation
        clearFieldValidation(usernameField);
        
        if (!username) {
            showFieldError(usernameField, 'Username is required');
            return false;
        }
        
        if (username.length < 3) {
            showFieldError(usernameField, 'Username must be at least 3 characters long');
            return false;
        }
        
        if (username.length > 20) {
            showFieldError(usernameField, 'Username must be less than 20 characters');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showFieldError(usernameField, 'Username can only contain letters, numbers, and underscores');
            return false;
        }
        
        return true;
    
    }


    async function checkUsernameAvailability() {
        const username = usernameField.value.trim();
        
        clearFieldValidation(usernameField);
        
        if (!validateUsername()) {
            return false;
        }
    
        try {
            const response = await fetch(
                `${API_BASE_URL}/students/check-username?username=${encodeURIComponent(username)}`
            );
    
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }
    
            const exists = await response.json();
            
            if (exists) {
                showFieldError(usernameField, 'Username already exists. Please choose another one.');
                return false;
            }
            
            showFieldSuccess(usernameField);
            return true;
    
        } catch (error) {
            console.error('Username check error:', error);
            showFieldError(usernameField, 'Unable to verify username availability. Please try again.');
            return false;
        }
    }

    // Password validation
    function validatePassword() {
        const password = passwordField.value;
        
        // Clear previous validation
        clearFieldValidation(passwordField);
        
        if (!password) {
            showFieldError(passwordField, 'Password is required');
            return false;
        }
        
        if (password.length < 8) {
            showFieldError(passwordField, 'Password must be at least 8 characters long');
            return false;
        }
        
        if (password.length > 128) {
            showFieldError(passwordField, 'Password must be less than 128 characters');
            return false;
        }
        
        // Check password strength
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!hasUpperCase) {
            showFieldError(passwordField, 'Password must contain at least one uppercase letter');
            return false;
        }
        
        if (!hasLowerCase) {
            showFieldError(passwordField, 'Password must contain at least one lowercase letter');
            return false;
        }
        
        if (!hasNumbers) {
            showFieldError(passwordField, 'Password must contain at least one number');
            return false;
        }
        
        if (!hasSpecialChar) {
            showFieldError(passwordField, 'Password must contain at least one special character');
            return false;
        }
        
        // Check for common weak passwords
        const commonPasswords = ['password', '12345678', 'qwerty123', 'abc123456', 'password123'];
        if (commonPasswords.includes(password.toLowerCase())) {
            showFieldError(passwordField, 'Password is too common. Please choose a stronger password');
            return false;
        }
        
        showFieldSuccess(passwordField);
        
        // Re-validate confirm password if it has a value
        if (confirmPasswordField.value) {
            validateConfirmPassword();
        }
        
        return true;
    }

    // Confirm password validation
    function validateConfirmPassword() {
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        
        // Clear previous validation
        clearFieldValidation(confirmPasswordField);
        
        if (!confirmPassword) {
            showFieldError(confirmPasswordField, 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            showFieldError(confirmPasswordField, 'Passwords do not match');
            return false;
        }
        
        showFieldSuccess(confirmPasswordField);
        return true;
    }

    // Terms validation
    function validateTerms() {
        const errorMessage = document.querySelector('.terms-error');
        
        // Remove existing error message
        if (errorMessage) {
            errorMessage.remove();
        }
        
        if (!termsCheckbox.checked) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'terms-error text-danger mt-2';
            errorDiv.textContent = 'You must accept the Terms of Service and Privacy Policy to continue';
            termsCheckbox.closest('.form-check').appendChild(errorDiv);
            return false;
        }
        
        return true;
    }


    // Handle form submission
    async function handleFormSubmission(e) {
        e.preventDefault();

        // Get form values
        const username = usernameField.value.trim();
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;

        // Validate all fields
        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const isTermsValid = validateTerms();

        if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsValid) {
            showErrorMessage('Please fix the errors above and try again.');
            const firstInvalidField = signupForm.querySelector('.is-invalid');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }

        // Check username availability one more time before submission
        const isUsernameAvailable = await checkUsernameAvailability();
        if (!isUsernameAvailable) {
            showErrorMessage('Username is not available. Please choose a different username.');
            usernameField.focus();
            return;
        }

        // Show loading state
        const submitButton = signupForm.querySelector('.btn-signup');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;

        try {
            const student = await createStudentAccount(username, password);
            
            // Show success message
            showSuccessMessage('Account created successfully! Redirecting to login...');
            
            // Redirect to login page after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            // Handle specific error cases
            if (error.message.toLowerCase().includes('username already exists')) {
                showFieldError(usernameField, 'Username already exists. Please choose another one.');
                showErrorMessage('Username already exists. Please choose a different username.');
                usernameField.focus();
            } else {
                showErrorMessage(`Failed to create account: ${error.message}`);
            }
        
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    }

    // CREATE STUDENT ACCOUNT
    async function createStudentAccount(username, password) {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
    }

    // Show field error
    function showFieldError(field, message) {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }

    // Show field success
    function showFieldSuccess(field) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    }

    // Clear field validation
    function clearFieldValidation(field) {
        field.classList.remove('is-invalid', 'is-valid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    }

    // Show error message
    function showErrorMessage(message) {
        hideErrorMessage(); // Remove existing message
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger error-message-alert';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
        `;
        
        const titleDiv = signupForm.closest('.col-md-6, .col-lg-5, .col-xl-4').querySelector('.text-center');
        titleDiv.appendChild(errorDiv);
        
        // Auto-hide after 5 seconds
        autoHideMessage(errorDiv);
    }

    // Hide error message
    function hideErrorMessage() {
        const existingError = document.querySelector('.error-message-alert');
        if (existingError) {
            existingError.remove();
        }
    }

    // Show success message
    function showSuccessMessage(message) {
        hideErrorMessage(); // Remove any error messages
        
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${message}
        `;
        
        const titleDiv = signupForm.closest('.col-md-6, .col-lg-5, .col-xl-4').querySelector('.text-center');
        titleDiv.appendChild(successDiv);
        
        // Hide the original error message
        const originalError = titleDiv.querySelector('.error-message');
        if (originalError) {
            originalError.style.display = 'none';
        }
    }

    // Auto-hide error messages after a delay
    function autoHideMessage(element, delay = 5000) {
        setTimeout(() => {
            if (element && element.parentNode) {
                element.style.opacity = '0';
                element.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    if (element.parentNode) {
                        element.remove();
                    }
                }, 300);
            }
        }, delay);
    }

    // Prevent form submission on Enter key in input fields (optional)
    signupForm.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.type !== 'submit') {
                e.preventDefault();
                const nextInput = getNextInput(this);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    signupForm.querySelector('.btn-signup').click();
                }
            }
        });
    });

    // Get next input field
    function getNextInput(currentInput) {
        const inputs = Array.from(signupForm.querySelectorAll('input'));
        const currentIndex = inputs.indexOf(currentInput);
        return inputs[currentIndex + 1] || null;
    }

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

// Utility functions for other pages to use
window.MaterialMateValidation = {
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePhone: function(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },
    
    generateStrongPassword: function() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }
};


