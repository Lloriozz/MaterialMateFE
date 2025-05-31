document.addEventListener('DOMContentLoaded', function() {
    // Load and display file preview
    const uploadedFile = sessionStorage.getItem('uploadedFile');
    const fileName = sessionStorage.getItem('fileName');
    const coverImage = sessionStorage.getItem('coverImage');

    if (uploadedFile && fileName) {
        displayFilePreview(fileName, coverImage);
    } else {
        window.location.href = 'upload-page.html';
    }

    // Display username
    const username = sessionStorage.getItem('currentUserId');
    if (username) {
        const usernameElements = document.querySelectorAll('.user-name');
        usernameElements.forEach(element => {
            element.textContent = username;
        });
    }

    // Form submission handling
    document.getElementById('uploadForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        
        if (!title || !category || !description) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            // Get current username from session storage
            const usernameForUpload = sessionStorage.getItem('currentUserId');
            if (!usernameForUpload) {
                alert('Please login to upload materials');
                window.location.href = 'login.html';
                return;
            }

            console.log('Uploading with username:', usernameForUpload);

            // Convert base64 to Blob
            const pdfBlob = await fetch(uploadedFile).then(res => res.blob());
            const imageBlob = await fetch(coverImage).then(res => res.blob());

            // Check file sizes
            const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
            const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

            // Display file sizes
            const pdfSizeMB = (pdfBlob.size / (1024 * 1024)).toFixed(2);
            const imageSizeMB = (imageBlob.size / (1024 * 1024)).toFixed(2);
            const totalSizeMB = ((pdfBlob.size + imageBlob.size) / (1024 * 1024)).toFixed(2);

            console.log(`PDF size: ${pdfSizeMB}MB (max: 10MB)`);
            console.log(`Image size: ${imageSizeMB}MB (max: 5MB)`);
            console.log(`Total size: ${totalSizeMB}MB`);

            if (pdfBlob.size > MAX_PDF_SIZE) {
                alert(`PDF file is too large (${pdfSizeMB}MB). Maximum size is 10MB. Please compress your PDF file and try again.`);
                return;
            }

            if (imageBlob.size > MAX_IMAGE_SIZE) {
                alert(`Image file is too large (${imageSizeMB}MB). Maximum size is 5MB. Please reduce the image size and try again.`);
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('uploaderID', usernameForUpload);
            formData.append('pdfFile', pdfBlob, fileName);
            formData.append('imageCover', imageBlob, 'cover.jpg');

            // Print FormData contents
            console.log('=== FormData Contents ===');
            console.log('Title:', title);
            console.log('Description:', description);
            console.log('Category:', category);
            console.log('UploaderID:', usernameForUpload);
            console.log('PDF File:', {
                name: fileName,
                size: pdfSizeMB + 'MB',
                type: pdfBlob.type
            });
            console.log('Image Cover:', {
                name: 'cover.jpg',
                size: imageSizeMB + 'MB',
                type: imageBlob.type
            });
            console.log('=======================');

            // Send data to server
            try {
                console.log('Sending request to server...');
                const response = await fetch('http://localhost:8080/mm/items', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include'
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));

                // Get response text
                const responseText = await response.text();
                console.log('Server response:', responseText);

                if (!response.ok) {
                    let errorMessage = 'Failed to upload material';
                    
                    if (response.status === 413) {
                        errorMessage = `File size is too large (${totalSizeMB}MB). Please try to compress your files or contact the administrator to increase the server's file size limit.`;
                    } else if (response.status === 500) {
                        try {
                            const errorJson = JSON.parse(responseText);
                            errorMessage = `Server error: ${errorJson.error}. Please try again later or contact the administrator.`;
                            console.error('Server error details:', errorJson);
                        } catch (e) {
                            errorMessage = 'Server error. Please try again later or contact the administrator.';
                            console.error('Error parsing server response:', e);
                        }
                    } else if (responseText) {
                        errorMessage = responseText;
                    }
                    
                    throw new Error(errorMessage);
                }

                // *** Upload successful - Update credits ***
                const usernameForCreditUpdate = sessionStorage.getItem('username'); // Lấy username từ storage
                if (usernameForCreditUpdate) {
                    const creditUpdateUrl = `http://localhost:8080/mm/students/${usernameForCreditUpdate}/credits`;
                    console.log('Attempting to update credits for user:', usernameForCreditUpdate, 'at', creditUpdateUrl);
                    
                    fetch(creditUpdateUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ credits: 1 }), // Tăng credit lên 1
                    })
                    .then(creditResponse => {
                        console.log('Credit update response status:', creditResponse.status);
                        if (creditResponse.ok) {
                            console.log('Credits updated successfully!');
                            // Tùy chọn: Fetch lại thông tin user hoặc cập nhật UI ngay lập tức nếu cần
                            // Gọi hàm updateCreditDisplay để cập nhật hiển thị credit trên trang hiện tại
                            creditResponse.json().then(data => {
                                if (data && data.totalCredits !== undefined) {
                                    console.log('New total credits from update response:', data.totalCredits);
                                    updateCreditDisplay(data.totalCredits);
                                } else {
                                    console.warn('New total credits not found in update response.', data);
                                    // Nếu không có totalCredits trong response, fetch lại từ API user-info
                                    const username = sessionStorage.getItem('username');
                                     if (username) {
                                         const creditApiUrl = `http://localhost:8080/mm/students/${username}/credits`;
                                          console.log('Refetching credits after update...');
                                          fetch(creditApiUrl)
                                             .then(response => response.text())
                                             .then(creditText => {
                                                  const totalCredits = parseInt(creditText, 10);
                                                   if (!isNaN(totalCredits)) {
                                                        updateCreditDisplay(totalCredits);
                                                    }
                                             }).catch(err => console.error('Error refetching credits:', err));
                                     }
                                }
                            }).catch(err => console.error('Error parsing credit update response JSON:', err));
                        } else {
                            console.error('Failed to update credits. Status:', creditResponse.status);
                            // Log thêm response text nếu có lỗi
                            creditResponse.text().then(text => console.error('Credit update response text:', text));
                        }
                    })
                    .catch(creditError => {
                        console.error('Error during credit update fetch:', creditError);
                    });
                } else {
                    console.warn('Username not found in storage. Cannot update credits.');
                }
                // *** End credit update logic ***

                // Clear session storage
                sessionStorage.removeItem('uploadedFile');
                sessionStorage.removeItem('fileName');
                sessionStorage.removeItem('coverImage');

                // Show success modal
                document.getElementById('successModal').style.display = 'flex';
            } catch (error) {
                console.error('Network error:', error);
                throw new Error('Network error: ' + error.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload material: ' + error.message);
        }
    });
});

