// Đợi cho trang load hoàn toàn
window.addEventListener('load', function() {
    console.log('user-info.js loaded after window load');
    
    // Lấy username từ sessionStorage hoặc localStorage
    let username = sessionStorage.getItem('username');
    console.log('Username from sessionStorage:', username);
    
    // Nếu không có trong sessionStorage, thử lấy từ localStorage
    if (!username) {
        username = localStorage.getItem('username');
        console.log('Username from localStorage:', username);
        if (username) {
            // Sao chép vào sessionStorage để đảm bảo tính nhất quán
            sessionStorage.setItem('username', username);
            console.log('Copied username to sessionStorage');
        }
    }
    
    // Hiển thị username nếu có
    if (username) {
        console.log('Username found, updating display:', username);
        const userElements = document.querySelectorAll('.user-name');
        console.log('Found user elements:', userElements.length, userElements);
        userElements.forEach(element => {
            element.textContent = username;
            console.log('Updated element:', element);
        });
    } else {
        console.log('No username found in storage.');
    }
}); 