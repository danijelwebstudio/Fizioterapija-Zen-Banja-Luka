document.addEventListener('DOMContentLoaded', () => {
    const slotsContainer = document.getElementById('time-slots');
    const form = document.getElementById('booking-form');
    const confirmation = document.getElementById('confirmation');
    const dateDisplay = document.getElementById('selected-date-display');
    const monthYearDisplay = document.getElementById('month-year-display');
    const daysGrid = document.getElementById('calendar-days');
    const prevBtn = document.getElementById('prev-month-btn');
    const nextBtn = document.getElementById('next-month-btn');
    const hiddenDateInput = document.getElementById('hidden-date');
    const hiddenTimeInput = document.getElementById('hidden-time');
    const submitBtn = document.getElementById('booking-submit-btn');

    // 🔧 FIX: Nedelja mora biti PRVA u redu (Ned=0, Pon=1, ..., Sub=6)
    const WEEKDAYS = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
    const MONTHS = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedTime = null;

    const TODAY = new Date();
    TODAY.setHours(0, 0, 0, 0);

    // Generisanje header-a sa danima
    const weekdaysHeader = document.getElementById('calendar-weekdays');
    if (weekdaysHeader) {
        weekdaysHeader.innerHTML = WEEKDAYS.map(day => `<span>${day}</span>`).join('');
    }

    function renderCalendar() {
        daysGrid.innerHTML = '';
        monthYearDisplay.textContent = `${MONTHS[currentMonth]} ${currentYear}`;

        // 🔧 FIX: Pravilno mapiranje dana
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0=Ned, 1=Pon, ..., 6=Sub
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // ❌ STARA LINIJA (POGREŠNA):
        // const startingDayIndex = (firstDayOfMonth + 6) % 7;
        
        // ✅ NOVA LINIJA (TAČNA):
        // Ako je firstDayOfMonth=0 (Nedelja), treba da bude na poziciji 0 (prva kolona)
        // Ako je firstDayOfMonth=1 (Ponedeljak), treba da bude na poziciji 1 (druga kolona)
        // Dakle, DIREKTNO koristimo vrednost bez offseta
        const startingDayIndex = firstDayOfMonth;

        // Dodaj prazne ćelije PRE prvog dana meseca
        for (let i = 0; i < startingDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day-cell', 'inactive');
            daysGrid.appendChild(emptyCell);
        }

        // Dodaj sve dane meseca
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const cell = document.createElement('div');
            cell.textContent = day;
            cell.classList.add('calendar-day-cell');
            cell.setAttribute('data-date', date.toISOString().split('T')[0]);

            date.setHours(0, 0, 0, 0);
            const isPastOrToday = date <= TODAY;

            if (isPastOrToday) {
                cell.classList.add('disabled');
            } else {
                cell.addEventListener('click', () => handleDateSelect(date, cell));
            }

            if (date.getTime() === TODAY.getTime()) cell.classList.add('today');
            if (selectedDate && date.toISOString().split('T')[0] === selectedDate) cell.classList.add('selected');

            daysGrid.appendChild(cell);
        }

        // Zabrani "Previous" dugme ako smo na trenutnom mesecu
        prevBtn.disabled = (currentYear === TODAY.getFullYear() && currentMonth === TODAY.getMonth());
    }

    function handleDateSelect(date, cell) {
        const dateString = date.toISOString().split('T')[0];
        document.querySelectorAll('.calendar-day-cell.selected').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');

        selectedDate = dateString;
        selectedTime = null;
        dateDisplay.textContent = date.toLocaleDateString('sr-RS', { year: 'numeric', month: 'long', day: 'numeric' });
        hiddenDateInput.value = dateString;

        generateTimeSlots(dateString);
        updateSubmitButton();
    }

    function generateTimeSlots(dateString) {
        slotsContainer.innerHTML = "";
        const booked = JSON.parse(localStorage.getItem("bookedSlots") || "{}");

        if (!booked[dateString]) booked[dateString] = [];

        // Testni podaci (opciono)
        const exampleDate = '2025-11-12';
        if (dateString === exampleDate && !booked[exampleDate].length) {
            booked[exampleDate] = ["10:00", "13:00"];
            localStorage.setItem("bookedSlots", JSON.stringify(booked));
        }

        const bookedForSelectedDate = booked[dateString] || [];
        const startHour = 8;
        const endHour = 15;

        for (let h = startHour; h <= endHour; h++) {
            const time = `${h.toString().padStart(2, '0')}:00`;
            const slot = document.createElement('div');
            slot.textContent = time;

            if (bookedForSelectedDate.includes(time)) {
                slot.classList.add('slot', 'booked-slot');
            } else {
                slot.classList.add('slot', 'available-slot');
                slot.setAttribute('data-time', time);
                slot.addEventListener('click', (e) => selectSlot(e.currentTarget, time));
            }

            slotsContainer.appendChild(slot);
        }

        if (!slotsContainer.children.length) {
            slotsContainer.innerHTML = '<p class="initial-prompt">Nema dostupnih termina za ovaj dan.</p>';
        }
    }

    function selectSlot(slotElement, time) {
        document.querySelectorAll('.slot.selected-slot').forEach(s => s.classList.remove('selected-slot'));
        slotElement.classList.add('selected-slot');
        selectedTime = time;
        hiddenTimeInput.value = time;
        updateSubmitButton();
    }

    function updateSubmitButton() {
        const dateSelected = hiddenDateInput.value;
        const timeSelected = hiddenTimeInput.value;

        if (!dateSelected) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Odaberite datum i vrijeme za zakazivanje';
            return;
        }

        if (dateSelected && !timeSelected) {
            let formattedDate = dateSelected;
            try {
                const d = new Date(dateSelected);
                if (!isNaN(d)) {
                    formattedDate = d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            } catch (err) {
                // Fallback: ostavi original string
            }

            submitBtn.disabled = true;
            submitBtn.textContent = `Zakažite termin za ${formattedDate} (izaberite vrijeme)`;
            return;
        }

        if (dateSelected && timeSelected) {
            let formattedDate = dateSelected;
            try {
                const d = new Date(dateSelected);
                if (!isNaN(d)) {
                    formattedDate = d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            } catch (err) {}

            submitBtn.disabled = false;
            submitBtn.textContent = `Zakaži termin za ${formattedDate} u ${timeSelected}`;
            return;
        }

        // Fallback
        submitBtn.disabled = true;
        submitBtn.textContent = 'Odaberite datum i vrijeme';
    }

    prevBtn.addEventListener('click', () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        renderCalendar();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) return;

        const booked = JSON.parse(localStorage.getItem("bookedSlots") || "{}");
        if (!booked[selectedDate]) booked[selectedDate] = [];
        booked[selectedDate].push(selectedTime);
        localStorage.setItem("bookedSlots", JSON.stringify(booked));

        confirmation.style.display = 'block';
        form.reset();

        selectedDate = null;
        selectedTime = null;
        renderCalendar();
        updateSubmitButton();

        confirmation.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => (confirmation.style.display = 'none'), 5000);
    });

    renderCalendar();
    updateSubmitButton();
});