// File preview functionality
function displayFilePreview(fileName, coverImage) {
    const preview = document.getElementById('filePreview');
    if (coverImage) {
        preview.innerHTML = `
            <div style="text-align: center;">
                <img src="${coverImage}" alt="Cover Preview" style="max-width: 200px; max-height: 300px; margin-bottom: 10px;">
                <div style="font-size: 14px; color: #666;">${fileName}</div>
            </div>
        `;
    } else {
        preview.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-file-alt" style="font-size: 2rem; margin-bottom: 10px; color: #666;"></i>
                <div style="font-size: 14px; color: #666;">${fileName}</div>
            </div>
        `;
    }
}

// Discard upload function
function discardUpload() {
    if (confirm('Are you sure you want to discard this upload? All entered data will be lost.')) {
        // Clear session storage
        sessionStorage.removeItem('uploadedFile');
        sessionStorage.removeItem('fileName');
        sessionStorage.removeItem('coverImage');
        
        // Clear the form
        document.getElementById('uploadForm').reset();
        
        // Redirect back to upload page
        window.location.href = 'upload-page.html';
    }
}

// Success modal button functions
function uploadAnother() {
    // Reset the form
    document.getElementById('uploadForm').reset();
    
    // Hide the success modal
    document.getElementById('successModal').style.display = 'none';
    window.location.href = 'upload-page.html';
}

function goToStorage() {
    // Redirect to uploaded materials page
    window.location.href = 'uploaded-materials.html';
}