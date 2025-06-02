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
            const usernameForUpload = sessionStorage.getItem('username');
            const currentUserId = sessionStorage.getItem('currentUserId') || localStorage.getItem('currentUserId');

            if (!usernameForUpload || !currentUserId) {
                alert('Please login to upload materials');
                window.location.href = 'login.html';
                return;
            }

            console.log('Uploading material.');
            console.log('Using username (for logging/context): ', usernameForUpload);
            console.log('Using uploaderID (Student UUID): ', currentUserId);

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
            formData.append('uploaderID', currentUserId);
            formData.append('pdfFile', pdfBlob, fileName);
            formData.append('imageCover', imageBlob, 'cover.jpg');

            // Print FormData contents
            console.log('=== FormData Contents ===');
            console.log('Title:', title);
            console.log('Description:', description);
            console.log('Category:', category);
            console.log('UploaderID (sent):', currentUserId);
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

                if (!response.ok) {
                    // Nếu có lỗi, đọc và log response text
                    const errorText = await response.text();
                    console.error('Server error response text:', errorText);

                    let errorMessage = 'Failed to upload material';
                    
                    if (response.status === 413) {
                        errorMessage = `File size is too large (${totalSizeMB}MB). Please try to compress your files or contact the administrator to increase the server's file size limit.`;
                    } else if (response.status === 500) {
                        try {
                            const errorJson = JSON.parse(errorText);
                            errorMessage = `Server error: ${errorJson.error}. Please try again later or contact the administrator.`;
                            console.error('Server error details:', errorJson);
                        } catch (e) {
                            errorMessage = 'Server error. Please try again later or contact the administrator.';
                            console.error('Error parsing server response:', e);
                        }
                    } else if (errorText) {
                        errorMessage = errorText;
                    }
                    
                    throw new Error(errorMessage);
                } else {
                    // Nếu upload thành công (status 200-299)
                    console.log('Upload successful, attempting to handle success.');
                    await handleUploadSuccess(response);
                }
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

