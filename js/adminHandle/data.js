document.addEventListener("DOMContentLoaded", () => {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll(".tab-btn")
    const tableContainers = document.querySelectorAll(".table-container")
  
    // Function to fetch student data
    async function fetchStudents() {
        console.log('Fetching student data...');
        try {
            const response = await fetch('http://localhost:8080/mm/students/all');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const students = await response.json();
            console.log('Student data fetched:', students);
            displayStudents(students);
        } catch (error) {
            console.error('Error fetching student data:', error);
            const studentTableBody = document.querySelector('#student-table tbody');
            if (studentTableBody) {
                 studentTableBody.innerHTML = '<tr><td colspan="10">Error loading student data.</td></tr>';
            }
        }
    }

    // Function to fetch material (items) data
    async function fetchItems() {
        console.log('Fetching item data...');
        try {
            const response = await fetch('http://localhost:8080/mm/items/all');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const items = await response.json();
            console.log('Item data fetched:', items);
            displayItems(items);
        } catch (error) {
            console.error('Error fetching item data:', error);
            const itemTableBody = document.querySelector('#item-table tbody');
            if (itemTableBody) {
                itemTableBody.innerHTML = '<tr><td colspan="10">Error loading item data.</td></tr>';
            }
        }
    }

    // Function to fetch category data
    async function fetchCategories() {
        console.log('Fetching category data...');
        try {
            const response = await fetch('http://localhost:8080/mm/categories/all');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const categories = await response.json();
            console.log('Category data fetched:', categories);
            displayCategories(categories);
        } catch (error) {
            console.error('Error fetching category data:', error);
            const categoryTableBody = document.querySelector('#category-table tbody');
            if (categoryTableBody) {
                categoryTableBody.innerHTML = '<tr><td colspan="2">Error loading category data.</td></tr>'; // Update colspan if number of columns changes
            }
        }
    }

    // Function to fetch admin data
    async function fetchAdmins() {
        console.log('Fetching admin data...');
        try {
            const response = await fetch('http://localhost:8080/mm/admins/all');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const admins = await response.json();
            console.log('Admin data fetched:', admins);
            displayAdmins(admins);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            const adminTableBody = document.querySelector('#admin-table tbody');
            if (adminTableBody) {
                adminTableBody.innerHTML = '<tr><td colspan="7">Error loading admin data.</td></tr>'; // Update colspan
            }
        }
    }

    // Function to display student data in table
    function displayStudents(students) {
        const studentTableBody = document.querySelector('#student-table tbody');
        if (!studentTableBody) return;

        studentTableBody.innerHTML = ''; // Clear fake data

        if (!students || students.length === 0) {
            studentTableBody.innerHTML = '<tr><td colspan="10">No student data available.</td></tr>';
            return;
        }

        students.forEach(student => {
            const row = document.createElement('tr');
            // Assume student object structure from API matches table columns
            row.innerHTML = `
                <td>${student.studentID || 'N/A'}</td>
                <td>${student.country || 'N/A'}</td>
                <td>${student.email || 'N/A'}</td>
                <td>${student.firstName || 'N/A'}</td>
                <td>${student.lastName || 'N/A'}</td>
                <td>********</td> <!-- Don't display actual password -->
                <td>${student.phoneNumber || 'N/A'}</td>
                <td>${student.totalCredit || 0}</td>
                <td>${student.university || 'N/A'}</td>
                <td>${student.username || 'N/A'}</td>
            `;
            studentTableBody.appendChild(row);
        });
    }

    // Function to display material data in table
    function displayItems(items) {
        const itemTableBody = document.querySelector('#item-table tbody');
        if (!itemTableBody) return;

        itemTableBody.innerHTML = ''; // Clear fake data

        if (!items || items.length === 0) {
            itemTableBody.innerHTML = '<tr><td colspan="10">No item data available.</td></tr>';
            return;
        }

        items.forEach(item => {
            const row = document.createElement('tr');
            // Assume item object structure from API matches table columns
            row.innerHTML = `
                <td>${item.itemID || 'N/A'}</td>
                <td>${item.approvingStatus || 'Pending'}</td>
                <td>${item.approverID || 'N/A'}</td>
                <td>${item.category || 'N/A'}</td>
                <td>
                    ${item.coverImage ? 
                        `<img src="data:image/jpeg;base64,${item.coverImage}" alt="Cover" style="width: 50px; height: auto;">` 
                        : 'No Cover'}
                </td>
                <td>${item.description || 'N/A'}</td>
                 <td>${item.fileData ? 'Available' : 'N/A'}</td>
                <td>${item.title || 'N/A'}</td>
                <td>${item.uploadDate || 'N/A'}</td>
                <td>${item.uploaderID || 'N/A'}</td>
            `;
            itemTableBody.appendChild(row);
        });
    }

    // Function to display admin data in table
    function displayAdmins(admins) {
        const adminTableBody = document.querySelector('#admin-table tbody');
        if (!adminTableBody) return;

        adminTableBody.innerHTML = ''; // Clear old data

        if (!admins || admins.length === 0) {
            adminTableBody.innerHTML = '<tr><td colspan="7">No admin data available.</td></tr>'; // Update colspan
            return;
        }

        admins.forEach(admin => {
            const row = document.createElement('tr');
            // Assume admin object structure from API matches table columns
            row.innerHTML = `
                <td>${admin.adminID || 'N/A'}</td>
                <td>${admin.email || 'N/A'}</td>
                <td>${admin.firstName || 'N/A'}</td>
                <td>${admin.lastName || 'N/A'}</td>
                <td>********</td> <!-- Don't display actual password -->
                <td>${admin.phoneNumber || 'N/A'}</td>
                <td>${admin.username || 'N/A'}</td>
            `;
            adminTableBody.appendChild(row);
        });
    }

    // Function to display exchange info data in table
    function displayExchangeInfos(exchangeInfos) {
        const exchangeInfoTableBody = document.querySelector('#exchange-info-table tbody');
        if (!exchangeInfoTableBody) return;

        exchangeInfoTableBody.innerHTML = ''; // Clear old data

        if (!exchangeInfos || exchangeInfos.length === 0) {
            exchangeInfoTableBody.innerHTML = '<tr><td colspan="5">No exchange info data available.</td></tr>'; // Update colspan
            return;
        }

        exchangeInfos.forEach(exchangeInfo => {
            const row = document.createElement('tr');
            // Assume exchangeInfo object structure from API matches table columns
            row.innerHTML = `
                <td>${exchangeInfo.exchangeID || 'N/A'}</td>
                <td>${exchangeInfo.studentId || 'N/A'}</td>
                <td>${exchangeInfo.itemId || 'N/A'}</td>
                <td>${exchangeInfo.exchangeDate || 'N/A'}</td>
                <td>${exchangeInfo.amount || 0}</td>
            `;
            exchangeInfoTableBody.appendChild(row);
        });
    }

    // Function to display category data in table
    function displayCategories(categories) {
        const categoryTableBody = document.querySelector('#category-table tbody');
        if (!categoryTableBody) return;

        categoryTableBody.innerHTML = ''; // Clear old data

        if (!categories || categories.length === 0) {
            categoryTableBody.innerHTML = '<tr><td colspan="2">No category data available.</td></tr>'; // Update colspan if number of columns changes
            return;
        }

        categories.forEach(category => {
            const row = document.createElement('tr');
            // Assume category object structure from API matches table columns
            row.innerHTML = `
                <td>${category.categoryID || 'N/A'}</td>
                <td>${category.categoryName || 'N/A'}</td>
            `;
            categoryTableBody.appendChild(row);
        });
    }
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons and tables
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tableContainers.forEach((container) => container.classList.remove("active"))
  
        // Add active class to clicked button
        this.classList.add("active")
  
        // Show corresponding table
        const tableId = this.getAttribute("data-table") + "-table"
        const activeTableContainer = document.getElementById(tableId)
        if (activeTableContainer) {
             activeTableContainer.classList.add("active")
             
             // Fetch data based on the active tab
             const tableName = this.getAttribute("data-table")
             if (tableName === 'student') {
                 fetchStudents()
             } else if (tableName === 'item') {
                 fetchItems()
             } else if (tableName === 'admin') {
                 fetchAdmins()
             } else if (tableName === 'category') {
                 fetchCategories()
             } else if (tableName === 'exchange-info') {
                  fetchExchangeInfos()
             }
        }
      })
    })
  
    // Initial data fetch for the active tab
    const activeTab = document.querySelector('.tab-btn.active')
    if (activeTab) {
      const tableName = activeTab.getAttribute("data-table")
      if (tableName === 'student') {
        fetchStudents()
      } else if (tableName === 'item') {
        fetchItems()
      } else if (tableName === 'admin') {
        fetchAdmins()
      } else if (tableName === 'category') {
        fetchCategories()
      } else if (tableName === 'exchange-info') {
        fetchExchangeInfos()
      }
    }
  
    // Table search functionality
    const searchInput = document.querySelector(".search-bar input")
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase()
  
        // Only search in the active table
        const activeTable = document.querySelector(".table-container.active")
        if (!activeTable) return
  
        const rows = activeTable.querySelectorAll("tbody tr")
  
        rows.forEach((row) => {
          const text = row.textContent.toLowerCase()
          if (text.includes(searchTerm)) {
            row.style.display = ""
          } else {
            row.style.display = "none"
          }
        })
      })
    }
  
    // Add responsive table behavior
    const tables = document.querySelectorAll(".data-table")
    tables.forEach((table) => {
      const headerHeight = table.querySelector("thead").offsetHeight
      table.style.setProperty("--header-height", headerHeight + "px")
    })
  })
  