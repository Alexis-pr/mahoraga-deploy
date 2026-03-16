
export function initCarousel() {
    const columnUp = document.getElementById('columnUp');
    const columnDown = document.getElementById('columnDown');

    if (columnUp && columnDown) {
        const cardsUp = columnUp.innerHTML;
        columnUp.innerHTML = cardsUp + cardsUp;

        const cardsDown = columnDown.innerHTML;
        columnDown.innerHTML = cardsDown + cardsDown;
    }

    initRoleCarousel();
}

function initRoleCarousel() {
    const wrapper = document.querySelector('[data-role-carousel]');
    if (!wrapper) {
        return;
    }

    const track = wrapper.querySelector('.roles-track');
    const cards = Array.from(wrapper.querySelectorAll('[data-role-card]'));
    const prevButton = wrapper.querySelector('[data-role-prev]');
    const nextButton = wrapper.querySelector('[data-role-next]');

    if (!track || !prevButton || !nextButton || cards.length === 0) {
        return;
    }

    let activeIndex = 0;

    const updateButtons = () => {
        prevButton.disabled = activeIndex <= 0;
        nextButton.disabled = activeIndex >= cards.length - 1;
    };

    const setActive = (index) => {
        cards.forEach((card, cardIndex) => {
            card.classList.toggle('is-active', cardIndex === index);
        });
        activeIndex = index;
        updateButtons();
    };

    const scrollToIndex = (index) => {
        const card = cards[index];
        if (!card) {
            return;
        }
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        setActive(index);
    };

    prevButton.addEventListener('click', () => {
        scrollToIndex(Math.max(activeIndex - 1, 0));
    });

    nextButton.addEventListener('click', () => {
        scrollToIndex(Math.min(activeIndex + 1, cards.length - 1));
    });

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            scrollToIndex(index);
        });
    });

    let scrollFrame = null;
    const updateActiveFromScroll = () => {
        scrollFrame = null;
        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        let bestIndex = activeIndex;
        let bestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const distance = Math.abs(center - trackCenter);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = index;
            }
        });

        if (bestIndex !== activeIndex) {
            setActive(bestIndex);
        }
    };

    track.addEventListener('scroll', () => {
        if (scrollFrame) {
            return;
        }
        scrollFrame = window.requestAnimationFrame(updateActiveFromScroll);
    });

    setActive(activeIndex);
    updateActiveFromScroll();
}
