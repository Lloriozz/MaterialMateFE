// API Base URL - Update this to match your Spring Boot server
const API_BASE_URL = 'http://localhost:8080/mm'; // Change this to your actual server URL

// Utility functions for showing validation feedback
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
}

function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = '';
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
    `;
    const profileForm = document.getElementById('profileForm');
    profileForm.insertBefore(errorDiv, profileForm.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success mt-3';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
    `;
    const profileForm = document.getElementById('profileForm');
    profileForm.insertBefore(successDiv, profileForm.firstChild);
}

document.addEventListener('DOMContentLoaded', async function() {
    const profileForm = document.getElementById('profileForm');
    const submitButton = profileForm.querySelector('.btn-submit');
    let retryCount = 0;
    const maxRetries = 50;

    // Prevent default form submission
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    // Function to check studentId with retry
    const checkStudentId = async () => {
        console.log('Checking for studentId in localStorage... (Attempt ' + (retryCount + 1) + ')');
        const studentId = localStorage.getItem('mm_student_id');
        console.log('Current studentId value:', studentId);
        
        if (!studentId) {
            retryCount++;
            if (retryCount < maxRetries) {
                console.log('No studentId found, retrying in 100ms... (Attempt ' + (retryCount + 1) + ' of ' + maxRetries + ')');
                await new Promise(resolve => setTimeout(resolve, 100));
                return checkStudentId();
            } else {
                console.log('Max retries reached, redirecting to signup');
                window.location.href = 'signup.html';
                return;
            }
        }

        console.log('StudentId found:', studentId);
        return studentId;
    };

    try {
        const studentId = await checkStudentId();
        if (!studentId) {
            return;
        }

        // First get username from studentId
        const usernameResponse = await fetch(`${API_BASE_URL}/students/username/${studentId}`);
        if (!usernameResponse.ok) {
            throw new Error('Failed to fetch username');
        }
        const usernameData = await usernameResponse.json();
        const username = usernameData.username;

        // Then get student info using username
        const studentResponse = await fetch(`${API_BASE_URL}/students/${username}`);
        if (!studentResponse.ok) {
            throw new Error('Failed to fetch student info');
        }
        const studentInfo = await studentResponse.json();

        // Set up session storage
        sessionStorage.setItem('studentId', studentId);
        sessionStorage.setItem('currentUser', JSON.stringify(studentInfo));

        // Initialize form fields
        const fields = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            phoneNumber: document.getElementById('phoneNumber'),
            email: document.getElementById('email'),
            dateOfBirth: document.getElementById('dateOfBirth'),
            country: document.getElementById('country'),
            role: document.getElementById('role'),
            school: document.getElementById('school')
        };

        // Fill form with existing data if available
        if (studentInfo) {
            fields.firstName.value = studentInfo.firstName || '';
            fields.lastName.value = studentInfo.lastName || '';
            fields.phoneNumber.value = studentInfo.phoneNumber || '';
            fields.email.value = studentInfo.email || '';
            fields.dateOfBirth.value = studentInfo.dateOfBirth || '';
            fields.country.value = studentInfo.country || '';
            fields.role.value = studentInfo.role || '';
            fields.school.value = studentInfo.university || '';
        }

        // Add real-time validation to all fields
        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            if (field) {
                field.addEventListener('input', () => validateField(fieldName, field.value.trim()));
                field.addEventListener('blur', () => validateField(fieldName, field.value.trim()));
            }
        });

        // Individual field validation
        function validateField(fieldName, value) {
            switch(fieldName) {
                case 'firstName':
                case 'lastName':
                    if (!value) {
                        showFieldError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`);
                        return false;
                    }
                    if (value.length < 2) {
                        showFieldError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`);
                        return false;
                    }
                    showFieldSuccess(fieldName);
                    return true;

                case 'phoneNumber':
                    if (!value) {
                        showFieldError(fieldName, 'Phone number is required');
                        return false;
                    }
                    showFieldSuccess(fieldName);
                    return true;

                case 'email':
                    if (!value) {
                        showFieldError(fieldName, 'Email is required');
                        return false;
                    }
                    showFieldSuccess(fieldName);
                    return true;

                case 'dateOfBirth':
                    if (!value) {
                        showFieldError(fieldName, 'Date of birth is required');
                        return false;
                    }
                    showFieldSuccess(fieldName);
                    return true;

                case 'country':
                    if (!value) {
                        showFieldError(fieldName, 'Country is required');
                        return false;
                    }
                    showFieldSuccess(fieldName);
                    return true;

                case 'role':
                    if (!value) {
                        showFieldError(fieldName, 'Please select your role');
                        return false;
                    }
                    showFieldSuccess(fieldName);
                    return true;

                case 'school': // This is the HTML field ID for university
                    if (!value) {
                        showFieldError(fieldName, 'School/University is required');
                        return false;
                    }
                    showFieldSuccess(fieldName);
                    return true;
            }
        }

        // Handle form submission
        submitButton.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const formData = {
                username: username,
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                email: document.getElementById('email').value.trim(),
                dateOfBirth: document.getElementById('dateOfBirth').value.trim(),
                country: document.getElementById('country').value.trim(),
                role: document.getElementById('role').value.trim(),
                university: document.getElementById('school').value.trim()
            };

            if (!validateForm(formData)) {
                return;
            }

            submitButton.textContent = 'Updating Profile...';
            submitButton.disabled = true;

            try {
                // Chỉ gửi các trường có trong StudentProfileSetupRequest
                const requestData = {
                    username: formData.username,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                    email: formData.email,
                    country: formData.country,
                    university: formData.university
                };

                console.log('Sending profile data:', requestData);
                const response = await fetch(`${API_BASE_URL}/students/profile-setup`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(errorText || 'Failed to update profile');
                }

                const updatedProfile = await response.json();
                console.log('Profile updated successfully:', updatedProfile);
                
                sessionStorage.setItem('currentUser', JSON.stringify(updatedProfile));

                showSuccessMessage('Profile updated successfully! Taking you to your dashboard...');

                setTimeout(() => {
                    localStorage.removeItem('mm_student_id');
                    window.location.href = 'home.html';
                }, 2000);

            } catch (error) {
                console.error('Profile update error:', error);
                showErrorMessage('Failed to update profile. Please try again.');
                submitButton.textContent = 'Submit';
                submitButton.disabled = false;
            }
        });

        // Form validation function
        function validateForm(data) {
            let isValid = true;

            // First Name validation
            if (!data.firstName) {
                showFieldError('firstName', 'First name is required');
                isValid = false;
            } else {
                showFieldSuccess('firstName');
            }

            // Last Name validation
            if (!data.lastName) {
                showFieldError('lastName', 'Last name is required');
                isValid = false;
            } else {
                showFieldSuccess('lastName');
            }

            // Phone validation
            if (!data.phoneNumber) {
                showFieldError('phoneNumber', 'Phone number is required');
                isValid = false;
            } else {
                showFieldSuccess('phoneNumber');
            }

            // Email validation
            if (!data.email) {
                showFieldError('email', 'Email is required');
                isValid = false;
            } else {
                showFieldSuccess('email');
            }

            // Date of Birth validation
            if (!data.dateOfBirth) {
                showFieldError('dateOfBirth', 'Date of birth is required');
                isValid = false;
            } else {
                showFieldSuccess('dateOfBirth');
            }

            // Country validation
            if (!data.country) {
                showFieldError('country', 'Country is required');
                isValid = false;
            } else {
                showFieldSuccess('country');
            }

            // Role validation
            if (!data.role) {
                showFieldError('role', 'Please select your role');
                isValid = false;
            } else {
                showFieldSuccess('role');
            }

            // University validation (using school field in HTML)
            if (!data.university) {
                showFieldError('school', 'School/University is required');
                isValid = false;
            } else {
                showFieldSuccess('school');
            }

            return isValid;
        }
    } catch (error) {
        console.error('Error in profile setup:', error);
        showErrorMessage('An error occurred. Please try again later.');
    }
});
