document.addEventListener('DOMContentLoaded', function() {
    // Get filter elements
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const statusCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const dateRadios = document.querySelectorAll('input[name="date-filter"]');
    const materialItems = document.querySelectorAll('.material-item');
    
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
});
