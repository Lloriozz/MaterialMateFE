// Global variables
let userCredit = 3; // Start with 3 credits for testing
let currentModal = null;

// Initialize when page loads
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
    console.log(`🎯 BookInfoModal initialized with ${userCredit} credits`);
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
function checkCreditAndProceed() {
    console.log(`🔍 Checking credits. Current: ${userCredit}`);
    
    // Check if user has enough credits (need at least 1 credit)
    if (userCredit <= 0) {
        console.log('❌ Not enough credits - showing error modal');
        showErrorModal();
    } else {
        console.log('✅ User has enough credits - proceeding with exchange');
        
        // Store old credit for comparison
        const oldCredit = userCredit;
        
        // Deduct exactly 1 credit
        userCredit = userCredit - 1;
        
        console.log(`💰 Credit deduction: ${oldCredit} → ${userCredit}`);
        
        updateCreditDisplay();
        showSuccessModal();
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initBookInfoModal();
    
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
    document.addEventListener('DOMContentLoaded', initBookInfoModal);
} else {
    initBookInfoModal();
}