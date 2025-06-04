document.addEventListener('DOMContentLoaded', function() {
    const bookGrid = document.getElementById('bookGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const categoryFilter = document.getElementById('category');
    const sortFilter = document.getElementById('sort');
    let allBooks = [];

    // Check if user is logged in
    const username = sessionStorage.getItem('username');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    // Update user info in the header
    const userNameElement = document.querySelector('.user-name');
    const userCreditElement = document.querySelector('.user-credit');
    
    if (userNameElement) {
        userNameElement.textContent = username;
    }
    
    // Get user credit from localStorage
    const userCredit = localStorage.getItem(`${username}_credit`) || '0';
    if (userCreditElement) {
        userCreditElement.textContent = `${userCredit} credits`;
    }

    // Function to create a book card element
    function createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';

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

        // Solving image loading issues
        const imgElement = card.querySelector('.book-image img');
        if (imgElement) {
            imgElement.onerror = function() {
                console.error('Failed to load image for:', book.title, 'Data status:', book.imageCover ? 'Available' : 'Not Available');
                this.src = '../assets/book-placeholder.png';
                this.onerror = null;
            };
        }
        return card;
    }

    // Fetch books from the database
    async function fetchBooks() {
        try {
            loadingSpinner.style.display = 'flex';
            
            if (allBooks.length > 0) {
                displayBooks(allBooks);
                return allBooks;
            }

            const response = await fetch('http://localhost:8080/mm/items/approved');
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }
            
            const books = await response.json();
            allBooks = books;

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
        
        // Sort books
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

    // Function to display books
    async function displayBooks(books) {
        if (!books || books.length === 0) {
             bookGrid.innerHTML = '<div class="no-books">No approved books available.</div>';
             return;
        }

        const filteredBooks = filterAndSortBooks(books);
    
        bookGrid.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        
        filteredBooks.forEach(book => {
            const card = createBookCard(book);
            fragment.appendChild(card);
        });
        
        bookGrid.appendChild(fragment);
    }

    // Debounce function to limit the rate of function execution
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

    // Add event listeners for category and sort filters with debounce
    const debouncedDisplayBooks = debounce(displayBooks, 300);
    categoryFilter.addEventListener('change', debouncedDisplayBooks);
    sortFilter.addEventListener('change', debouncedDisplayBooks);

    fetchBooks();

    // Logout functionality
    const logoutButton = document.querySelector('.dropdown-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    if (searchInput && searchButton) {
        // Function to perform search
        function performSearch() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            if (!searchTerm) {
                // If search field is empty, display all books (cached in allBooks)
                displayBooks(allBooks);
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