
export function validateUsername(username) {
    if (!username || username.length < 3) {
        return 'Username must be at least 3 characters long';
    }
    if (username.length > 20) {
        return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return 'Username can only contain letters, numbers and underscores';
    }
    return null;
}

export function validatePassword(password) {
    if (!password || password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    if (password.length > 50) {
        return 'Password must be less than 50 characters';
    }
    return null;
}

export function showAlert(form, message, type) {
    const existingAlert = form.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;

    form.insertBefore(alert, form.firstChild);

    setTimeout(() => {
        alert.remove();
    }, 4000);
}