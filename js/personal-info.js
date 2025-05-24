document.addEventListener('DOMContentLoaded', function() {
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const discardButton = document.getElementById('discardButton');
    const inputFields = document.querySelectorAll('.form-group input');
    const editPictureBtn = document.getElementById('editPictureBtn');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const profileImage = document.getElementById('profileImage');
    const profilePicture = document.getElementById('profilePicture');
    const profileName = document.querySelector('.profile-name');
    const successNotification = document.getElementById('successNotification');
    const notificationCloseBtn = document.getElementById('notificationCloseBtn');
    
    // Initially hide save and discard buttons
    saveButton.style.display = 'none';
    discardButton.style.display = 'none';
    
    // Store original values for discard functionality
    const originalValues = {};
    inputFields.forEach((input, index) => {
        originalValues[index] = input.value;
    });
    
    // Store original profile picture
    let originalProfilePicture = profileImage.src;
    let newProfilePicture = null;
    
    // Check if we need to use a default image
    if (!profileImage.complete || profileImage.naturalHeight === 0) {
        profileImage.src = '../assets/menubar logo.png';
        originalProfilePicture = profileImage.src;
    }
    
    // Notification close button event listener
    notificationCloseBtn.addEventListener('click', function() {
        successNotification.style.display = 'none';
    });
    
    // Also close notification when clicking outside the popup
    successNotification.addEventListener('click', function(event) {
        if (event.target === successNotification) {
            successNotification.style.display = 'none';
        }
    });
    
    // Profile picture edit button click handler
    editPictureBtn.addEventListener('click', function() {
        profilePictureInput.click();
    });
    
    // Handle file selection
    profilePictureInput.addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            
            // Check if file is an image
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Display the image
                profileImage.src = e.target.result;
                profileImage.style.display = 'block';
                newProfilePicture = e.target.result;
                
                // If not in edit mode, automatically enter edit mode
                if (editButton.style.display !== 'none') {
                    editButton.click();
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Edit button click handler
    editButton.addEventListener('click', function() {
        // Make fields editable
        inputFields.forEach(input => {
            input.removeAttribute('readonly');
            input.style.backgroundColor = 'white';
        });
        
        // Show save and discard buttons, hide edit button
        editButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
        discardButton.style.display = 'inline-block';
    });
    
    // Save button click handler
    saveButton.addEventListener('click', function() {
        // Check if all fields are filled
        let allFieldsFilled = true;
        let firstEmptyField = null;
        
        inputFields.forEach((input) => {
            if (!input.value.trim()) {
                allFieldsFilled = false;
                if (!firstEmptyField) {
                    firstEmptyField = input;
                }
            }
        });
        
        if (!allFieldsFilled) {
            alert('Please fill in all fields before saving');
            if (firstEmptyField) {
                firstEmptyField.focus();
            }
            return;
        }
        
        // Make fields readonly again
        let firstName = '';
        let lastName = '';
        
        inputFields.forEach((input, index) => {
            input.setAttribute('readonly', true);
            input.style.backgroundColor = '#f9f9f9';
            // Update original values with new ones
            originalValues[index] = input.value;
            
            // Check if this is first name or last name input
            const label = input.previousElementSibling.textContent.trim();
            if (label === 'First Name') {
                firstName = input.value.trim();
            } else if (label === 'Last Name') {
                lastName = input.value.trim();
            }
        });
        
        // Update the profile name if both first and last name are available
        if (firstName && lastName) {
            profileName.textContent = firstName + ' ' + lastName;
        }
        
        // Save the new profile picture as the original
        if (newProfilePicture) {
            originalProfilePicture = newProfilePicture;
        }
        
        // Show edit button, hide save and discard buttons
        editButton.style.display = 'inline-block';
        saveButton.style.display = 'none';
        discardButton.style.display = 'none';
        
        // Show success notification
        document.getElementById('successNotification').style.display = 'flex';
    });
    
    // Discard button click handler
    discardButton.addEventListener('click', function() {
        // Restore original values and make fields readonly
        inputFields.forEach((input, index) => {
            input.value = originalValues[index];
            input.setAttribute('readonly', true);
            input.style.backgroundColor = '#f9f9f9';
        });
        
        // Restore original profile picture
        profileImage.src = originalProfilePicture;
        if (originalProfilePicture === '../assets/default-avatar.png' && !profileImage.style.display) {
            profileImage.style.display = 'none';
        } else {
            profileImage.style.display = 'block';
        }
        newProfilePicture = null;
        
        // Show edit button, hide save and discard buttons
        editButton.style.display = 'inline-block';
        saveButton.style.display = 'none';
        discardButton.style.display = 'none';
    });
});