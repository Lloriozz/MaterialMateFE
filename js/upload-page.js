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

function handleFileUpload(file) {
    window.location.href = 'upload-info.html';
}