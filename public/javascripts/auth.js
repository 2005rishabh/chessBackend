// auth.js - Client-side authentication handling

// Show alert function
function showAlert(message, type = 'error') {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `p-4 rounded-xl ${type === 'error'
            ? 'bg-red-500/20 border border-red-300/30 text-red-200'
            : 'bg-green-500/20 border border-green-300/30 text-green-200'
        }`;
    alert.classList.remove('hidden');

    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

// Form validation
function validateForm(formData) {
    const { username, email, password, confirmPassword } = formData;

    if (username && username.length < 3) {
        return 'Username must be at least 3 characters long';
    }

    if (!email.includes('@')) {
        return 'Please enter a valid email address';
    }

    if (password.length < 6) {
        return 'Password must be at least 6 characters long';
    }

    if (confirmPassword && password !== confirmPassword) {
        return 'Passwords do not match';
    }

    return null;
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        const error = validateForm(formData);
        if (error) {
            showAlert(error);
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showAlert(data.message);
            }
        } catch (error) {
            showAlert('Network error. Please try again.');
        }
    });
}

// Signup form handler
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        const error = validateForm(formData);
        if (error) {
            showAlert(error);
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showAlert(data.message);
            }
        } catch (error) {
            showAlert('Network error. Please try again.');
        }
    });
}

// Logout function (can be used in your main game page)
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}