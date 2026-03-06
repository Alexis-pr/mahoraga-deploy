
export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            let target;

            switch(targetId) {
                case "#home":
                    target = document.querySelector(".slogan");
                    break;
                case "#aboutUs":
                    target = document.getElementById("aboutUs");
                    break;
                case "#skills-container":
                    target = document.getElementById("skills-container");
                    break;
                case "#contact":
                    target = document.getElementById("contact");
                    break;
                default:
                    target = document.querySelector(targetId);
            }

            if (!target) {
                console.warn(`No se encontró el elemento para: ${targetId}`);
                return;
            }

            const startPosition = window.scrollY;
            const targetPosition = target.offsetTop - 100;
            const distance = targetPosition - startPosition;
            const duration = 1500;
            let start = null;

            function animation(currentTime) {
                if (!start) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);

                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            }

            function easeInOutQuad(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return (c / 2) * t * t + b;
                t--;
                return (-c / 2) * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        });
    });
}