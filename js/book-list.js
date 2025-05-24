document.addEventListener('DOMContentLoaded', function() {
    const bookGrid = document.querySelector('.book-grid-container');
    const API_URL = 'http://localhost:8080/mm/items/approved';

    // Show loading state
    function showLoading() {
        bookGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading books...</div>';
    }

    // Show error state
    function showError(message) {
        bookGrid.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    }

    // Create book card HTML
    function createBookCard(book) {
        return `
            <div class="book-card">
                <div class="book-image">
                    <img src="${book.imageUrl || '../assets/book-placeholder.png'}" 
                         alt="${book.title || 'Book cover'}" 
                         onerror="this.src='../assets/book-placeholder.png'">
                </div>
                <div class="book-details">
                    <h3 class="book-title">${book.title || 'No Title Available'}</h3>
                    <a href="book-info.html?itemId=${book.id}" class="btn-get">Get</a>
                </div>
            </div>
        `;
    }

    // Create placeholder books for testing (12 books to fill 3 rows of 4)
    function createPlaceholderBooks() {
        const placeholderBooks = [
            {
                id: 1,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 2,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 3,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 4,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 5,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 6,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 7,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 8,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 9,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 10,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 11,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            },
            {
                id: 12,
                title: "Đề cương ôn thi triết học mác lê nin",
                imageUrl: "../assets/book-placeholder.png"
            }
        ];
        
        return placeholderBooks;
    }

    // Fetch approved books from the API
    async function fetchApprovedBooks() {
        showLoading();
        
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const books = await response.json();
            
            if (books.length === 0) {
                showError('No books available at the moment.');
                return;
            }
            
            displayBooks(books);
            
        } catch (error) {
            console.error('Error fetching books:', error);
            
            // For development: show placeholder books if API fails
            console.log('API failed, showing placeholder books for development...');
            const placeholderBooks = createPlaceholderBooks();
            displayBooks(placeholderBooks);
        }
    }

    // Display books in the grid
    function displayBooks(books) {
        // Clear loading/error message
        bookGrid.innerHTML = '';
        
        // Add each book to the grid
        books.forEach(book => {
            const bookCardHTML = createBookCard(book);
            bookGrid.insertAdjacentHTML('beforeend', bookCardHTML);
        });
    }

    // Initialize the page
    fetchApprovedBooks();

    // Optional: Add search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    if (searchInput && searchButton) {
        let allBooks = [];
        
        const originalDisplayBooks = displayBooks;
        displayBooks = function(books) {
            allBooks = books;
            originalDisplayBooks(books);
        };
        
        function performSearch() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            if (!searchTerm) {
                originalDisplayBooks(allBooks);
                return;
            }
            
            const filteredBooks = allBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm)
            );
            
            if (filteredBooks.length === 0) {
                showError(`No books found for "${searchTerm}"`);
            } else {
                originalDisplayBooks(filteredBooks);
            }
        }
        
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                originalDisplayBooks(allBooks);
            }
        });
    }
});