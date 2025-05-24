document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        
        if (!title || !category || !description) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Here you would typically send the data to your server
        console.log('Upload data:', {
            title: title,
            category: category,
            description: description
        });
        
        // Show success modal
        document.getElementById('successModal').style.display = 'flex';
    });
    
    // Check for file parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');
    if (fileName) {
        displayFilePreview(fileName);
    }
});

// File preview functionality (if coming from file upload)
function displayFilePreview(fileName) {
    const preview = document.getElementById('filePreview');
    preview.innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-file-alt" style="font-size: 2rem; margin-bottom: 10px; color: #666;"></i>
            <div style="font-size: 14px; color: #666;">${fileName}</div>
        </div>
    `;
}

// Discard upload function
function discardUpload() {
    if (confirm('Are you sure you want to discard this upload? All entered data will be lost.')) {
        // Clear the form
        document.getElementById('uploadForm').reset();
        
        // Redirect back to upload page or home
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
    // Redirect to home page
    window.location.href = 'uploaded-materials.html';
}