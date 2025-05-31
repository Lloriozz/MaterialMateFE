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

        // Kiểm tra tài khoản admin mặc định
        if (username === 'admin' && password === 'admin') {
            console.log('Admin login successful. Redirecting to admin page...');
            // Lưu thông tin admin vào storage nếu cần thiết
            sessionStorage.setItem('username', 'admin');
            localStorage.setItem('username', 'admin');
             // Có thể lưu thêm cờ is_admin vào storage nếu cần phân quyền ở frontend
             sessionStorage.setItem('is_admin', 'true');
             localStorage.setItem('is_admin', 'true');

            window.location.href = '/html/admin/admin.html'; // Chuyển hướng đến trang admin với đường dẫn tuyệt đối
            return;
        }

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
            // First, attempt to login
            const loginResponse = await fetch('http://localhost:8080/mm/students/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            // Clone the response for debugging
            const responseForDebug = loginResponse.clone();
            const debugText = await responseForDebug.text();
            console.log('Raw login response:', debugText);

            if (!loginResponse.ok) {
                try {
                    const errorJson = JSON.parse(debugText);
                    const errorMessage = errorJson.message || errorJson.error || debugText;
                    if (errorMessage.toLowerCase().includes('username') || 
                        errorMessage.toLowerCase().includes('not found')) {
                        showErrorMessage(errorMessage, usernameField);
                    } else if (errorMessage.toLowerCase().includes('password')) {
                        showErrorMessage(errorMessage, passwordField);
                    } else {
                        showErrorMessage(errorMessage, passwordField);
                    }
                } catch (e) {
                    // If not JSON, use the raw text
                    if (debugText.toLowerCase().includes('username')) {
                        showErrorMessage(debugText, usernameField);
                    } else {
                        showErrorMessage(debugText, passwordField);
                    }
                }
                loginButton.disabled = false;
                loginButton.innerHTML = 'Log in';
                return;
            }

            // Try to parse the login response
            let loginData;
            try {
                loginData = JSON.parse(debugText);
                console.log('Parsed login data:', loginData);
            } catch (e) {
                console.error('Failed to parse login response as JSON:', e);
                // If not JSON, try to get the ID from the text response
                loginData = { id: debugText.trim() };
                console.log('Using raw response as ID:', loginData);
            }

            // Get user ID from the response
            let userId = loginData.id;
            
            // If no direct ID, check other possible locations
            if (!userId && loginData.student) {
                userId = loginData.student.id;
            }
            if (!userId && loginData.user) {
                userId = loginData.user.id;
            }
            
            // If still no ID, check if the response itself is the ID
            if (!userId && !isNaN(loginData)) {
                userId = loginData;
            }

            if (!userId) {
                console.error('No user ID found in response. Full response:', loginData);
                throw new Error('Could not find user ID in login response');
            }

            console.log('Found user ID:', userId);

            // Store user ID immediately after successful login
            sessionStorage.setItem('currentUserId', userId);
            localStorage.setItem('currentUserId', userId);

            // If login successful, get user information
            try {
                // Get student ID first
                const idResponse = await fetch(`http://localhost:8080/mm/students/id/${username}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!idResponse.ok) {
                    throw new Error('Failed to fetch student ID');
                }

                const idData = await idResponse.json();
                const studentId = idData.id;

                // Store user ID immediately
                sessionStorage.setItem('currentUserId', studentId);
                localStorage.setItem('currentUserId', studentId);

                // Get credits
                const creditsResponse = await fetch(`http://localhost:8080/mm/students/${username}/credits`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                let credits = 0;
                if (creditsResponse.ok) {
                    credits = await creditsResponse.json();
                }

                // Since we don't have a GET profile endpoint, store basic info and let personal-info.js handle profile data
                const userInfo = {
                    id: studentId,
                    username: username,
                    credits: credits
                };

                // Store user information in session storage
                sessionStorage.setItem('currentUser', JSON.stringify(userInfo));

                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success mt-3';
                successMessage.innerHTML = `
                    <h4>Welcome back, ${username}!</h4>
                    <p>Student ID: ${studentId}</p>
                    <p>Credits: ${credits}</p>
                    <small>Redirecting to home page...</small>
                `;
                loginForm.appendChild(successMessage);

                // Redirect to home page after showing the information
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 3000);

            } catch (error) {
                console.error('Error fetching user information:', error);
                // Create retry button
                const retryMessage = document.createElement('div');
                retryMessage.className = 'alert alert-warning mt-3';
                retryMessage.innerHTML = `
                    <p>Failed to fetch your information. Click below to try again:</p>
                    <button class="btn btn-warning btn-sm retry-fetch-btn">Retry</button>
                `;
                loginForm.appendChild(retryMessage);

                // Add retry button functionality
                const retryButton = retryMessage.querySelector('.retry-fetch-btn');
                retryButton.addEventListener('click', async () => {
                    retryButton.disabled = true;
                    retryButton.innerHTML = 'Retrying...';
                    try {
                        // Retry getting student ID
                        const retryIdResponse = await fetch(`http://localhost:8080/mm/students/id/${username}`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        if (!retryIdResponse.ok) {
                            throw new Error('Failed to fetch student ID on retry');
                        }

                        const retryIdData = await retryIdResponse.json();
                        const studentId = retryIdData.id;

                        // Store user ID
                        sessionStorage.setItem('currentUserId', studentId);
                        localStorage.setItem('currentUserId', studentId);

                        // Try to get credits
                        const retryCreditsResponse = await fetch(`http://localhost:8080/mm/students/${username}/credits`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        let credits = 0;
                        if (retryCreditsResponse.ok) {
                            credits = await retryCreditsResponse.json();
                        }

                        // Store basic user info
                        const userInfo = {
                            id: studentId,
                            username: username,
                            credits: credits
                        };
                        sessionStorage.setItem('currentUser', JSON.stringify(userInfo));

                        // Show success and redirect
                        retryMessage.className = 'alert alert-success mt-3';
                        retryMessage.innerHTML = 'Information fetched successfully! Redirecting...';
                        setTimeout(() => {
                            window.location.href = 'home.html';
                        }, 1000);
                    } catch (retryError) {
                        console.error('Retry failed:', retryError);
                        retryButton.disabled = false;
                        retryButton.innerHTML = 'Retry';
                        retryMessage.className = 'alert alert-danger mt-3';
                        retryMessage.innerHTML = `
                            <p>Failed to fetch information. Please try:</p>
                            <button class="btn btn-warning btn-sm retry-fetch-btn">Retry</button>
                            <p class="mt-2">Or <a href="home.html">continue to home page</a> and update your profile later.</p>
                        `;
                    }
                });

                // Also provide a link to continue without profile
                const skipLink = document.createElement('div');
                skipLink.className = 'text-center mt-2';
                skipLink.innerHTML = '<a href="home.html">Continue to home page</a>';
                loginForm.appendChild(skipLink);
            }

        } catch (error) {
            console.error('Login error:', error);
            if (error.message.includes('Failed to fetch') || !navigator.onLine) {
                showErrorMessage('Unable to connect to the server. Please check your internet connection and try again.', passwordField);
            } else {
                showErrorMessage(error.message || 'An unexpected error occurred. Please try again later.', passwordField);
            }
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
