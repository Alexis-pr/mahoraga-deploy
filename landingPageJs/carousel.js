
export function initCarousel() {
    const columnUp = document.getElementById('columnUp');
    const columnDown = document.getElementById('columnDown');

    if (columnUp && columnDown) {
        const cardsUp = columnUp.innerHTML;
        columnUp.innerHTML = cardsUp + cardsUp;

        const cardsDown = columnDown.innerHTML;
        columnDown.innerHTML = cardsDown + cardsDown;
    }
}