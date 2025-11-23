document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger-btn");  // dugme ☰
    const mobileNav = document.querySelector("#mobile-nav");      // mobilni meni
    const closeBtn = document.querySelector("#close-mobile-nav"); // ✔️ ispravna selekcija
    const links = mobileNav.querySelectorAll("a");
    const html = document.documentElement;

    function openNav() {
        mobileNav.classList.add("open");
        html.style.overflow = "hidden";
    }

    function closeNav() {
        mobileNav.classList.remove("open");
        html.style.overflow = "";
    }

    // ☰ dugme
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        openNav();
    });

    // X dugme
    closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeNav();
    });

    // klik na link
    links.forEach(link => {
        link.addEventListener("click", closeNav);
    });

    // ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
    });

    // klik na pozadinu mobilnog menija
    mobileNav.addEventListener("click", (e) => {
        if (e.target === mobileNav) closeNav();
    });
});
