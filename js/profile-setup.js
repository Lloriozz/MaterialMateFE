// Profile setup form validation and handling
document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm")
  const fields = {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    phoneNumber: document.getElementById("phoneNumber"),
    email: document.getElementById("email"),
    dateOfBirth: document.getElementById("dateOfBirth"),
    country: document.getElementById("country"),
    role: document.getElementById("role"),
    school: document.getElementById("school"),
  }

  // Add event listeners for real-time validation
  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName]
    if (field) {
      field.addEventListener("input", () => validateField(fieldName))
      field.addEventListener("blur", () => validateField(fieldName))
    }
  })

  // Form submission
  profileForm.addEventListener("submit", handleFormSubmission)

  // Create success modal
  function createSuccessModal() {
    const modal = document.createElement("div")
    modal.className = "modal-overlay"
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `

    const modalContent = document.createElement("div")
    modalContent.className = "modal-content"
    modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 40px 30px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            position: relative;
        `

    modalContent.innerHTML = `
            <button class="modal-close" style="
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 24px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">&times;</button>
            
            <div class="modal-icon" style="
                width: 60px;
                height: 60px;
                background-color: #28a745;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 30px;
            ">✓</div>
            
            <h2 style="
                color: #000;
                font-size: 28px;
                font-weight: bold;
                margin: 0 0 20px 0;
                font-family: 'Arial', sans-serif;
            ">Congratulations!!</h2>
            
            <p style="
                color: #4a90e2;
                font-size: 16px;
                margin: 0 0 30px 0;
                line-height: 1.4;
            ">
                Account created successfully.<br>
                Please <span style="color: #ff6b35; font-weight: bold;">Log in</span> to continue.
            </p>
            
            <button class="login-button" style="
                background-color: #ff6b35;
                color: white;
                border: none;
                border-radius: 25px;
                padding: 12px 40px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
                transition: background-color 0.3s ease;
            ">Login</button>
        `

    // Add hover effect
    const style = document.createElement("style")
    style.textContent = `
            .login-button:hover {
                background-color: #e55a2b !important;
            }
            .modal-close:hover {
                color: #333 !important;
            }
        `
    document.head.appendChild(style)

    modal.appendChild(modalContent)

    // Add event listeners
    const closeButton = modalContent.querySelector(".modal-close")
    const loginButton = modalContent.querySelector(".login-button")

    closeButton.addEventListener("click", () => {
      document.body.removeChild(modal)
    })

    loginButton.addEventListener("click", () => {
      document.body.removeChild(modal)
      window.location.href = "login.html"
    })

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
      }
    })

    return modal
  }

  // Show success modal
  function showSuccessModal() {
    const modal = createSuccessModal()
    document.body.appendChild(modal)
  }

  // Validation functions for each field
  const validators = {
    firstName: (value) => {
      if (!value.trim()) return "First name is required"
      if (value.trim().length < 2) return "First name must be at least 2 characters"
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return "First name can only contain letters, spaces, hyphens, and apostrophes"
      return null
    },

    lastName: (value) => {
      if (!value.trim()) return "Last name is required"
      if (value.trim().length < 2) return "Last name must be at least 2 characters"
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return "Last name can only contain letters, spaces, hyphens, and apostrophes"
      return null
    },

    phoneNumber: (value) => {
      if (!value.trim()) return "Phone number is required"
      const cleanPhone = value.replace(/\D/g, "")
      if (cleanPhone.length < 10) return "Phone number must be at least 10 digits"
      return null
    },

    email: (value) => {
      if (!value.trim()) return "Email is required"
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return "Please enter a valid email address"
      return null
    },

    dateOfBirth: (value) => {
      if (!value) return "Date of birth is required"
      const birthDate = new Date(value)
      const today = new Date()
      if (birthDate > today) return "Date of birth cannot be in the future"
      return null
    },

    country: (value) => {
      if (!value.trim()) return "Country is required"
      return null
    },

    role: (value) => {
      if (!value) return "Please select your role"
      return null
    },

    school: (value) => {
      if (!value.trim()) return "School/University is required"
      return null
    },
  }

  // Validate individual field
  function validateField(fieldName) {
    const field = fields[fieldName]
    if (!field) return true

    const value = field.value
    const validator = validators[fieldName]

    if (!validator) return true

    const error = validator(value)

    if (error) {
      showFieldError(field, error)
      return false
    } else {
      showFieldSuccess(field)
      return true
    }
  }

  // Show field error
  function showFieldError(field, message) {
    field.classList.remove("is-valid")
    field.classList.add("is-invalid")
    const feedback = field.nextElementSibling
    if (feedback && feedback.classList.contains("invalid-feedback")) {
      feedback.textContent = message
    }
  }

  // Show field success
  function showFieldSuccess(field) {
    field.classList.remove("is-invalid")
    field.classList.add("is-valid")
    const feedback = field.nextElementSibling
    if (feedback && feedback.classList.contains("invalid-feedback")) {
      feedback.textContent = ""
    }
  }

  // Handle form submission
  function handleFormSubmission(e) {
    e.preventDefault()

    // Validate all fields
    let isFormValid = true
    Object.keys(fields).forEach((fieldName) => {
      if (!validateField(fieldName)) {
        isFormValid = false
      }
    })

    if (isFormValid) {
      // Show loading state
      const submitButton = profileForm.querySelector('button[type="submit"]')
      const originalText = submitButton.textContent
      submitButton.disabled = true
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...'

      // Simulate form submission
      setTimeout(() => {
        // Reset button
        submitButton.disabled = false
        submitButton.textContent = originalText

        // Show success modal
        showSuccessModal()
      }, 1500)
    } else {
      // Focus on first invalid field
      const firstInvalidField = profileForm.querySelector(".is-invalid")
      if (firstInvalidField) {
        firstInvalidField.focus()
      }
    }
  }
})
