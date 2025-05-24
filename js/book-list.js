document.addEventListener('DOMContentLoaded', function() {
    const bookGrid = document.querySelector('.book-grid-container');
    const API_URL = 'http://localhost:8080/mm/items/approved'; // Update with your actual API URL

    // Show loading state
    function showLoading() {
        bookGrid.innerHTML = '<div class="loading">Loading books...</div>';
    }

    // Show error state
    function showError(message) {
        bookGrid.innerHTML = `<div class="error">${message}</div>`;
    }

    // Create book card HTML
    function createBookCard(book) {
        return `
            <div class="book-card">
                <div class="book-image">
                    <img src="${book.imageUrl || '../assets/book-placeholder.png'}" alt="${book.title}" onerror="this.src='../assets/book-placeholder.png'">
                </div>
                <div class="book-details">
                    <h3 class="book-title">${book.title}</h3>
                    <a href="book-info.html?itemId=${book.id}" class="btn-get">Get</a>
                </div>
            </div>
        `;
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
            
            // Clear loading/error message
            bookGrid.innerHTML = '';
            
            // Add each book to the grid
            books.forEach(book => {
                const bookElement = document.createElement('div');
                bookElement.innerHTML = createBookCard(book);
                bookGrid.appendChild(bookElement.firstElementChild);
            });
            
        } catch (error) {
            console.error('Error fetching books:', error);
            showError('Failed to load books. Please try again later.');
        }
    }

    // Initialize the page
    fetchApprovedBooks();
});
