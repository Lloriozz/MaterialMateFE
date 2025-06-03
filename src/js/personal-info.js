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
    const headerUserName = document.getElementById('headerUserName');
    const headerUserCredit = document.getElementById('headerUserCredit');
    
    // Initially hide save and discard buttons
    saveButton.style.display = 'none';
    discardButton.style.display = 'none';
    
    // Load user information from session storage and server
    const loadUserInfo = async () => {
        const userInfo = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!userInfo) {
            window.location.href = 'login.html';
            return;
        }

        try {
            // Get complete student profile data
            const profileResponse = await fetch(`http://localhost:8080/mm/students/${userInfo.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to fetch profile information');
            }

            const profileData = await profileResponse.json();
            
            // Get credits
            const creditsResponse = await fetch(`http://localhost:8080/mm/students/${userInfo.username}/credits`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let credits = 0;
            if (creditsResponse.ok) {
                credits = await creditsResponse.json();
            }
            
            // Update header user info
            headerUserName.textContent = profileData.firstName ? 
                `${profileData.firstName} ${profileData.lastName}` : userInfo.username;
            headerUserCredit.textContent = `Credit: ${credits || 0}`;

            // Update profile name
            profileName.textContent = profileData.firstName ? 
                `${profileData.firstName} ${profileData.lastName}` : userInfo.username;

            // Update input fields with complete profile data
            inputFields.forEach(input => {
                const label = input.previousElementSibling.textContent.trim().replace(/\s*\*$/, ''); // Remove asterisk from label
                switch(label) {
                    case 'Student ID':
                        input.value = profileData.id || userInfo.id || '';
                        break;
                    case 'Username':
                        input.value = profileData.username || userInfo.username || '';
                        break;
                    case 'First Name':
                        input.value = profileData.firstName || '';
                        break;
                    case 'Last Name':
                        input.value = profileData.lastName || '';
                        break;
                    case 'Phone Number':
                        input.value = profileData.phoneNumber || '';
                        break;
                    case 'Email':
                        input.value = profileData.email || '';
                        break;
                    case 'Country':
                        input.value = profileData.country || '';
                        break;
                    case 'University':
                        input.value = profileData.university || '';
                        break;
                }
            });

            // Store original values for discard functionality
            inputFields.forEach((input, index) => {
                originalValues[index] = input.value;
            });

            // If this is first login (no profile data), enable edit mode
            if (!profileData.firstName || !profileData.lastName) {
                editButton.click();
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            // If we can't fetch profile data, still show what we have
            headerUserName.textContent = userInfo.username || '';
            headerUserCredit.textContent = `Credit: ${userInfo.credits || 0}`;
            profileName.textContent = userInfo.username || '';

            // Fill in the basic info we have
            inputFields.forEach(input => {
                const label = input.previousElementSibling.textContent.trim();
                if (label === 'Student ID') {
                    input.value = userInfo.id || '';
                } else if (label === 'Username') {
                    input.value = userInfo.username || '';
                }
            });

            // Store original values
            inputFields.forEach((input, index) => {
                originalValues[index] = input.value;
            });

            // Enable edit mode since we don't have complete profile
            editButton.click();
        }
    };

    // Store original values for discard functionality
    const originalValues = {};
    
    // Load user information when page loads
    loadUserInfo();
    
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
    saveButton.addEventListener('click', async function() {
        // Check if all required fields are filled
        let allRequiredFieldsFilled = true;
        let firstEmptyRequiredField = null;
        
        inputFields.forEach((input) => {
            const label = input.previousElementSibling.textContent.trim();
            // Check if this is a required field
            if (label.includes('*') && !input.value.trim()) {
                allRequiredFieldsFilled = false;
                if (!firstEmptyRequiredField) {
                    firstEmptyRequiredField = input;
                }
            }
        });
        
        if (!allRequiredFieldsFilled) {
            alert('Please fill in all required fields before saving');
            if (firstEmptyRequiredField) {
                firstEmptyRequiredField.focus();
            }
            return;
        }

        try {
            // Get current user info
            const userInfo = JSON.parse(sessionStorage.getItem('currentUser'));

            // Collect updated profile information
            const updatedProfile = {
                username: userInfo.username, // Include username in the request
                firstName: document.querySelector('input[placeholder="First Name"]').value,
                lastName: document.querySelector('input[placeholder="Last Name"]').value,
                phoneNumber: document.querySelector('input[placeholder="Phone Number"]').value,
                email: document.querySelector('input[placeholder="Email"]').value,
                country: document.querySelector('input[placeholder="Country"]').value,
                university: document.querySelector('input[placeholder="University"]').value
            };

            // Send update to server
            const response = await fetch('http://localhost:8080/mm/students/profile-setup', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProfile)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Update was successful
            const updatedInfo = await response.json();
            
            // Update session storage with new information
            const newUserInfo = {
                ...userInfo,
                ...updatedInfo,
                username: userInfo.username, // Preserve username
                id: userInfo.id, // Preserve ID
                credits: userInfo.credits // Preserve credits
            };
            sessionStorage.setItem('currentUser', JSON.stringify(newUserInfo));

            // Make fields readonly again
            inputFields.forEach((input, index) => {
                input.setAttribute('readonly', true);
                input.style.backgroundColor = '#f9f9f9';
                originalValues[index] = input.value;
            });

            // Update header and profile name if name was provided
            if (updatedProfile.firstName && updatedProfile.lastName) {
                const fullName = `${updatedProfile.firstName} ${updatedProfile.lastName}`;
                headerUserName.textContent = fullName;
                profileName.textContent = fullName;
            }

            // Show edit button, hide save and discard buttons
            editButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            discardButton.style.display = 'none';

            // Show success notification
            successNotification.style.display = 'flex';

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
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