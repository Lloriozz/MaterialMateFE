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

            const message = await response.text();

            if (response.ok) {
                // Lấy username từ trường nhập liệu trước khi xử lý response
                const username = usernameField.value.trim();

                // Cố gắng lấy user ID từ response JSON
                let userId = null;
                try {
                    const responseData = JSON.parse(message);
                    if (responseData && responseData.id) {
                        userId = responseData.id;
                        console.log(`User ID ${userId} found in login response JSON.`);
                    } else {
                        console.log('Login response JSON does not contain ID.');
                    }
                } catch (e) {
                    console.log('Could not parse login response as JSON or it is empty:', e);
                }

                // Lưu username vào storage ngay lập tức
                if (username) {
                     sessionStorage.setItem('username', username);
                     localStorage.setItem('username', username);
                     console.log(`Username '${username}' stored in storage.`);
                }

                // Nếu chưa có userId từ response JSON, thử fetch từ database
                if (!userId) {
                    console.log(`Fetching user ID for username: ${username} from database.`);
                    fetchUserIdFromDatabase(username).then(fetchedUserId => {
                        if (fetchedUserId && fetchedUserId !== '1') { // '1' là giá trị mặc định khi lỗi
                            userId = fetchedUserId;
                            console.log(`Fetched user ID ${userId} from database.`);
                        } else {
                             console.warn(`Could not fetch valid user ID for username: ${username}. Using default ID '1'.`);
                             userId = '1'; // Vẫn set một ID mặc định
                        }
                        
                        // Lưu userId vào storage sau khi có được
                        sessionStorage.setItem('currentUserId', userId);
                        localStorage.setItem('currentUserId', userId);
                        console.log(`User ID '${userId}' stored in storage.`);

                        // Thêm độ trễ nhỏ trước khi chuyển hướng
                        setTimeout(() => {
                            console.log('Redirecting to home.html after fetch...');
                            window.location.href = 'home.html';
                        }, 100); // Độ trễ 100ms

                    }).catch(error => {
                        console.error('Error fetching user ID from database:', error);
                        // Nếu fetch lỗi, vẫn lưu username (đã lưu trước đó) và chuyển hướng
                        // Có thể cân nhắc xử lý lỗi nặng hơn ở đây nếu cần
                        // Lưu userId mặc định nếu fetch lỗi
                        sessionStorage.setItem('currentUserId', '1');
                        localStorage.setItem('currentUserId', '1');
                         console.warn(`Failed to fetch user ID. Stored default ID '1'.`);
                         // Thêm độ trễ nhỏ trước khi chuyển hướng ngay cả khi fetch lỗi
                         setTimeout(() => {
                            console.log('Redirecting to home.html after fetch error...');
                            window.location.href = 'home.html';
                        }, 100); // Độ trễ 100ms
                    });
                } else {
                    // Nếu đã có userId từ response JSON, lưu userId và chuyển hướng ngay
                    sessionStorage.setItem('currentUserId', userId);
                    localStorage.setItem('currentUserId', userId);
                     console.log(`User ID '${userId}' stored from login response.`);
                     // Thêm độ trễ nhỏ trước khi chuyển hướng
                     setTimeout(() => {
                         console.log('Redirecting to home.html after successful login...');
                         window.location.href = 'home.html';
                     }, 100); // Độ trễ 100ms
                }

            } else {
                // Xử lý lỗi đăng nhập (response.ok là false)
                const finalMessage = message && message.trim() !== '' ? message : 'Login failed. Please check your credentials and try again.';
                if (finalMessage.toLowerCase().includes('username') || finalMessage.toLowerCase().includes('not existed')) {
                    showErrorMessage(finalMessage, usernameField);
                } else {
                    showErrorMessage(finalMessage, passwordField);
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
