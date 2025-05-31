document.addEventListener('DOMContentLoaded', function() {
    // Get filter elements
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const statusCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const dateRadios = document.querySelectorAll('input[name="date-filter"]');
    
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
    console.log('Fetching materials for user ID:', currentUserId);
    
    // Fetch materials from the API
    fetchUserMaterials(currentUserId);
    
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
    
    // Handle "All" checkbox for status
    const allStatusCheckbox = document.querySelector('.filter-options input[value="all"]');
    allStatusCheckbox.addEventListener('change', function() {
        if (this.checked) {
            statusCheckboxes.forEach(checkbox => {
                if (checkbox.value !== 'all') {
                    checkbox.checked = false;
                }
            });
        }
    });
    
    // Handle other status checkboxes
    statusCheckboxes.forEach(checkbox => {
        if (checkbox.value !== 'all') {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    allStatusCheckbox.checked = false;
                }
                
                // If no checkbox is selected, select "All"
                const anyChecked = Array.from(statusCheckboxes).some(cb => cb.checked && cb.value !== 'all');
                if (!anyChecked) {
                    allStatusCheckbox.checked = true;
                }
            });
        }
    });
    
    // Apply filters
    applyFiltersBtn.addEventListener('click', function() {
        // Get selected status filters
        const selectedStatuses = [];
        let filterByAllStatuses = false;
        
        statusCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                if (checkbox.value === 'all') {
                    filterByAllStatuses = true;
                } else {
                    selectedStatuses.push(checkbox.value);
                }
            }
        });
        
        // Get selected date filter
        let selectedDateFilter = '';
        dateRadios.forEach(radio => {
            if (radio.checked) {
                selectedDateFilter = radio.value;
            }
        });
        
        // Apply filters to material items
        const materialItems = document.querySelectorAll('.material-item');
        materialItems.forEach(item => {
            // Status filtering
            const statusElement = item.querySelector('.material-status');
            const statusText = statusElement.textContent.toLowerCase();
            let statusMatch = filterByAllStatuses;
            
            if (!statusMatch) {
                selectedStatuses.forEach(status => {
                    if (statusText.includes(status)) {
                        statusMatch = true;
                    }
                });
            }
            
            // Date filtering
            const dateElement = item.querySelector('.material-date');
            const dateText = dateElement.textContent;
            let dateMatch = selectedDateFilter === 'all';
            
            if (!dateMatch) {
                const uploadDate = parseDate(dateText);
                const currentDate = new Date();
                
                switch (selectedDateFilter) {
                    case 'today':
                        dateMatch = isSameDay(uploadDate, currentDate);
                        break;
                    case 'week':
                        dateMatch = isWithinLastWeek(uploadDate, currentDate);
                        break;
                    case 'month':
                        dateMatch = isWithinLastMonth(uploadDate, currentDate);
                        break;
                }
            }
            
            // Show/hide based on combined filters
            if (statusMatch && dateMatch) {
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
        // Reset status checkboxes
        statusCheckboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === 'all';
        });
        
        // Reset date radio buttons
        dateRadios.forEach(radio => {
            radio.checked = radio.value === 'all';
        });
        
        // Show all material items
        const materialItems = document.querySelectorAll('.material-item');
        materialItems.forEach(item => {
            item.style.display = 'flex';
        });
        
        // Close dropdown after resetting
        filterDropdown.classList.remove('show');
    });
    
    // Helper functions for date parsing and comparison
    function parseDate(dateString) {
        // Extract date from format "Uploaded Date: DD - MM - YYYY"
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
    
    // Function to fetch user materials from the API
    async function fetchUserMaterials(username) {
        try {
            // Display loading message
            displayLoadingMessage('Loading your materials...');
            
            // Add a timestamp to prevent caching
            const timestamp = new Date().getTime();
            console.log(`Attempting to fetch from: http://localhost:8080/mm/items/student/${username}?_=${timestamp}`);
            
            // Fetch materials from the API
            let materials = [];
            try {
                const response = await fetch(`http://localhost:8080/mm/items/student/${username}?_=${timestamp}`, {
                    // Add cache control headers
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
                
                // Only try to parse as JSON if we have a non-empty response
                if (responseText && responseText.trim() !== '') {
                    try {
                        materials = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error('Error parsing JSON:', parseError);
                        throw new Error('Invalid JSON response from server');
                    }
                }
                
                console.log('Processed materials from API:', materials);
            } catch (apiError) {
                console.error('API error:', apiError);
                displayErrorMessage(`Error loading materials: ${apiError.message}. Please try again later.`);
                return; // Exit the function early
            }
            
            // Display the materials (either from API or fallback)
            displayMaterials(materials);
        } catch (error) {
            console.error('Error in fetchUserMaterials:', error);
            displayErrorMessage('Failed to load materials. Please try again later.');
        }
    }
    
    // Function to display materials in the UI
    function displayMaterials(materials) {
        const materialsContainer = document.querySelector('.materials');
        
        // Clear existing content
        materialsContainer.innerHTML = '';
        
        if (!materials || materials.length === 0) {
            materialsContainer.innerHTML = '<div class="no-materials">No materials found</div>';
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
        const item = document.createElement('div');
        item.className = 'material-item';
        
        // Format date (assuming material.uploadDate is in ISO format)
        const uploadDate = material.uploadDate ? new Date(material.uploadDate) : new Date();
        const formattedDate = `${uploadDate.getDate()} - ${uploadDate.getMonth() + 1} - ${uploadDate.getFullYear()}`;
        
        // Determine status class based on approvingStatus from API
        const status = material.approvingStatus || 'Pending';
        const statusClass = status.toLowerCase();
        
        item.innerHTML = `
            <div class="material-thumbnail"></div>
            <div class="material-info">
                <h3 class="material-title">${material.title || 'Untitled Material'}</h3>
                <p class="material-date">Uploaded Date: ${formattedDate}</p>
            </div>
            <div class="material-status ${statusClass}">
                <span>Status: ${status}</span>
            </div>
        `;
        
        return item;
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

