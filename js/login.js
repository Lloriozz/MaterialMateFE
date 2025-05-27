document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('form');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const loginButton = document.querySelector('.btn-login');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideErrorMessages();

        const username = usernameField.value.trim();
        const password = passwordField.value.trim();

        if (!username) {
            showErrorMessage('Please enter your username, email or phone number', usernameField);
            usernameField.focus();
            return;
        }

        if (!password) {
            showErrorMessage('Please enter your password', passwordField);
            passwordField.focus();
            return;
        }

        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...';

        try {
            const response = await fetch('http://localhost:8080/mm/students/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            // Try to parse the response as JSON to extract user ID
            try {
                const responseData = await response.clone().json();
                console.log('Login response data:', responseData);
                
                // Check if the response contains user information
                if (responseData) {
                    // Look for ID in various possible locations in the response
                    let userId = null;
                    
                    if (responseData.id) {
                        userId = responseData.id;
                    } else if (responseData.userId) {
                        userId = responseData.userId;
                    } else if (responseData.user && responseData.user.id) {
                        userId = responseData.user.id;
                    } else if (responseData.student && responseData.student.id) {
                        userId = responseData.student.id;
                    }
                    
                    // If we found a user ID, store it
                    if (userId) {
                        console.log('Found user ID in response:', userId);
                        sessionStorage.setItem('currentUserId', userId);
                        // Also store in localStorage as a backup
                        localStorage.setItem('currentUserId', userId);
                    } else {
                        console.log('No user ID found in response');
                    }
                }
            } catch (jsonError) {
                // If response is not JSON, continue with text processing
                console.log('Response is not JSON format:', jsonError);
            }

            const message = await response.text();

            if (response.ok) {
                // First try to get the user ID from the login response
                try {
                    const responseData = JSON.parse(message);
                    if (responseData && responseData.id) {
                        // If the login response contains the ID, use it
                        sessionStorage.setItem('currentUserId', responseData.id);
                        localStorage.setItem('currentUserId', responseData.id);
                        console.log(`Set user ID to ${responseData.id} from login response`);
                        window.location.href = 'home.html';
                        return;
                    }
                } catch (e) {
                    // If parsing fails, continue with the next approach
                    console.log('Login response is not JSON or does not contain ID');
                }
                
                // If login response doesn't have the ID, fetch it from the database
                fetchUserIdFromDatabase(username).then(userId => {
                    // Store the user ID and redirect
                    sessionStorage.setItem('currentUserId', userId);
                    localStorage.setItem('currentUserId', userId);
                    console.log(`Set user ID to ${userId} for username: ${username}`);
                    window.location.href = 'home.html';
                }).catch(error => {
                    console.error('Error fetching user ID:', error);
                    // If fetching fails, redirect anyway
                    window.location.href = 'home.html';
                });
                
                // Note: We don't redirect here because we're waiting for the async fetchUserIdFromDatabase to complete
            } else {
                if (message.toLowerCase().includes('username')) {
                    showErrorMessage(message, usernameField);
                } else {
                    showErrorMessage(message, passwordField);
                }
                loginButton.disabled = false;
                loginButton.innerHTML = 'Log in';
            }
        } catch (error) {
            console.error('Login error:', error);
            showErrorMessage('An unexpected error occurred. Please try again later.', passwordField);
            loginButton.disabled = false;
            loginButton.innerHTML = 'Log in';
        }
    });

    const forgotPasswordLink = document.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Forgot password functionality would be implemented here');
    });

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

    function showErrorMessage(message, field) {
        hideErrorMessages();

        const finalMessage = message && message.trim() !== '' ? message : 'Login failed. Please check your credentials and try again.';


        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-2 p-2 error-message-alert';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${finalMessage}`;

        field.parentElement.appendChild(errorDiv);
    }

    function hideErrorMessages() {
        document.querySelectorAll('.error-message-alert').forEach(el => el.remove());
    }

    // ✅ Moved inside the DOMContentLoaded block
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
    
    /**
     * Fetches the user ID from the database based on the username
     * @param {string} username - The username to look up
     * @returns {Promise<string>} - A promise that resolves to the user ID
     */
    async function fetchUserIdFromDatabase(username) {
        try {
            // Make a request to the API to get the user ID
            const response = await fetch(`http://localhost:8080/mm/students/id/${username}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch user ID: ${response.status}`);
            }
            
            // Try to parse the response as JSON
            const data = await response.json();
            
            // Check if the response contains an ID
            if (data && data.id) {
                return data.id.toString();
            } else {
                console.warn('User ID not found in response:', data);
                return '1'; // Default to ID 1 if not found
            }
        } catch (error) {
            console.error('Error fetching user ID:', error);
            return '1'; // Default to ID 1 if there's an error
        }
    }
});
