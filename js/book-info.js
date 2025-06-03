// Global variables
let userCredit = 3; // Start with 3 credits for testing
let currentModal = null;
let currentItem = null; // Biến lưu trữ thông tin item hiện tại
let currentUploader = null; // Biến lưu trữ thông tin uploader

// Initialize when page loads
async function initBookInfoPage() { // Đổi tên hàm khởi tạo
    // Lấy itemID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const itemID = urlParams.get('itemId');

    if (!itemID) {
        console.error('Item ID not found in URL.');
        // Hiển thị thông báo lỗi trên giao diện nếu có phần tử hiển thị lỗi
        const errorElement = document.getElementById('errorMessage'); // Cần có phần tử này trong HTML
        if(errorElement) errorElement.textContent = 'Error: Item ID not found.';
        return;
    }

    // Fetch thông tin chi tiết item
    currentItem = await fetchItemDetail(itemID);

    if (currentItem) {
        displayItemDetail(currentItem);
        // Sau khi tải item thành công, mới khởi tạo modal logic
        initBookInfoModal(); // Giữ nguyên tên hàm init modal cũ
    } else {
         // Item không tồn tại hoặc lỗi khi fetch
         const errorElement = document.getElementById('errorMessage'); // Cần có phần tử này trong HTML
         if(errorElement) errorElement.textContent = 'Error: Could not load item details.';
    }

    // Add keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentModal) {
            hideModal();
        }
    });

    // Tải credit của user sau khi trang tải
    // updateUserCreditDisplay(); // Hàm này cần được triển khai riêng để lấy credit từ backend hoặc storage

    console.log(`🎯 BookInfo page initialized for item ID: ${itemID}`);
}

// Hàm lấy dữ liệu chi tiết item từ API
async function fetchItemDetail(id) {
    try {
        // Có thể hiển thị loading spinner ở đây
        const loadingSpinner = document.getElementById('loadingSpinner'); // Cần có phần tử này trong HTML
        if(loadingSpinner) loadingSpinner.style.display = 'block';

        const response = await fetch(`http://localhost:8080/mm/items/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Item not found.');
            } else {
                throw new Error(`Failed to fetch item detail. Status: ${response.status}`);
            }
        }

        const item = await response.json();
        console.log('Item detail fetched:', item);
        console.log('Item uploaderID:', item.uploaderID);
        console.log('Item uploaderID type:', typeof item.uploaderID);

        // Fetch username dựa trên item.uploaderID (studentId)
        if (item && item.uploaderID) {
            console.log('Fetching username for studentId:', item.uploaderID);
            const usernameResponse = await fetch(`http://localhost:8080/mm/students/username/${item.uploaderID}`);
            console.log('Username response status:', usernameResponse.status);
            
            if (!usernameResponse.ok) {
                console.warn(`Could not fetch username for studentId: ${item.uploaderID}. Status: ${usernameResponse.status}`);
                // Vẫn trả về item ngay cả khi không lấy được username
                return { item: item, uploader: null };
            }

            // Đọc response text trước
            const responseText = await usernameResponse.text();
            console.log('Username response text:', responseText);

            let usernameData;
            try {
                // Thử parse JSON
                usernameData = JSON.parse(responseText);
                console.log('Username data parsed:', usernameData);
            } catch (e) {
                console.warn('Failed to parse username response as JSON:', e);
                return { item: item, uploader: null };
            }
            
            // Kiểm tra xem response có đúng format không
            if (!usernameData || typeof usernameData !== 'object' || !usernameData.username) {
                console.warn('Invalid username data format:', usernameData);
                return { item: item, uploader: null };
            }
            
            console.log('Username value:', usernameData.username);
            
            // Tạo một object giả lập student với username
            const student = { username: usernameData.username };
            console.log('Student object created:', student);
            return { item: item, uploader: student };
        } else {
             // Trả về item nếu không có uploaderID
            console.log('No uploaderID found in item data');
            return { item: item, uploader: null };
        }

    } catch (error) {
        console.error('Error fetching item or username:', error);
        // Hiển thị lỗi trên giao diện
        const errorElement = document.getElementById('errorMessage'); // Cần có phần tử này trong HTML
        if(errorElement) errorElement.textContent = `Error loading item: ${error.message}`;
        return null;
    } finally {
        // Ẩn loading spinner ở đây
        const loadingSpinner = document.getElementById('loadingSpinner');
        if(loadingSpinner) loadingSpinner.style.display = 'none';
    }
}

