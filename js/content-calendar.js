let currentCalendarDate = new Date();

async function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearEl = document.getElementById('calendar-month-year');
    if (!grid || !monthYearEl) return;

    grid.innerHTML = ''; // Clear previous calendar

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    monthYearEl.textContent = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Add headers
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    days.forEach(day => {
        const headerEl = document.createElement('div');
        headerEl.className = 'calendar-header';
        headerEl.textContent = day;
        grid.appendChild(headerEl);
    });

    // Fetch scheduled posts
    let scheduledPosts = [];
    try {
        const response = await fetch('http://localhost:8001/api/posts?status=scheduled');
        if (response.ok) {
            scheduledPosts = await response.json();
        }
    } catch (e) {
        console.error("Failed to fetch posts for calendar", e);
    }

    // Create day cells
    for (let i = 0; i < 42; i++) { // 6 weeks grid
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        const day = i - startDayOfWeek + 1;

        if (day > 0 && day <= daysInMonth) {
            dayEl.innerHTML = `<div class="day-number">${day}</div>`;
            
            // Find posts for this day
            const postsForDay = scheduledPosts.filter(p => {
                const postDate = new Date(p.scheduled_time);
                return postDate.getFullYear() === year && postDate.getMonth() === month && postDate.getDate() === day;
            });

            postsForDay.forEach(post => {
                const eventEl = document.createElement('div');
                eventEl.className = 'calendar-event';
                eventEl.textContent = post.title;
                eventEl.title = post.title;
                dayEl.appendChild(eventEl);
            });

        } else {
            dayEl.classList.add('other-month');
        }
        grid.appendChild(dayEl);
    }
}

function changeMonth(offset) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderCalendar();
}

document.addEventListener('DOMContentLoaded', () => {
    const calendarTab = document.querySelector('a[onclick="showTab(\'content-calendar\')"]');
    if (calendarTab) {
        calendarTab.addEventListener('click', renderCalendar);
    }
});