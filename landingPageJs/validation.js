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

export function validateLoginIdentifier(identifier) {
    if (!identifier) {
        return 'Email o username es requerido';
    }

    const normalized = identifier.trim();

    // Si tiene @, se valida como email.
    if (normalized.includes('@')) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
            return 'Email invalido';
        }
        return null;
    }

    // Si no tiene @, se valida como username.
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalized)) {
        return 'Username invalido (3-20, letras, numeros y _)';
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
