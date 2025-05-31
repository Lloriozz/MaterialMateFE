// API Base URL - Update this to match your Spring Boot server
const API_BASE_URL = 'http://localhost:8080/mm'; // Change this to your actual server URL

document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const submitButton = profileForm.querySelector('.btn-submit');

    // Get the username from signup
    const username = localStorage.getItem('mm_signup_username');
    if (!username) {
        // If no username found, redirect back to signup
        window.location.href = 'signup.html';
        return;
    }

    // Get all form fields
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

    // Add real-time validation to all fields
    Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        if (field) {
            // Add validation on input
            field.addEventListener('input', () => {
                validateField(fieldName, field.value.trim());
            });

            // Add validation on blur (when field loses focus)
            field.addEventListener('blur', () => {
                validateField(fieldName, field.value.trim());
            });
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

    // Form validation and submission
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values
        const formData = {
            username: username, // Include the username from signup
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            email: document.getElementById('email').value.trim(),
            dateOfBirth: document.getElementById('dateOfBirth').value.trim(),
            country: document.getElementById('country').value.trim(),
            role: document.getElementById('role').value.trim(),
            university: document.getElementById('school').value.trim() // Map school field to university
        };

        // Basic validation
        if (!validateForm(formData)) {
            return;
        }

        // Show loading state
        submitButton.textContent = 'Updating Profile...';
        submitButton.disabled = true;

        try {
            console.log('Sending profile data:', formData);
            // Make API call to update profile
            const response = await fetch(`${API_BASE_URL}/students/profile-setup`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(errorText || 'Failed to update profile');
            }

            // Get the response data
            const updatedProfile = await response.json();

            // Store the complete profile data in session storage
            const userInfo = {
                username: username,
                ...updatedProfile
            };
            sessionStorage.setItem('currentUser', JSON.stringify(userInfo));

            // Clear the stored username as it's no longer needed
            localStorage.removeItem('mm_signup_username');

            // Show success message
            showSuccessMessage('Profile updated successfully! Redirecting to login...');

            // Redirect to login page after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            showErrorMessage(`Failed to update profile: ${error.message}`);
        } finally {
            // Reset button state
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
        profileForm.insertBefore(successDiv, profileForm.firstChild);
    }
});