// Hàm hiển thị dữ liệu item lên trang
function displayItemDetail(data) {
    if (!data || !data.item) return;

    const item = data.item;
    const uploader = data.uploader;
    
    console.log('Displaying item detail:', item);
    console.log('Uploader data:', uploader);
    console.log('Uploader username:', uploader?.username);

    const bookCover = document.querySelector('.book-cover img');
    const bookTitle = document.querySelector('.book-title');
    // Selector chính xác cho phần tử description (thẻ p có class book-description)
    const bookDescriptionElement = document.querySelector('.book-description');

    // Hiển thị ảnh bìa Base64
    if (bookCover && item.coverImage) {
        bookCover.src = `data:image/jpeg;base64,${item.coverImage}`;
        bookCover.onerror = function() {
            console.error('Failed to load Base64 image for:', item.title);
            this.src = '../assets/book-placeholder.png'; // Ảnh placeholder
            this.onerror = null;
        };
    } else if (bookCover) {
         bookCover.src = '../assets/book-placeholder.png'; // Ảnh placeholder nếu không có dữ liệu ảnh
         bookCover.onerror = null; // Ngăn lỗi cho placeholder
    }

    if (bookTitle) bookTitle.textContent = item.title || 'N/A';

    // Cập nhật category và uploader
    const bookMetaElements = document.querySelectorAll('.book-meta');
    bookMetaElements.forEach(metaElement => {
        const labelElement = metaElement.querySelector('.book-meta-label');
        const valueElement = metaElement.querySelector('.book-meta-value');

        if(labelElement && valueElement) {
            const labelText = labelElement.textContent.trim();
            if (labelText === 'Uploader:') {
                // Sử dụng username nếu có, ngược lại dùng uploaderID
                const displayName = uploader?.username || item.uploaderID || 'N/A';
                console.log('Setting uploader display name to:', displayName);
                valueElement.textContent = displayName;
            } else if (labelText === 'Category:') {
                valueElement.textContent = item.category || 'N/A';
            } // Bỏ xử lý description ở đây vì đã có phần tử riêng
        }
    });

    // Cập nhật nội dung description
    if (bookDescriptionElement) {
        bookDescriptionElement.textContent = item.description || 'No description available.';
    }

    // Cập nhật nội dung tên sách trong modal confirm
    const modalBookTitleElement = document.querySelector('.modal-text.large .modal-highlight');
    if (modalBookTitleElement) {
        modalBookTitleElement.textContent = item.title || 'this material';
    }

    // Hiển thị nội dung trang chi tiết (nếu có phần tử container)
    // const bookDetailContentContainer = document.getElementById('bookDetailContent'); // Cần có phần tử này
    // if(bookDetailContentContainer) bookDetailContentContainer.style.display = 'block'; // hoặc flex/grid tùy layout
}

// Hàm update hiển thị credit của user (cần lấy dữ liệu thực tế)
// function updateUserCreditDisplay() {
//     const userCreditElement = document.querySelector('.user-profile .user-credit');
//     if (userCreditElement) {
//         // Lấy credit thực tế từ API hoặc storage
//         const actualCredit = localStorage.getItem(`${sessionStorage.getItem('username')}_credit`) || '0'; // Ví dụ
//         userCreditElement.textContent = `Credit: ${actualCredit}`;
//         userCredit = parseInt(actualCredit); // Cập nhật biến global userCredit
//     }
// }

