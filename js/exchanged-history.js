document.addEventListener('DOMContentLoaded', function() {
    // Get filter elements
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const dateRadios = document.querySelectorAll('input[name="date-filter"]');
    const materialItems = document.querySelectorAll('.material-item');
    
    // Materials container
    const materialsContainer = document.querySelector('.materials');
    
    // Try to get the user ID from sessionStorage or localStorage
    let currentUserId = sessionStorage.getItem('currentUserId');
    
    // If not in sessionStorage, try localStorage as a backup
    if (!currentUserId) {
        currentUserId = localStorage.getItem('currentUserId');
        if (currentUserId) {
            console.log('User ID found in localStorage:', currentUserId);
            // Copy to sessionStorage for consistency
            sessionStorage.setItem('currentUserId', currentUserId);
        }
    } else {
        console.log('User ID found in sessionStorage:', currentUserId);
    }
    
    // If still no user ID, use a default
    if (!currentUserId) {
        currentUserId = '1'; // Default user ID for testing
        console.log('No user ID found, using default:', currentUserId);
    }
    
    // Clear any cached data before fetching
    console.log('Fetching exchanged materials for user ID:', currentUserId);
    
    // Fetch materials from the API
    fetchExchangedMaterials(currentUserId);
    
    // Toggle filter dropdown
    filterBtn.addEventListener('click', function() {
        filterDropdown.classList.toggle('show');
    });
    
    // Close the dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.filter-btn') && !filterDropdown.contains(event.target)) {
            filterDropdown.classList.remove('show');
        }
    });
    
    // Apply filters
    applyFiltersBtn.addEventListener('click', function() {
        // Get selected date filter
        let selectedDateFilter = '';
        dateRadios.forEach(radio => {
            if (radio.checked) {
                selectedDateFilter = radio.value;
            }
        });
        
        // Apply filters to material items
        materialItems.forEach(item => {
            // Date filtering
            const dateElement = item.querySelector('.material-date');
            const dateText = dateElement.textContent;
            let dateMatch = selectedDateFilter === 'all';
            
            if (!dateMatch) {
                const exchangeDate = parseDate(dateText);
                const currentDate = new Date();
                
                switch (selectedDateFilter) {
                    case 'today':
                        dateMatch = isSameDay(exchangeDate, currentDate);
                        break;
                    case 'week':
                        dateMatch = isWithinLastWeek(exchangeDate, currentDate);
                        break;
                    case 'month':
                        dateMatch = isWithinLastMonth(exchangeDate, currentDate);
                        break;
                    case 'year':
                        dateMatch = isWithinLastYear(exchangeDate, currentDate);
                        break;
                }
            }
            
            // Show/hide based on date filter
            if (dateMatch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Close dropdown after applying filters
        filterDropdown.classList.remove('show');
    });
    
    // Reset filters
    resetFiltersBtn.addEventListener('click', function() {
        // Reset date radio buttons
        dateRadios.forEach(radio => {
            radio.checked = radio.value === 'all';
        });
        
        // Show all material items
        materialItems.forEach(item => {
            item.style.display = 'flex';
        });
        
        // Close dropdown after resetting
        filterDropdown.classList.remove('show');
    });
    
    // Helper functions for date parsing and comparison
    function parseDate(dateString) {
        // Extract date from format "Exchanged in: DD - MM - YYYY"
        const parts = dateString.match(/(\d+)\s*-\s*(\d+)\s*-\s*(\d+)/);
        if (parts) {
            // Note: JavaScript months are 0-indexed
            return new Date(parts[3], parts[2] - 1, parts[1]);
        }
        return new Date();
    }
    
    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    function isWithinLastWeek(date, currentDate) {
        const oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(currentDate.getDate() - 7);
        return date >= oneWeekAgo && date <= currentDate;
    }
    
    function isWithinLastMonth(date, currentDate) {
        const oneMonthAgo = new Date(currentDate);
        oneMonthAgo.setMonth(currentDate.getMonth() - 1);
        return date >= oneMonthAgo && date <= currentDate;
    }
    
    function isWithinLastYear(date, currentDate) {
        const oneYearAgo = new Date(currentDate);
        oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
        return date >= oneYearAgo && date <= currentDate;
    }
    
    // Function to fetch user materials from the API
    async function fetchExchangedMaterials(studentId) {
        try {
            displayLoadingMessage('Loading exchanged materials...');
            
            const timestamp = new Date().getTime();
            console.log(`Attempting to fetch from: http://localhost:8080/mm/exchanges/downloads/${studentId}?_=${timestamp}`);
            
            let materials = [];
            try {
                const response = await fetch(`http://localhost:8080/mm/exchanges/downloads/${studentId}?_=${timestamp}`, {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const responseText = await response.text();
                console.log('Raw API response:', responseText);
                
                if (responseText && responseText.trim() !== '') {
                    try {
                        materials = JSON.parse(responseText);
                        console.log('Parsed materials:', materials);
                    } catch (parseError) {
                        console.error('Error parsing JSON:', parseError);
                        throw new Error('Invalid JSON response from server');
                    }
                } else {
                    console.log('API returned empty response, assuming no materials.');
                }
            } catch (apiError) {
                console.error('API error:', apiError);
                displayErrorMessage(`Error loading exchanged materials: ${apiError.message}. Please try again later.`);
                return;
            }
            
            // Fetch additional details for each material
            const materialsWithDetails = await Promise.all(materials.map(async (material) => {
                try {
                    console.log('Processing material:', material);
                    
                    // Check if material has item and itemID
                    if (!material.item || !material.item.itemID) {
                        console.error('No item or itemID found in material:', material);
                        return {
                            ...material,
                            title: 'Error: No item ID',
                            imageCover: null,
                            category: 'Unknown',
                            pdfFile: null,
                            uploader: 'Unknown'
                        };
                    }
                    
                    const itemID = material.item.itemID;
                    
                    // Fetch item details using itemID
                    console.log(`Fetching item details for itemID: ${itemID}`);
                    const itemResponse = await fetch(`http://localhost:8080/mm/items/${itemID}`);
                    if (!itemResponse.ok) {
                        throw new Error(`Failed to fetch item details: ${itemResponse.status}`);
                    }
                    const itemDetails = await itemResponse.json();
                    console.log('Item details:', itemDetails);
                    
                    // Fetch uploader username using studentID
                    console.log(`Fetching username for studentID: ${itemDetails.uploaderID}`);
                    const uploaderResponse = await fetch(`http://localhost:8080/mm/students/username/${itemDetails.uploaderID}`);
                    if (!uploaderResponse.ok) {
                        throw new Error(`Failed to fetch uploader details: ${uploaderResponse.status}`);
                    }
                    const uploaderDetails = await uploaderResponse.json();
                    console.log('Uploader details:', uploaderDetails);
                    
                    return {
                        ...material,
                        title: itemDetails.title || 'Untitled',
                        imageCover: itemDetails.coverImage || null,
                        category: itemDetails.category || 'Uncategorized',
                        pdfFile: itemDetails.fileData || null,
                        uploader: uploaderDetails.username || 'Unknown'
                    };
                } catch (error) {
                    console.error('Error fetching details:', error);
                    return {
                        ...material,
                        title: 'Error loading title',
                        imageCover: null,
                        category: 'Unknown',
                        pdfFile: null,
                        uploader: 'Unknown'
                    };
                }
            }));
            
            console.log('Final materials with details:', materialsWithDetails);
            displayExchangedMaterials(materialsWithDetails);
        } catch (error) {
            console.error('Error in fetchExchangedMaterials:', error);
            displayErrorMessage('Failed to load exchanged materials. Please try again later.');
        }
    }
    
    // Function to display materials in the UI
    function displayExchangedMaterials(materials) {
        const materialsContainer = document.querySelector('.materials');
        
        // Clear existing content
        materialsContainer.innerHTML = '';
        
        if (!materials || materials.length === 0) {
            materialsContainer.innerHTML = '<div class="no-materials">No exchanged materials found</div>';
            return;
        }
        
        // Create material items
        materials.forEach(material => {
            const materialItem = createMaterialItem(material);
            materialsContainer.appendChild(materialItem);
        });
    }
    
    // Function to create a material item element
    function createMaterialItem(material) {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';
        
        // Format date
        const exchangeDate = new Date(material.date);
        const formattedDate = `${exchangeDate.getDate()} - ${exchangeDate.getMonth() + 1} - ${exchangeDate.getFullYear()}`;
        
        // Create image source
        let imageSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        if (material.imageCover) {
            imageSrc = `data:image/jpeg;base64,${material.imageCover}`;
        }
        
        materialItem.innerHTML = `
            <div class="material-image">
                <img src="${imageSrc}" 
                     alt="${material.title}"
                     onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='">
            </div>
            <div class="material-info">
                <h3 class="material-title">${material.title}</h3>
                <p class="material-category">Category: ${material.category}</p>
                <p class="material-uploader">Uploaded by: ${material.uploader}</p>
                <p class="material-date">Exchanged in: ${formattedDate}</p>
            </div>
            <div class="material-actions">
                <button class="view-btn" onclick="viewPDF('${material.pdfFile}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="download-btn" onclick="downloadPDF('${material.pdfFile}', '${material.title}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
        
        return materialItem;
    }
    
    // Function to display error message
    function displayErrorMessage(message) {
        const materialsContainer = document.querySelector('.materials');
        materialsContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
    
    // Function to display loading message
    function displayLoadingMessage(message) {
        const materialsContainer = document.querySelector('.materials');
        materialsContainer.innerHTML = `<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> ${message}</div>`;
    }
});

// Function to view PDF in a new tab
function viewPDF(pdfBase64) {
    if (!pdfBase64) {
        alert('PDF file not available');
        return;
    }
    
    try {
        // Convert base64 to blob
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Open PDF in new window
        const newWindow = window.open(blobUrl, '_blank');
        if (!newWindow) {
            alert('Please allow popups to view PDF files');
        }
        
        // Clean up URL after a delay
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1000);
    } catch (error) {
        console.error('Error viewing PDF:', error);
        alert('Error viewing PDF file. Please try again.');
    }
}

// Function to download PDF
function downloadPDF(pdfBase64, title) {
    if (!pdfBase64) {
        alert('PDF file not available');
        return;
    }
    
    try {
        // Convert base64 to blob
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1000);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF file. Please try again.');
    }
}
