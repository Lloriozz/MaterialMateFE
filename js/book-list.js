document.addEventListener('DOMContentLoaded', function() {
    const bookGrid = document.getElementById('bookGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const categoryFilter = document.getElementById('category');
    const sortFilter = document.getElementById('sort');
    let allBooks = []; // Cache toàn bộ danh sách sách

    // Kiểm tra đăng nhập
    const username = sessionStorage.getItem('username');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    // Cập nhật thông tin user
    const userNameElement = document.querySelector('.user-name');
    const userCreditElement = document.querySelector('.user-credit');
    
    if (userNameElement) {
        userNameElement.textContent = username;
    }
    
    // Lấy credit từ localStorage
    const userCredit = localStorage.getItem(`${username}_credit`) || '0';
    if (userCreditElement) {
        userCreditElement.textContent = `${userCredit} credits`;
    }

    // Hàm tạo book card
    function createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';

        // Tạo template string một lần
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

        // Thêm event listener cho ảnh để xử lý lỗi tải ảnh
        const imgElement = card.querySelector('.book-image img');
        if (imgElement) {
            imgElement.onerror = function() {
                console.error('Failed to load image for:', book.title, 'Data status:', book.imageCover ? 'Available' : 'Not Available');
                // Đặt ảnh placeholder
                this.src = '../assets/book-placeholder.png';
                // Ngăn console log lỗi 404 liên tục cho placeholder nếu nó cũng không tồn tại
                this.onerror = null;
            };
        }

        // Thêm sự kiện click cho toàn bộ card (tùy chọn, nếu muốn click vào card cũng chuyển trang)
        // card.addEventListener('click', () => {
        //     sessionStorage.setItem('selectedBook', JSON.stringify(book));
        //     window.location.href = 'book-detail.html?itemId=${book.itemID}';
        // });

        return card;
    }

    // Hàm lấy danh sách sách từ database
    async function fetchBooks() {
        try {
            loadingSpinner.style.display = 'flex';
            
            // Kiểm tra cache trước
            if (allBooks.length > 0) {
                // Nếu có cache, hiển thị từ cache ngay lập tức
                displayBooks(allBooks);
                return allBooks;
            }

            const response = await fetch('http://localhost:8080/mm/items/approved');
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }
            
            const books = await response.json(); // Lấy dữ liệu sách
            allBooks = books; // Lưu vào cache
            
            // Hiển thị sách sau khi fetch thành công
            displayBooks(allBooks);

            return allBooks;
        } catch (error) {
            console.error('Error fetching books:', error);
            bookGrid.innerHTML = '<div class="error-message">Lỗi khi tải sách. Vui lòng thử lại sau.</div>';
            return [];
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // Hàm lọc và sắp xếp sách
    function filterAndSortBooks(books) {
        let filteredBooks = [...books];
        
        // Lọc theo category
        const selectedCategory = categoryFilter.value;
        if (selectedCategory) {
            filteredBooks = filteredBooks.filter(book => 
                book.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }
        
        // Sắp xếp
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

    // Hàm hiển thị sách với virtual scrolling
    async function displayBooks(books) {
        // Đảm bảo có dữ liệu sách trước khi hiển thị
        if (!books || books.length === 0) {
             bookGrid.innerHTML = '<div class="no-books">Không có sách nào được duyệt.</div>';
             return;
        }

        const filteredBooks = filterAndSortBooks(books);
        
        // Xóa nội dung cũ
        bookGrid.innerHTML = '';
        
        // Tạo DocumentFragment để tối ưu việc thêm DOM
        const fragment = document.createDocumentFragment();
        
        // Thêm các book card vào fragment
        filteredBooks.forEach(book => {
            const card = createBookCard(book);
            fragment.appendChild(card);
        });
        
        // Thêm fragment vào DOM một lần duy nhất
        bookGrid.appendChild(fragment);
    }

    // Thêm debounce cho các filter để tránh gọi API quá nhiều
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

    // Thêm sự kiện cho các filter với debounce
    const debouncedDisplayBooks = debounce(displayBooks, 300);
    categoryFilter.addEventListener('change', debouncedDisplayBooks);
    sortFilter.addEventListener('change', debouncedDisplayBooks);

    // Hiển thị sách khi trang được tải
    fetchBooks(); // Gọi hàm fetchBooks để lấy và hiển thị sách

    // Xử lý đăng xuất
    const logoutButton = document.querySelector('.dropdown-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // Thêm chức năng tìm kiếm
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    if (searchInput && searchButton) {
        // Hàm thực hiện tìm kiếm
        function performSearch() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            if (!searchTerm) {
                // Nếu ô tìm kiếm trống, hiển thị lại tất cả sách (đã được cache trong allBooks)
                displayBooks(allBooks); // Sử dụng lại hàm displayBooks nhưng với toàn bộ danh sách
                return;
            }

            // Lọc sách dựa trên tiêu đề (có thể thêm các trường khác như category, description nếu cần)
            const filteredBooks = allBooks.filter(book =>
                book.title.toLowerCase().includes(searchTerm)
            );

            // Hiển thị sách đã lọc
            if (filteredBooks.length === 0) {
                bookGrid.innerHTML = '<div class="no-books">Không tìm thấy sách nào phù hợp.</div>';
            } else {
                displayBooks(filteredBooks);
            }
        }

        // Thêm sự kiện click cho nút tìm kiếm
        searchButton.addEventListener('click', function(e) {
            e.preventDefault(); // Ngăn form submit
            performSearch();
        });

        // Thêm sự kiện keypress (Enter) cho input tìm kiếm
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Ngăn form submit
                performSearch();
            }
        });

        // Thêm sự kiện input để tìm kiếm khi người dùng gõ (có debounce)
        const debouncedPerformSearch = debounce(performSearch, 300); // Debounce 300ms
        searchInput.addEventListener('input', function() {
             // Nếu ô tìm kiếm trống, hiển thị lại toàn bộ sách ngay lập tức
             if (this.value.trim() === '') {
                 displayBooks(allBooks);
             } else {
                 // Ngược lại, gọi hàm tìm kiếm có debounce
                 debouncedPerformSearch();
             }
        });
    }
});