// Existing modal logic ( giữ nguyên hoặc điều chỉnh nếu cần)
function initBookInfoModal() {
    const exchangeButton = document.querySelector('.exchange-button');
    
    if (exchangeButton) {
        exchangeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🔄 Exchange button clicked. Current credits: ${userCredit}`);
            showConfirmModal();
        });
    }
    
    // Add keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentModal) {
            hideModal();
        }
    });
    
    updateCreditDisplay();
    console.log(`🎯 BookInfoModal initialized for exchange logic`);
}

// Remove existing modals
function removeExistingModals() {
    const existingModals = document.querySelectorAll('.modal-overlay');
    existingModals.forEach(function(modal) {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
    document.body.classList.remove('modal-open');
}

// Create modal overlay
function createModalOverlay() {
    removeExistingModals();
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    return overlay;
}

// Create confirmation modal
function createConfirmModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    
    modal.innerHTML = `
        <button class="modal-close" aria-label="Close modal">&times;</button>
        
        <div class="modal-icon books"></div>
        
        <p class="modal-text large">
            Are you sure to exchange 
            <span class="modal-highlight">
                Giáo trình triết học maclenin và kinh tế chính trị và lịch sử đảng
            </span> 
            for
        </p>
        <p class="modal-text large">
            <span class="modal-credit">1</span> credit?
        </p>
        <p class="modal-text" style="font-size: 14px; color: #999; margin-top: 10px;">
            Current credits: ${userCredit}
        </p>
        
        <div class="modal-buttons">
            <button class="modal-button primary confirm-yes">Yes, i agree</button>
            <button class="modal-button secondary confirm-no">No, come back!</button>
        </div>
    `;

    return modal;
}

// Create error modal
function createErrorModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    
    modal.innerHTML = `
        <button class="modal-close" aria-label="Close modal">&times;</button>
        
        <div class="modal-icon error"></div>
        
        <h2 class="modal-title">Not enough credit!</h2>
        <p class="modal-text">
            Oh no! You don't have enough credits. Please upload more materials to get credit.
        </p>
        <p class="modal-text" style="font-size: 14px; color: #999;">
            Current credits: ${userCredit}
        </p>
        
        <button class="modal-button primary full-width upload-more">Upload more!</button>
    `;

    return modal;
}

// Create success modal
function createSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    
    modal.innerHTML = `
        <button class="modal-close" aria-label="Close modal">&times;</button>
        
        <div class="modal-icon success"></div>
        
        <h2 class="modal-title">Successfully!</h2>
        <p class="modal-text">
            You have received the material. Please check your exchange list and download the material!
        </p>
        <p class="modal-text" style="font-size: 14px; color: #999;">
            Remaining credits: ${userCredit}
        </p>
        
        <button class="modal-button primary full-width go-to-exchange">Go to exchange list</button>
    `;

    return modal;
}

// Show modal with animation
function showModal(modalContent) {
    const overlay = createModalOverlay();
    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');
    currentModal = overlay;

    // Force reflow before adding show class
    overlay.offsetHeight;
    
    // Trigger animations
    requestAnimationFrame(function() {
        overlay.classList.add('show');
        modalContent.classList.add('show');
    });

    return overlay;
}

// Hide modal with animation
function hideModal(overlay) {
    const targetOverlay = overlay || currentModal;
    if (!targetOverlay) return;

    const modalContent = targetOverlay.querySelector('.modal-content');
    
    targetOverlay.classList.remove('show');
    if (modalContent) {
        modalContent.classList.remove('show');
    }
    
    setTimeout(function() {
        if (targetOverlay.parentNode) {
            targetOverlay.parentNode.removeChild(targetOverlay);
        }
        document.body.classList.remove('modal-open');
        currentModal = null;
    }, 300);
}

// Add overlay click handler
function addOverlayClickHandler(overlay) {
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            hideModal(overlay);
        }
    });
}

// Show confirmation modal
function showConfirmModal() {
    const modal = createConfirmModal();
    const overlay = showModal(modal);

    // Get buttons
    const closeBtn = modal.querySelector('.modal-close');
    const yesBtn = modal.querySelector('.confirm-yes');
    const noBtn = modal.querySelector('.confirm-no');

    // Add event listeners
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hideModal(overlay);
    });
    
    noBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('❌ User cancelled exchange');
        hideModal(overlay);
    });
    
    yesBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('✅ User confirmed exchange');
        hideModal(overlay);
        setTimeout(function() {
            checkCreditAndProceed();
        }, 300);
    });

    addOverlayClickHandler(overlay);
}

// Check credit and show appropriate modal
async function checkCreditAndProceed() {
    console.log(`🔍 Checking credits. Current: ${userCredit}`);
    
    // Check if user has enough credits (need at least 1 credit)
    if (userCredit <= 0) {
        console.log('❌ Not enough credits - showing error modal');
        showErrorModal();
    } else {
        console.log('✅ User has enough credits - proceeding with exchange');
        
        // --- Logic trao đổi với backend ---
        await performExchange();
        // --- Kết thúc Logic trao đổi ---
    }
}

// Hàm thực hiện gọi API trừ credit và tạo ExchangeInfo
async function performExchange() {
    const username = sessionStorage.getItem('username') || localStorage.getItem('username');
    const studentId = sessionStorage.getItem('currentUserId') || localStorage.getItem('currentUserId'); // Lấy studentId (UUID) đã lưu khi đăng nhập
    const itemID = currentItem ? currentItem.item.itemID : null; // Lấy itemID từ biến global currentItem

    if (!username || !studentId || !itemID) {
        console.error('Missing user/item info for exchange. Username:', username, 'StudentId:', studentId, 'ItemID:', itemID);
        // Hiển thị lỗi hoặc thông báo
        alert('Không thể thực hiện trao đổi do thiếu thông tin người dùng hoặc vật liệu.');
        return;
    }

    console.log(`Initiating exchange for Item ${itemID} by Student ${studentId} (User: ${username})`);

    try {
        // Bước 1: Lấy credit hiện tại (để tính credit mới cần PUT)
        console.log(`Fetching current credits for user ${username}...`);
        const currentCreditsResponse = await fetch(`http://localhost:8080/mm/students/${username}/credits`);

        if (!currentCreditsResponse.ok) {
             const errorText = await currentCreditsResponse.text();
             console.error(`/credits (GET) response status: ${currentCreditsResponse.status}`, errorText);
            throw new Error(`Failed to fetch current credits before exchange. Status: ${currentCreditsResponse.status}`);
        }

        const currentCredits = await currentCreditsResponse.json();
        console.log('Current credits fetched:', currentCredits);

        // Tính toán số credit mới
        const newCreditsValue = (currentCredits || 0) - 1; // Trừ 1 credit
        console.log('Calculated new credits value after deduction:', newCreditsValue);

        if (newCreditsValue < 0) {
             console.warn('Calculated new credits is negative, but initial check passed. This is unexpected.');
             // Có thể hiển thị lỗi hoặc dừng lại nếu logic yêu cầu
             // Tạm thời vẫn thử cập nhật backend
        }

        // Bước 2: Gửi yêu cầu PUT để cập nhật credit trong database (-1)
        console.log(`Putting new credits (${newCreditsValue}) for user ${username}...`);
        // Sử dụng định dạng body object { credits: value } dựa trên Postman test của bạn
        const updateCreditResponse = await fetch(`http://localhost:8080/mm/students/${username}/credits`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credits: newCreditsValue })
        });

        console.log('/credits (PUT) response status:', updateCreditResponse.status);

        if (!updateCreditResponse.ok) {
            const errorText = await updateCreditResponse.text();
            console.error('/credits (PUT) response error text:', errorText);
            throw new Error(`Failed to update credits after exchange. Status: ${updateCreditResponse.status}`);
        }

        console.log('Credit updated successfully in backend.');

        // Bước 3: Gửi yêu cầu POST để tạo bản ghi ExchangeInfo
        console.log(`Creating ExchangeInfo for Item ${itemID} and Student ${studentId}...`);
        const createExchangeResponse = await fetch('http://localhost:8080/mm/exchanges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemId: itemID, studentId: studentId })
        });

        console.log('/exchanges (POST) response status:', createExchangeResponse.status);

        if (!createExchangeResponse.ok) {
            const errorText = await createExchangeResponse.text();
            console.error('/exchanges (POST) response error text:', errorText);
            throw new Error(`Failed to create exchange info. Status: ${createExchangeResponse.status}`);
        }

        const exchangeInfoResult = await createExchangeResponse.json();
        console.log('ExchangeInfo created successfully:', exchangeInfoResult);

        // --- Cập nhật frontend và hiển thị modal thành công ---
        console.log('Backend calls successful. Updating frontend and showing success modal.');
        // Cập nhật biến credit global và hiển thị
        userCredit = newCreditsValue; // Sử dụng giá trị mới đã tính
        updateCreditDisplay(); // Cập nhật hiển thị

        // Hiển thị modal thành công
        showSuccessModal();
        // --- Kết thúc cập nhật frontend ---

    } catch (error) {
        console.error('Error during exchange process:', error);
        // Hiển thị modal lỗi nếu có bất kỳ bước nào thất bại
        // Cập nhật thông báo lỗi trong modal nếu cần chi tiết hơn
        showErrorModal(); // Hiển thị modal lỗi chung
    }
}

