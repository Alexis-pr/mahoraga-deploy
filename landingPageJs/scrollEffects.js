const REVEAL_VARIANTS = ['up', 'left', 'right', 'zoom'];

export function initScrollEffects() {
    const targets = document.querySelectorAll('section, main > article, footer');

    if (!targets.length) {
        return;
    }

    targets.forEach((element, index) => {
        element.classList.add('section-reveal');
        element.dataset.reveal = REVEAL_VARIANTS[index % REVEAL_VARIANTS.length];
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.22,
            rootMargin: '0px 0px -10% 0px',
        }
    );

    targets.forEach((element) => observer.observe(element));
}
