document.addEventListener('DOMContentLoaded', function() {
    const bookGrid = document.getElementById('bookGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const categoryFilter = document.getElementById('category');
    const sortFilter = document.getElementById('sort');
    let allBooks = []; // Cache entire book list

    // Check login status
    const username = sessionStorage.getItem('username');
    if (!username) {
        window.location.href = '../login.html';
        return;
    }

    // Update user information
    const userNameElement = document.querySelector('.user-name');
    const userCreditElement = document.querySelector('.user-credit');
    
    if (userNameElement) {
        userNameElement.textContent = username;
    }
    
    // Get credit from localStorage
    const userCredit = localStorage.getItem(`${username}_credit`) || '0';
    if (userCreditElement) {
        userCreditElement.textContent = `${userCredit} credits`;
    }

    // Function to create book card
    function createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';

        // Create template string once
        console.log('Book title:', book.title);
        console.log('Image cover data:', book.imageCover ? 'Available' : 'Not Available');

        const template = `
            <div class="book-image">
                <img src="data:image/jpeg;base64,${book.coverImage || ''}" 
                     alt="${book.title}" 
                     loading="lazy">
            </div>
            <div class="book-details">
                <h3 class="book-title">${book.title || 'No Title Available'}</h3>
                <p class="book-category">Category: ${book.category || 'N/A'}</p>
                <div class="book-meta">
                     <a href="book-info.html?itemId=${book.itemID}" class="btn-get">Get</a>
                </div>
            </div>
        `;

        card.innerHTML = template;

        // Add event listener for image to handle loading errors
        const imgElement = card.querySelector('.book-image img');
        if (imgElement) {
            imgElement.onerror = function() {
                console.error('Failed to load image for:', book.title, 'Data status:', book.imageCover ? 'Available' : 'Not Available');
                // Set placeholder image
                this.src = '../assets/book-placeholder.png';
                // Prevent continuous 404 console logs for placeholder if it doesn't exist
                this.onerror = null;
            };
        }
        return card;
    }

    // Function to fetch book list from database
    async function fetchBooks() {
        try {
            loadingSpinner.style.display = 'flex';
            
            // Check cache first
            if (allBooks.length > 0) {
                // If cache exists, display from cache immediately
                displayBooks(allBooks);
                return allBooks;
            }

            const response = await fetch('http://localhost:8080/mm/items/approved');
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }
            
            const books = await response.json(); // Get book data
            allBooks = books; // Save to cache
            
            // Display books after successful fetch
            displayBooks(allBooks);

            return allBooks;
        } catch (error) {
            console.error('Error fetching books:', error);
            bookGrid.innerHTML = '<div class="error-message">Error loading books. Please try again later.</div>';
            return [];
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // Function to filter and sort books
    function filterAndSortBooks(books) {
        let filteredBooks = [...books];
        
        // Filter by category
        const selectedCategory = categoryFilter.value;
        if (selectedCategory) {
            filteredBooks = filteredBooks.filter(book => 
                book.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }
        
        // Sort
        const sortBy = sortFilter.value;
        switch (sortBy) {
            case 'newest':
                filteredBooks.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                break;
            case 'oldest':
                filteredBooks.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
                break;
            case 'title':
                filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        return filteredBooks;
    }

    // Function to display books with virtual scrolling
    async function displayBooks(books) {
        // Ensure there is book data before displaying
        if (!books || books.length === 0) {
             bookGrid.innerHTML = '<div class="no-books">No approved books available.</div>';
             return;
        }

        const filteredBooks = filterAndSortBooks(books);
        
        // Clear old content
        bookGrid.innerHTML = '';
        
        // Create DocumentFragment to optimize DOM addition
        const fragment = document.createDocumentFragment();
        
        // Add book cards to fragment
        filteredBooks.forEach(book => {
            const card = createBookCard(book);
            fragment.appendChild(card);
        });
        
        // Add fragment to DOM once
        bookGrid.appendChild(fragment);
    }

    // Add debounce for filters to avoid too many API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add events for filters with debounce
    const debouncedDisplayBooks = debounce(displayBooks, 300);
    categoryFilter.addEventListener('change', debouncedDisplayBooks);
    sortFilter.addEventListener('change', debouncedDisplayBooks);

    // Display books when page is loaded
    fetchBooks(); // Call fetchBooks to get and display books

    // Handle logout
    const logoutButton = document.querySelector('.dropdown-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // Add search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    if (searchInput && searchButton) {
        // Function to perform search
        function performSearch() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            if (!searchTerm) {
                // If search field is empty, display all books (cached in allBooks)
                displayBooks(allBooks); // Reuse displayBooks function with full list
                return;
            }

            // Filter books based on title (can add other fields like category, description if needed)
            const filteredBooks = allBooks.filter(book =>
                book.title.toLowerCase().includes(searchTerm)
            );

            // Display filtered books
            if (filteredBooks.length === 0) {
                bookGrid.innerHTML = '<div class="no-books">No matching books found.</div>';
            } else {
                displayBooks(filteredBooks);
            }
        }

        // Add click event for search button
        searchButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent form submission
            performSearch();
        });

        // Add keypress (Enter) event for search input
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                performSearch();
            }
        });

        // Add input event for search when user types (with debounce)
        const debouncedPerformSearch = debounce(performSearch, 300); // Debounce 300ms
        searchInput.addEventListener('input', function() {
             // If search field is empty, display all books immediately
             if (this.value.trim() === '') {
                 displayBooks(allBooks);
             } else {
                 // Otherwise, call debounced search function
                 debouncedPerformSearch();
             }
        });
    }
});