// Show error modal
function showErrorModal() {
    const modal = createErrorModal();
    const overlay = showModal(modal);

    const closeBtn = modal.querySelector('.modal-close');
    const uploadBtn = modal.querySelector('.upload-more');

    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hideModal(overlay);
    });
    
    uploadBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hideModal(overlay);
        handleUploadRedirect();
    });

    addOverlayClickHandler(overlay);
}

// Show success modal
function showSuccessModal() {
    const modal = createSuccessModal();
    const overlay = showModal(modal);

    const closeBtn = modal.querySelector('.modal-close');
    const exchangeBtn = modal.querySelector('.go-to-exchange');

    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hideModal(overlay);
    });
    
    exchangeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hideModal(overlay);
        handleExchangeListRedirect();
    });

    addOverlayClickHandler(overlay);
}

// Update credit display
function updateCreditDisplay() {
    const creditElement = document.querySelector('.user-credit');
    if (creditElement) {
        const oldText = creditElement.textContent;
        creditElement.textContent = `Credit: ${userCredit.toString().padStart(2, '0')}`;
        console.log(`📱 Credit display updated: "${oldText}" → "Credit: ${userCredit.toString().padStart(2, '0')}"`);
    } else {
        console.log('⚠️ Credit element not found in DOM');
    }
}