// Hàm cập nhật credit sau khi upload thành công
async function updateUserCredit() {
    const username = sessionStorage.getItem('username') || localStorage.getItem('username');
    console.log('updateUserCredit called for username:', username);

    if (!username) {
        console.warn('No username found in storage for updating credits');
        return;
    }

    try {
        // Bước 1: Lấy số credit hiện tại
        console.log('Fetching current credits for user:', username);
        const currentCreditsResponse = await fetch(`http://localhost:8080/mm/students/${username}/credits`);

        console.log('/credits (GET) response status:', currentCreditsResponse.status);
        if (!currentCreditsResponse.ok) {
             const errorText = await currentCreditsResponse.text();
             console.error('/credits (GET) response error text:', errorText);
            throw new Error(`Failed to fetch current credits. Status: ${currentCreditsResponse.status}`);
        }

        const currentCredits = await currentCreditsResponse.json();
        console.log('Current credits fetched:', currentCredits);

        // Bước 2: Tính toán số credit mới (+1)
        const newCreditsValue = (currentCredits || 0) + 1;
        console.log('Calculated new credits value:', newCreditsValue);

        // Bước 3: Gửi yêu cầu PUT để cập nhật credit trong database
        console.log('Putting new credits for user:', username, 'value:', newCreditsValue);
        const updateResponse = await fetch(`http://localhost:8080/mm/students/${username}/credits`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCreditsValue) // Gửi giá trị số credit mới
             // Hoặc có thể là JSON.stringify({ credits: newCreditsValue }) tùy thuộc backend
             // Dựa vào Postman test của bạn, body có thể là { credits: newCreditsValue }
        });

         // Thử gửi dạng object { credits: value } dựa trên postman test của bạn
         if (!updateResponse.ok) { // Nếu request PUT đầu tiên lỗi, thử lại với dạng object
              console.warn('PUT with raw value failed (status:', updateResponse.status, '). Trying with { credits: value } format.');
              const updateResponseWithObject = await fetch(`http://localhost:8080/mm/students/${username}/credits`, {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ credits: newCreditsValue })
              });

              console.log('PUT with {credits: value} response status:', updateResponseWithObject.status);

              if (!updateResponseWithObject.ok) {
                  const errorText = await updateResponseWithObject.text();
                  console.error('/credits (PUT with object) response error text:', errorText);
                 throw new Error(`Failed to update credits with object format. Status: ${updateResponseWithObject.status}`);
              }
              // Nếu PUT với object thành công, sử dụng response này
              const updatedCredits = await updateResponseWithObject.json();
              console.log('Updated credits from PUT response (object format):', updatedCredits);
              // Cập nhật hiển thị và storage
              // *** Cần kiểm tra cấu trúc của updatedCredits và lấy giá trị số ***
              // Giả sử backend trả về { credits: value } hoặc chỉ giá trị số
              let finalCreditValue = newCreditsValue; // Mặc định dùng giá trị đã tính

              if (typeof updatedCredits === 'number') {
                  finalCreditValue = updatedCredits;
                  console.log('Backend returned number directly:', finalCreditValue);
              } else if (updatedCredits && typeof updatedCredits === 'object' && updatedCredits.credits !== undefined) {
                  finalCreditValue = updatedCredits.credits;
                  console.log('Backend returned object with credits field:', finalCreditValue);
              } else {
                   console.warn('Could not extract numerical credit value from backend response:', updatedCredits);
              }

              sessionStorage.setItem('userCredits', finalCreditValue);
              localStorage.setItem('userCredits', finalCreditValue);
              console.log('Credits updated in storage:', finalCreditValue);
              updateCreditDisplay();
              console.log('Credits updated successfully and display refreshed (object format).');
              return; // Kết thúc hàm nếu thành công với object
         }

        // Nếu PUT với raw value thành công
        const updatedCredits = await updateResponse.json(); // Có thể backend trả về credit mới
        console.log('Updated credits from PUT response (raw value format):', updatedCredits);

        // *** Cần kiểm tra cấu trúc của updatedCredits và lấy giá trị số ***
        // Giả sử backend trả về { credits: value } hoặc chỉ giá trị số
        let finalCreditValue = newCreditsValue; // Mặc định dùng giá trị đã tính

        if (typeof updatedCredits === 'number') {
            finalCreditValue = updatedCredits;
            console.log('Backend returned number directly:', finalCreditValue);
        } else if (updatedCredits && typeof updatedCredits === 'object' && updatedCredits.credits !== undefined) {
            finalCreditValue = updatedCredits.credits;
            console.log('Backend returned object with credits field:', finalCreditValue);
        } else {
             console.warn('Could not extract numerical credit value from backend response:', updatedCredits);
        }

        // Cập nhật credit trong storage
        const creditElements = document.querySelectorAll('.user-credit');
        console.log('Found .user-credit elements:', creditElements.length);
        creditElements.forEach(element => {
            element.textContent = `Credit: ${finalCreditValue}`;
            console.log('Updated element text to:', element.textContent);
        });

        sessionStorage.setItem('userCredits', finalCreditValue);
        localStorage.setItem('userCredits', finalCreditValue);
        console.log('Credits updated in storage:', finalCreditValue);

        console.log('Credits updated successfully and display refreshed (raw value format).');

    } catch (error) {
        console.error('Error in updateUserCredit:', error);
        const creditElements = document.querySelectorAll('.user-credit');
         creditElements.forEach(element => {
             element.textContent = 'Credit: N/A'; // Hiển thị N/A nếu có lỗi
         });
    }
}

// Hàm update hiển thị credit trên giao diện
function updateCreditDisplay() {
    const storedCredit = sessionStorage.getItem('userCredits') || localStorage.getItem('userCredits');
     let displayValue = 'N/A';
 
     if (storedCredit !== null && storedCredit !== undefined) {
          // Cố gắng parse thành số, nếu không được thì giữ nguyên
          const numCredit = parseInt(storedCredit, 10);
          displayValue = isNaN(numCredit) ? storedCredit : numCredit;
     }

     const creditElements = document.querySelectorAll('.user-credit');
     creditElements.forEach(element => {
          element.textContent = `Credit: ${displayValue}`;
     });
     console.log('Credit display updated to:', `Credit: ${displayValue}`);
}

// Sửa lại hàm xử lý upload thành công
async function handleUploadSuccess(response) {
    console.log('handleUploadSuccess called.');
    try {
        // Tạo bản sao của response để có thể đọc nhiều lần nếu cần
        const clonedResponse = response.clone();
        const result = await clonedResponse.json();
        console.log('Upload successful (handleUploadSuccess):', result);

        // Cập nhật credit sau khi upload thành công
        await updateUserCredit();

        // --- Logic hiển thị thành công (quay lại dùng modal) ---
        console.log('Showing success modal...');
        document.getElementById('successModal').style.display = 'flex';
        // --- End Logic hiển thị thành công ---

        // Xóa session storage sau khi xử lý thành công
        sessionStorage.removeItem('uploadedFile');
        sessionStorage.removeItem('fileName');
        sessionStorage.removeItem('coverImage');

        // Xóa bỏ chuyển hướng tự động
        // setTimeout(() => {
        //     window.location.href = 'home.html';
        // }, 3000);

    } catch (error) {
        console.error('Error handling upload success:', error);
    }
}