
export function initParallax() {
    const slogan = document.querySelector(".slogan");
    const interfaz = document.querySelector(".interfaz");
    const materias = document.querySelector(".container-materias");
    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const progress = Math.min(scrollY / (windowHeight * 0.9), 1);
        const eased = Math.pow(progress, 0.85);

        const scaleHero = 1 - eased * 0.28;
        const translateHero = eased * 120;
        const opacityHero = 1 - eased * 1.05;

        if (slogan) {
            slogan.style.transform = `translateY(${translateHero}px) scale(${scaleHero})`;
            slogan.style.opacity = opacityHero;
        }

        if (interfaz) {
            const translateInterfaz = eased * 180;
            const scaleInterfaz = 1 - eased * 0.42;
            const opacityInterfaz = 1 - eased * 1.2;
            interfaz.style.transform = `translateY(${translateInterfaz}px) scale(${scaleInterfaz})`;
            interfaz.style.opacity = opacityInterfaz;
            interfaz.style.filter = "";
        }

        if (materias) {
            const translateMaterias = 220 - eased * 220;
            const scaleMaterias = 0.92 + eased * 0.08;
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
