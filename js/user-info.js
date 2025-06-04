// Function to update user information
async function updateUserInfo() {
    const username = sessionStorage.getItem('username');
    console.log('Attempting to get username from sessionStorage:', username);

    if (!username) {
        console.log('No username found in sessionStorage');
        return;
    }

    console.log('Username found:', username, 'Updating display and fetching credits.');

    // Update username in the interface
    const userNameElements = document.querySelectorAll('.user-name');
    console.log('Found', userNameElements.length, '.user-name elements.');
    userNameElements.forEach(element => {
        element.textContent = username;
        console.log('Updated .user-name element:', element);
    });

    // Get and update credits
    try {
        console.log('Fetching credits from:', `http://localhost:8080/mm/students/${username}/credits`);
        const response = await fetch(`http://localhost:8080/mm/students/${username}/credits`);
        console.log('Credit API Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error fetching credits! status: ${response.status}`);
        }

        const credits = await response.json();
        console.log('Credits fetched:', credits);

        // Update credits in the interface
        const creditElements = document.querySelectorAll('.user-credit');
        console.log('Found', creditElements.length, '.user-credit elements to update.');
        creditElements.forEach(element => {
            const oldText = element.textContent;
            element.textContent = `Credit: ${credits}`;
            console.log('Updated .user-credit element:', element, 'with value:', element.textContent);
        });

        // Save credits to sessionStorage
        sessionStorage.setItem('userCredits', credits);

    } catch (error) {
        console.error('Error fetching credits:', error);
        const creditElements = document.querySelectorAll('.user-credit');
        creditElements.forEach(element => {
            element.textContent = 'Credit: N/A';
        });
    }
}

// Function to check login status
function checkLoginStatus() {
    const username = sessionStorage.getItem('username');
    if (!username) {
        // If not logged in, redirect to login page
        window.location.href = '/html/login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    // Remove user information from sessionStorage
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userCredits');
    
    // Redirect to login page
    window.location.href = '../../html/login.html';
}

// Initialize when page is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('user-info.js loaded after DOM content loaded');
    if (checkLoginStatus()) {
        updateUserInfo();
    }
});

// Initialize when window is loaded (for cases where script is loaded after DOM is ready)
window.addEventListener('load', function() {
    console.log('user-info.js loaded after window load');
    if (checkLoginStatus()) {
        updateUserInfo();
    }
});

// Export functions to be used from other files
window.userInfo = {
    updateUserInfo,
    checkLoginStatus,
    logout
}; 