// Handle upload redirect
function handleUploadRedirect() {
    console.log('📤 Redirecting to upload page...');
    // window.location.href = 'upload.html';
}

// Handle exchange list redirect
function handleExchangeListRedirect() {
    console.log('📋 Redirecting to exchange list...');
    // window.location.href = 'exchange-list.html';
}

// Public functions for external use
function setUserCredit(credit) {
    const oldCredit = userCredit;
    userCredit = Number(credit);
    updateCreditDisplay();
    console.log(`🎯 Credit manually set: ${oldCredit} → ${userCredit}`);
}

function getUserCredit() {
    console.log(`📊 Current credit requested: ${userCredit}`);
    return userCredit;
}

function addCredit(amount) {
    amount = amount || 1;
    const oldCredit = userCredit;
    userCredit = userCredit + Number(amount);
    updateCreditDisplay();
    console.log(`➕ Credits added: ${oldCredit} + ${amount} = ${userCredit}`);
}

// Hàm lấy credit thực tế của user hiện tại
async function fetchAndSetUserCredit() {
    let username = sessionStorage.getItem('username') || localStorage.getItem('username');
    if (!username) {
        console.warn('No username found in storage for fetching credits');
        userCredit = 0;
        updateCreditDisplay();
        return;
    }
    try {
        const response = await fetch(`http://localhost:8080/mm/students/${username}/credits`);
        if (!response.ok) {
            throw new Error('Failed to fetch user credits');
        }
        const credits = await response.json();
        userCredit = credits;
        updateCreditDisplay();
        console.log('Fetched and set user credit:', credits);
    } catch (error) {
        console.error('Error fetching user credits:', error);
        userCredit = 0;
        updateCreditDisplay();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchAndSetUserCredit(); // Lấy credit thực tế trước khi initBookInfoPage
    initBookInfoPage();
    
    console.log(`
🧪 TESTING COMMANDS:
- Set credits: setUserCredit(5)
- Add credits: addCredit(2)  
- Check credits: getUserCredit()
- Test with 0 credits: setUserCredit(0)
    `);
});

// Also initialize if script is loaded after DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        fetchAndSetUserCredit();
        initBookInfoPage();
    });
} else {
    fetchAndSetUserCredit();
    initBookInfoPage();
}