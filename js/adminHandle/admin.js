document.addEventListener('DOMContentLoaded', function() {
    console.log('admin.js loaded');

    // Container để hiển thị danh sách tài liệu
    const materialsListContainer = document.querySelector('.materials-list');

    // Hàm fetch tất cả tài liệu
    async function fetchAllMaterials() {
        console.log('Fetching all materials...');
        try {
            const response = await fetch('http://localhost:8080/mm/items/all');

            if (!response.ok) {
                console.error('Error fetching materials. Status:', response.status);
                materialsListContainer.innerHTML = '<div class="error-message">Error loading materials.</div>';
                return;
            }

            const materials = await response.json();
            console.log('Materials fetched:', materials);

            // Kiểm tra và xử lý dữ liệu trước khi hiển thị
            const validMaterials = materials.filter(material => {
                if (!material.itemID) {
                    console.warn('Material missing itemID:', material);
                    return false;
                }
                return true;
            });

            if (validMaterials.length === 0) {
                materialsListContainer.innerHTML = '<div class="no-materials">No valid materials found.</div>';
                return;
            }

            // Hiển thị tài liệu
            displayMaterials(validMaterials);

        } catch (error) {
            console.error('Error fetching materials:', error);
            materialsListContainer.innerHTML = '<div class="error-message">Error loading materials. Please check the server connection.</div>';
        }
    }

    // Hàm hiển thị danh sách tài liệu
    function displayMaterials(materials) {
        materialsListContainer.innerHTML = ''; // Xóa nội dung cũ

        if (!materials || materials.length === 0) {
            materialsListContainer.innerHTML = '<div class="no-materials">No materials found.</div>';
            return;
        }

        materials.forEach(material => {
            const materialItemElement = createMaterialItemElement(material);
            if (materialItemElement) {
                materialsListContainer.appendChild(materialItemElement);
            }
        });
    }

    // Hàm tạo phần tử HTML cho mỗi tài liệu
    function createMaterialItemElement(material) {
        if (!material || !material.itemID) {
            console.error('Invalid material data or missing itemID:', material);
            return null;
        }

        const item = document.createElement('div');
        item.className = 'material-item';
        item.dataset.itemId = material.itemID;

        // Định dạng ngày
        const uploadDate = material.uploadDate ? new Date(material.uploadDate) : new Date();
        const formattedDate = `${uploadDate.getDate()} - ${uploadDate.getMonth() + 1} - ${uploadDate.getFullYear()}`;
        
        // Xác định class và text cho trạng thái duyệt
        const status = material.approvingStatus || 'Pending';
        let statusClass = '';
        switch(status.toLowerCase()) {
            case 'approved': statusClass = 'status-approved'; break;
            case 'rejected': statusClass = 'status-rejected'; break;
            case 'pending': statusClass = 'status-pending'; break;
            default: statusClass = 'status-pending';
        }

        item.innerHTML = `
            <div class="material-thumbnail">
                <div class="placeholder-image"></div>
            </div>
            <div class="material-details">
                <h3 class="material-title">${material.title || 'Untitled Material'}</h3>
                <p class="material-date">Uploaded Date: ${formattedDate}</p>
                <div class="material-actions">
                    <button class="btn-view">View</button>
                    <button class="btn-accept">Accept</button>
                </div>
            </div>
            <div class="material-status">
                <span class="status-text ${statusClass}">Status: ${status}</span>
                <button class="btn-delete" data-action="reject">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Xử lý sự kiện cho nút View
        item.querySelector('.btn-view').addEventListener('click', () => {
            console.log('View clicked for item:', material.itemID);
            if (material.pdfUrl) {
                window.open(material.pdfUrl, '_blank');
            } else if (material.fileData) {
                const byteCharacters = atob(material.fileData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } else {
                alert('PDF file not available for viewing.');
            }
        });

        // Xử lý sự kiện cho nút Accept
        item.querySelector('.btn-accept').addEventListener('click', () => {
            console.log('Accept clicked for item:', material.itemID);
            updateMaterialStatus(material.itemID, 'Approved', item);
        });

        // Xử lý sự kiện cho nút Reject
        item.querySelector('.btn-delete').addEventListener('click', () => {
            console.log('Reject clicked for item:', material.itemID);
            if (confirm('Are you sure you want to reject this material?')) {
                updateMaterialStatus(material.itemID, 'Rejected', item);
            }
        });

        // Xử lý hiển thị hình ảnh
        const placeholderImage = item.querySelector('.placeholder-image');
        if (material.imageUrl) {
            const imgElement = document.createElement('img');
            imgElement.src = material.imageUrl;
            imgElement.alt = 'Cover Image';
            imgElement.style.maxWidth = '100%';
            imgElement.style.maxHeight = '100%';
            imgElement.style.objectFit = 'cover';
            placeholderImage.appendChild(imgElement);
        } else if (material.coverImage) {
            const imgElement = document.createElement('img');
            imgElement.src = `data:image/jpeg;base64,${material.coverImage}`;
            imgElement.alt = 'Cover Image';
            imgElement.style.maxWidth = '100%';
            imgElement.style.maxHeight = '100%';
            imgElement.style.objectFit = 'cover';
            placeholderImage.appendChild(imgElement);
        } else {
            placeholderImage.innerHTML = '<i class="fas fa-file-alt" style="font-size: 3rem; color: #ccc;"></i>';
            placeholderImage.style.display = 'flex';
            placeholderImage.style.justifyContent = 'center';
            placeholderImage.style.alignItems = 'center';
            placeholderImage.style.backgroundColor = '#f0f0f0';
        }

        return item;
    }

    // Hàm gọi API cập nhật trạng thái
    async function updateMaterialStatus(itemId, status, itemElement) {
        if (!itemId) {
            console.error('Item ID is missing');
            alert('Error: Item ID is missing');
            return;
        }

        console.log(`Updating status for item ${itemId} to ${status}...`);
        const updateApiUrl = `http://localhost:8080/mm/items/${itemId}/status`;

        try {
            const response = await fetch(updateApiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ approvingStatus: status }),
            });

            console.log('Update status response status:', response.status);

            if (response.ok) {
                console.log(`Status for item ${itemId} updated to ${status} successfully.`);
                
                // Nếu status là Approved, cập nhật credit cho người upload
                if (status.toLowerCase() === 'approved') {
                    try {
                        // Lấy thông tin item để biết uploaderID
                        const itemResponse = await fetch(`http://localhost:8080/mm/items/${itemId}`);
                        if (!itemResponse.ok) {
                            throw new Error(`Failed to fetch item details: ${itemResponse.status}`);
                        }
                        const itemDetails = await itemResponse.json();
                        const uploaderId = itemDetails.uploaderID;
                        console.log('Uploader ID:', uploaderId);

                        // Lấy username từ studentId
                        const usernameResponse = await fetch(`http://localhost:8080/mm/students/username/${uploaderId}`);
                        if (!usernameResponse.ok) {
                            throw new Error(`Failed to fetch username: ${usernameResponse.status}`);
                        }
                        const usernameData = await usernameResponse.json();
                        const username = usernameData.username;
                        console.log('Student username:', username);

                        // Lấy số credit hiện tại
                        const currentCreditsResponse = await fetch(`http://localhost:8080/mm/students/${username}/credits`);
                        if (!currentCreditsResponse.ok) {
                            throw new Error(`Failed to fetch current credits: ${currentCreditsResponse.status}`);
                        }
                        const currentCredits = await currentCreditsResponse.json();
                        console.log('Current credits:', currentCredits);

                        // Tính toán số credit mới (+1)
                        const newCreditsValue = parseInt(currentCredits) + 1;
                        console.log('New credits value:', newCreditsValue);

                        // Cập nhật credit mới
                        const updateCreditResponse = await fetch(`http://localhost:8080/mm/students/${username}/credits`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ credits: newCreditsValue })
                        });

                        if (!updateCreditResponse.ok) {
                            const errorText = await updateCreditResponse.text();
                            console.error('Failed to update credits. Response:', errorText);
                            throw new Error(`Failed to update credits: ${updateCreditResponse.status}`);
                        }

                        const updatedCredits = await updateCreditResponse.json();
                        console.log('Credits updated successfully:', updatedCredits);
                        
                        // Xóa thông báo alert
                    } catch (error) {
                        console.error('Error updating credits:', error);
                        alert('Failed to update credits: ' + error.message);
                    }
                }

                // Cập nhật hiển thị trạng thái trên UI
                const statusSpan = itemElement.querySelector('.status-text');
                statusSpan.textContent = `Status: ${status}`;
                // Cập nhật class màu sắc
                statusSpan.classList.remove('status-pending', 'status-approved', 'status-rejected');
                statusSpan.classList.add(`status-${status.toLowerCase()}`);
                
                // Ẩn nút Accept/Reject sau khi duyệt
                if(status.toLowerCase() === 'approved' || status.toLowerCase() === 'rejected'){
                    itemElement.querySelector('.material-actions').style.display = 'none';
                    itemElement.querySelector('.btn-delete').style.display = 'none';
                }
            } else {
                const errorData = await response.text();
                console.error(`Failed to update status for item ${itemId}. Status: ${response.status}, Error: ${errorData}`);
                alert(`Failed to update status: ${errorData}`);
            }
        } catch (error) {
            console.error('Error updating material status:', error);
            alert('Failed to update material status. Please try again.');
        }
    }

    // Khởi tạo: Fetch và hiển thị tài liệu khi trang load
    fetchAllMaterials();
});