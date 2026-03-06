import{createUser, UserCreateDTO} from '../conect/createUser.js'
import {getUsers} from '../conect/readUser.js'
import { validateUsername, validatePassword, showAlert } from '../landingPageJs/validation.js';

getUsers(); // First we bring in all the users to avoid errors, then
export function initAuthModal() {
    const authModal = document.getElementById('authModal');
    const authWrapper = document.getElementById('authWrapper');
    const brandPanel = document.getElementById('brandPanel');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const openRegisterBtn = document.getElementById('openRegisterBtn');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const dots = document.querySelectorAll('.dot');
    const h1 = document.getElementById('h1Mahoraga');

    function updateLogoColor(isRegisterMode) {
        const logoLogin = document.querySelector('.logoLogin');
        const logoCircle = document.querySelector('.logo-circle');
        const brandPanel = document.getElementById('brandPanel');
        
        if (logoLogin && logoCircle) {
            logoCircle.style.transform = 'scale(0.95)';
            logoLogin.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                if (isRegisterMode) {
                    logoLogin.style.filter = 'brightness(100%)';
                    logoCircle.style.background = 'linear-gradient(135deg, #000000 0%, #000000 100%)';
                    logoCircle.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
                    if (brandPanel) {
                        brandPanel.style.background = 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)';
                        h1.style.color = 'black';
                    }
                } else {
                    logoLogin.style.filter = 'brightness(1%)';
                    logoCircle.style.background = 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)';
                    logoCircle.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.2)';
                    h1.style.color = 'white';
                    if (brandPanel) {
                        brandPanel.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #000000 100%)';
                    }
                }
            }, 100);
            
            setTimeout(() => {
                logoCircle.style.transform = 'scale(1.05)';
                logoLogin.style.transform = 'scale(1.05)';
            }, 150);
            
            setTimeout(() => {
                logoCircle.style.transform = 'scale(1)';
                logoLogin.style.transform = 'scale(1)';
            }, 300);
        }
    }

    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', () => {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            authWrapper.classList.remove('register-mode');
            registerSection.classList.remove('active');
            loginSection.classList.add('active');
            updateDots(0);
            
            setTimeout(() => {
                updateLogoColor(false);
            }, 100);
        });
    }

    if (openRegisterBtn) {
        openRegisterBtn.addEventListener('click', () => {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                switchToRegisterView();
            }, 100);
        });
    }

    function closeModal() {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
        
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => alert.remove());
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('active')) {
            closeModal();
        }
    });

    function switchToRegisterView() {
        brandPanel.classList.add('fade-out');
        brandPanel.classList.remove('fade-in');
        loginSection.classList.remove('active');
        
        setTimeout(() => {
            authWrapper.classList.add('register-mode');
            updateDots(1);
            updateLogoColor(true);
        }, 250);
        
        setTimeout(() => {
            brandPanel.classList.remove('fade-out');
            brandPanel.classList.add('fade-in');
        }, 500);
        
        setTimeout(() => {
            registerSection.classList.add('active');
        }, 350);
    }

    function switchToLoginView() {
        brandPanel.classList.add('fade-out');
        brandPanel.classList.remove('fade-in');
        registerSection.classList.remove('active');
        
        setTimeout(() => {
            authWrapper.classList.remove('register-mode');
            updateDots(0);
            updateLogoColor(false);
        }, 250);
        
        setTimeout(() => {
            brandPanel.classList.remove('fade-out');
            brandPanel.classList.add('fade-in');
        }, 500);
        
        setTimeout(() => {
            loginSection.classList.add('active');
        }, 350);
    }

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchToRegisterView();
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchToLoginView();
        });
    }

    function updateDots(activeIndex) {
        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameOrEmail = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value;

        // Validaciones básicas
        const usernameError = validateUsername(usernameOrEmail);
        if (usernameError) {
            showAlert(loginForm, usernameError, 'error');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            showAlert(loginForm, passwordError, 'error');
            return;
        }

        try {
            // Get all users from the API
            const users = await getUsers();

            // Search user to name or email
            const user = users.find(u => u.user_name === usernameOrEmail || u.email === usernameOrEmail);

            if (!user) {
                showAlert(loginForm, 'User not found', 'error');
                return;
            }

            if (user.password !== password) {
                showAlert(loginForm, 'Incorrect password', 'error');
                return;
            }

            // Login success
            showAlert(loginForm, `Welcome, ${user.user_name}!`, 'success');

            // save data in localStorage to persist session
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));

            // redirect to dashboard
            setTimeout(() => {
                window.location.href = './pages/dashboard.html'; // Cambia por tu página real
            }, 1500);

        } catch (error) {
            console.error(error);
            showAlert(loginForm, 'Error logging in. Try again later.', 'error');
        }
    });
}
   if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // avoid recharge the page

        const username = document.getElementById('registerUser').value.trim();
        const email = document.getElementById('registerEmail')?.value.trim() || '';
        const password = document.getElementById('registerPass').value;
        const confirmPassword = document.getElementById('registerConfirm').value;

        // Validations
        const usernameError = validateUsername(username);
        if (usernameError) {
            showAlert(registerForm, usernameError, 'error');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            showAlert(registerForm, passwordError, 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert(registerForm, 'Passwords do not match', 'error');
            return;
        }

        // Create DTO
        const userDTO = new UserCreateDTO({
            user_name: username,
            email: email,
            password: password
        });

        try {
            // call Api to create new user
            const newUser = await createUser(userDTO);

            // Mostrar mensaje de éxito
            showAlert(registerForm, 'Account created successfully!', 'success');
            registerForm.reset();

            // Después de 2 segundos, cambiar a login
            setTimeout(() => {
                switchToLoginView();
            }, 2000);

        } catch (error) {
            console.error(error);
            showAlert(registerForm, 'Error creating account. Try again later.', 'error');
        }
    });
}
    // Add simple animation for input focus
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)'; // move input up a bit
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)'; // move input back
        });
    });
};