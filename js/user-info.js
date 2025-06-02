// Hàm cập nhật thông tin người dùng
async function updateUserInfo() {
    const username = sessionStorage.getItem('username');
    console.log('Attempting to get username from sessionStorage:', username);

    if (!username) {
        console.log('No username found in sessionStorage');
        return;
    }

    console.log('Username found:', username, 'Updating display and fetching credits.');

    // Cập nhật username trong giao diện
    const userNameElements = document.querySelectorAll('.user-name');
    console.log('Found', userNameElements.length, '.user-name elements.');
    userNameElements.forEach(element => {
        element.textContent = username;
        console.log('Updated .user-name element:', element);
    });

    // Lấy và cập nhật credits
    try {
        console.log('Fetching credits from:', `http://localhost:8080/mm/students/${username}/credits`);
        const response = await fetch(`http://localhost:8080/mm/students/${username}/credits`);
        console.log('Credit API Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error fetching credits! status: ${response.status}`);
        }

        const credits = await response.json();
        console.log('Credits fetched:', credits);

        // Cập nhật credits trong giao diện
        const creditElements = document.querySelectorAll('.user-credit');
        console.log('Found', creditElements.length, '.user-credit elements to update.');
        creditElements.forEach(element => {
            const oldText = element.textContent;
            element.textContent = `Credit: ${credits}`;
            console.log('Updated .user-credit element:', element, 'with value:', element.textContent);
        });

        // Lưu credits vào sessionStorage
        sessionStorage.setItem('userCredits', credits);

    } catch (error) {
        console.error('Error fetching credits:', error);
        const creditElements = document.querySelectorAll('.user-credit');
        creditElements.forEach(element => {
            element.textContent = 'Credit: N/A';
        });
    }
}

// Hàm kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const username = sessionStorage.getItem('username');
    if (!username) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login
        window.location.href = '/html/login.html';
        return false;
    }
    return true;
}

// Hàm đăng xuất
function logout() {
    // Xóa thông tin người dùng khỏi sessionStorage
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userCredits');
    
    // Chuyển hướng về trang login
    window.location.href = '/html/login.html';
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    console.log('user-info.js loaded after DOM content loaded');
    if (checkLoginStatus()) {
        updateUserInfo();
    }
});

// Khởi tạo khi window được tải (cho trường hợp script được load sau khi DOM đã sẵn sàng)
window.addEventListener('load', function() {
    console.log('user-info.js loaded after window load');
    if (checkLoginStatus()) {
        updateUserInfo();
    }
});

// Export các hàm để có thể sử dụng từ các file khác
window.userInfo = {
    updateUserInfo,
    checkLoginStatus,
    logout
}; 