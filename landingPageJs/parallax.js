
export function initParallax() {
    const slogan = document.querySelector(".slogan");
    const interfaz = document.querySelector(".interfaz");
    const materias = document.querySelector(".container-materias");
    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const progress = Math.min(scrollY / windowHeight, 1);

        const scaleHero = 1 - progress * 0.3;
        const translateHero = progress * 150;
        const opacityHero = 1 - progress * 1.2;

        if (slogan) {
            slogan.style.transform = `translateY(${translateHero}px) scale(${scaleHero})`;
            slogan.style.opacity = opacityHero;
        }

        if (interfaz) {
            interfaz.style.transform = `translateY(${translateHero}px) scale(${scaleHero})`;
            interfaz.style.opacity = opacityHero;
        }

        if (materias) {
            const translateMaterias = 200 - progress * 200;
            const scaleMaterias = 0.9 + progress * 0.1;
            materias.style.transform = `translateY(${translateMaterias}px) scale(${scaleMaterias})`;
        }

        if (header) {
            if (scrollY > 100) {
                header.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
                header.style.backdropFilter = "blur(10px)";
                header.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)";
            } else {
                header.style.backgroundColor = "transparent";
                header.style.backdropFilter = "none";
                header.style.boxShadow = "none";
            }
        }
    });
}