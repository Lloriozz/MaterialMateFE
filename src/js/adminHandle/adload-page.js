document.addEventListener('DOMContentLoaded', function() {
    // File upload functionality
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('fileInput');

    // Drag and drop functionality
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('dragover');
    });

    uploadContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('dragover');
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // Click to upload
    uploadContainer.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
});

async function handleFileUpload(file) {
    try {
        // Check file type
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        // Check file size (limit 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must not exceed 10MB');
            return;
        }

        // Show processing message
        const uploadContainer = document.getElementById('uploadContainer');
        const originalContent = uploadContainer.innerHTML;
        uploadContainer.innerHTML = '<div class="upload-text">Processing file...</div>';

        // Convert file to base64
        const base64File = await convertFileToBase64(file);
        
        // Store file data in sessionStorage
        sessionStorage.setItem('uploadedFile', base64File);
        sessionStorage.setItem('fileName', file.name);

        // Extract first page as image
        const coverImage = await extractFirstPageAsImage(file);
        sessionStorage.setItem('coverImage', coverImage);

        // Redirect to upload info page
        window.location.href = 'upload-info.html';
    } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file: ' + error.message);
        
        // Restore upload interface
        const uploadContainer = document.getElementById('uploadContainer');
        uploadContainer.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-file-upload"></i>
            </div>
            <div class="upload-text">Drag your file here</div>
            <div class="upload-or">or</div>
            <button class="browse-btn" onclick="document.getElementById('fileInput').click()">
                Browse file
            </button>
            <input type="file" id="fileInput" class="file-input" accept=".pdf">
        `;
    }
}

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(new Error('Error reading file: ' + error.message));
        reader.readAsDataURL(file);
    });
}

async function extractFirstPageAsImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const typedarray = new Uint8Array(e.target.result);
                
                // Load PDF document
                const loadingTask = pdfjsLib.getDocument(typedarray);
                const pdf = await loadingTask.promise;
                
                // Get first page
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.0 });
                
                // Create canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render page to canvas
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Convert to JPEG
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                resolve(imageData);
            } catch (error) {
                reject(new Error('Error extracting image from PDF: ' + error.message));
            }
        };
        reader.onerror = (error) => reject(new Error('Error reading PDF file: ' + error.message));
        reader.readAsArrayBuffer(file);
    });
}