// Hàm helper để cập nhật hiển thị credit
function updateCreditDisplay(creditValue) {
    const creditElements = document.querySelectorAll('.user-credit');
    console.log('Found', creditElements.length, '.user-credit elements to update.');
    creditElements.forEach(element => {
        // Định dạng hiển thị, ví dụ: "Credit: 10"
        element.textContent = `Credit: ${creditValue}`;
        console.log('Updated .user-credit element:', element, 'with value:', `Credit: ${creditValue}`);
    });
}

// Đợi cho trang load hoàn toàn
window.addEventListener('load', function() {
    console.log('user-info.js loaded after window load');
    
    // Lấy username từ sessionStorage hoặc localStorage
    let username = sessionStorage.getItem('username');
    console.log('Attempting to get username from sessionStorage:', username);
    
    // Nếu không có trong sessionStorage, thử lấy từ localStorage
    if (!username) {
        username = localStorage.getItem('username');
        console.log('Username not in sessionStorage, attempting localStorage:', username);
        
        // Nếu tìm thấy trong localStorage, sao chép lại vào sessionStorage cho nhất quán
        if (username) {
            sessionStorage.setItem('username', username);
            console.log('Username found in localStorage and copied to sessionStorage.');
        }
    }
    
    // Nếu có username, cập nhật tất cả các phần tử .user-name VÀ fetch credit
    if (username) {
        console.log('Username found:', username, 'Updating display and fetching credits.');
        
        // Cập nhật username display
        const userNameElements = document.querySelectorAll('.user-name');
        console.log('Found', userNameElements.length, '.user-name elements.');
        userNameElements.forEach(element => {
            element.textContent = username;
            console.log('Updated .user-name element:', element);
        });
        
        // *** Thêm logic fetch credit ***
        const creditApiUrl = `http://localhost:8080/mm/students/${username}/credits`;
        console.log('Fetching credits from:', creditApiUrl);

        fetch(creditApiUrl)
            .then(response => {
                console.log('Credit API Response status:', response.status);
                if (!response.ok) {
                    // Xử lý lỗi HTTP (ví dụ: 404 Not Found)
                    console.error(`HTTP error fetching credits! status: ${response.status}`);
                    // Có thể set credit về giá trị mặc định hoặc hiển thị lỗi
                    updateCreditDisplay('N/A');
                    // Không throw error ở đây để không làm gián đoạn promise chain
                    return null; // Trả về null để các .then() tiếp theo không xử lý
                }
                // Endpoint trả về Integer, đọc response dưới dạng text
                return response.text();
            })
            .then(creditText => {
                console.log('Credit API Response text:', creditText);
                if (creditText !== null) { // Kiểm tra nếu response.ok là true
                    // Cố gắng parse text thành số nguyên
                    const totalCredits = parseInt(creditText, 10);

                    if (!isNaN(totalCredits)) {
                        console.log('Parsed total credits:', totalCredits);
                        updateCreditDisplay(totalCredits);
                    } else {
                        console.warn('Could not parse credit value as integer:', creditText);
                        updateCreditDisplay('N/A'); // Hiển thị N/A nếu parse lỗi
                    }
                }
                // Nếu responseText là null (do lỗi HTTP), không làm gì cả, updateCreditDisplay đã được gọi ở trên
            })
            .catch(error => {
                console.error('Error during fetch or parsing credits:', error);
                updateCreditDisplay('N/A'); // Hiển thị N/A nếu có lỗi fetch hoặc parse
            });

    } else {
        console.log('No username found in storage. Cannot fetch credits or update display.');
        // Nếu không có username, set credit display về giá trị mặc định hoặc N/A
        updateCreditDisplay('N/A');
        // Tùy chọn: Chuyển hướng nếu không có username (người dùng chưa đăng nhập)
        // window.location.href = 'login.html';
    }
}); 