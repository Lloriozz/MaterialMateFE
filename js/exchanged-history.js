document.addEventListener('DOMContentLoaded', function() {
    // Get filter elements
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
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
});
