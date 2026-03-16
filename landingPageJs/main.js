
import { initParallax } from '../landingPageJs/parallax.js';
import { initSmoothScroll } from './navigation.js';
import { initCarousel } from '../landingPageJs/carousel.js';
import { initAuthModal } from '../landingPageJs/modal.js';
import { redirectLoggedInUser } from '../js/services/sessionService.js';
import { initScrollEffects } from './scrollEffects.js';

initCarousel();

initParallax();

initSmoothScroll();
initScrollEffects();

const root = document.body;
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 3;
let trailX = targetX;
let trailY = targetY;
let glowFrame = null;

function scheduleGlowUpdate() {
    if (glowFrame) {
        return;
    }

    glowFrame = window.requestAnimationFrame(() => {
        trailX += (targetX - trailX) * 0.14;
        trailY += (targetY - trailY) * 0.14;

        root.style.setProperty('--cursor-x', `${targetX}px`);
        root.style.setProperty('--cursor-y', `${targetY}px`);
        root.style.setProperty('--trail-x', `${trailX}px`);
        root.style.setProperty('--trail-y', `${trailY}px`);

        if (Math.abs(targetX - trailX) > 0.5 || Math.abs(targetY - trailY) > 0.5) {
            glowFrame = null;
            scheduleGlowUpdate();
            return;
        }

        glowFrame = null;
    });
}

function updateGlowTarget(x, y) {
    targetX = x;
    targetY = y;
    scheduleGlowUpdate();
}

document.addEventListener('mousemove', (event) => {
    updateGlowTarget(event.clientX, event.clientY);
});

document.addEventListener('touchmove', (event) => {
    const touch = event.touches?.[0];
    if (touch) {
        updateGlowTarget(touch.clientX, touch.clientY);
    }
}, { passive: true });

updateGlowTarget(targetX, targetY);

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.classList.add('is-visible');
        window.setTimeout(() => {
            splash.classList.add('is-hidden');
        }, 1200);
    }

    if (redirectLoggedInUser()) {
        return;
    }

    initAuthModal();
    console.log('Mahoraga - All systems initialized ');
});
