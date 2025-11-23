# 🌿 Fizioterapija Zen - Banja Luka

Ovaj projekat predstavlja modernu, čistu i preglednu web stranicu za fizioterapiju, baziranu na vizuelnom stilu PhysioZen teme. Sadržaj je potpuno lokalizovan na srpski jezik (ijekavica), sa fokusom na lokaciju Banja Luka.

## 🚀 Pokretanje Projekta Lokalno

Da biste pokrenuli projekat lokalno, dovoljno je da otvorite fajl `index.html` u bilo kojem modernom web pretraživaču.

## 🎨 Prilagođavanje Dizajna i Sadržaja

Sva podešavanja su centralizovana i detaljno komentarisana.

### 1. Promjena Boja i Tipografije (CSS)

Sve primarne boje i fontovi su definisani kao CSS varijable u fajlu `/css/styles.css` unutar `:root` selektora.

* **Primarna boja:** Promijenite vrijednost varijable `--primary-color`.
* **Sekundarna boja:** Promijenite vrijednost varijable `--secondary-color`.
* **Boja teksta:** Promijenite vrijednosti varijabli za tekst (`--text-dark`, `--text-light`).
* **Font:** Promijenite vrijednost varijable `--font-family`.

### 2. Promjena Teksta i Sadržaja (HTML)

Sve sekcije u `index.html` su opremljene detaljnim HTML komentarima (****) koji objašnjavaju gdje se šta mijenja.

* **Naslovi i Paragrafi:** Tekst se direktno mijenja u odgovarajućim HTML tagovima (`<h1>`, `<p>`, `<h2>` itd.).
* **Navigacija:** Mijenja se unutar `<nav>` elementa.
* **Kontakt Detalji:** Ažurirajte adresu, brojeve telefona i e-mail u sekciji **FOOTER**.

### 3. Promjena Slika (IMAGES)

Sve slike se nalaze (ili bi trebalo da se nalaze) u folderu `/images`.

* **Hero Slika:** Mijenja se direktno u HTML-u unutar `<section class="hero-section">` ili preko CSS-a ako je definisana kao pozadina.
* **Galerija/Usluge Slike:** Zamijenite putanje do slika (`src="/images/naziv-slike.webp"`) i obavezno ažurirajte **alt atribute** za pristupačnost.
* **Preporučeni format:** Koristite optimizovane `.webp` slike.

### 4. SEO Optimizacija (META TAGOVI)

Meta tagovi se nalaze u `<head>` sekciji fajla `index.html`. Ažurirajte sljedeće:

* **Title:** `<title>Fizioterapija Banja Luka – Fizioterapija Zen</title>`
* **Meta Description:** `<meta name="description" content="Stručni tim fizioterapeuta u Banjoj Luci. Nudimo individualne programe rehabilitacije, masaže i kinezioterapiju. Zakažite svoj termin danas!">`

### 5. Dodavanje Novih Sekcija / Sadržaja

* **FAQ / Testimoniali:** Dodajte nove `<article>` ili `<div>` elemente unutar odgovarajućih sekcija (`.testimonials-grid`, `.faq-item`) prateći postojeću strukturu.
* **Usluge:** Kopirajte postojeći `<div class="service-card">` i izmijenite ikonu, naslov i opis.
* **Google Maps:** Zamijenite `iframe` kod unutar sekcije **KONTAKT** sa novim, generisanim embed kodom za tačnu lokaciju u Banjoj Luci.