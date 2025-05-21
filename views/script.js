function movePastEvents() {
    const currentTime = new Date(); // Get current time
    
    const upcomingEventsContainer = document.getElementById('upcoming-events'); // Upcoming events section
    const pastEventsContainer = document.getElementById('past-events'); // Past events section

    if (!upcomingEventsContainer || !pastEventsContainer) return; // Ensure elements exist

    const upcomingEvents = upcomingEventsContainer.querySelectorAll('.event'); // Select all upcoming events

    upcomingEvents.forEach(event => {
        const closingTime = new Date(event.getAttribute('data-closing-time')); // Get event closing time

        if (closingTime < currentTime) {
            pastEventsContainer.appendChild(event); // Move to past events
        }
    });
}

// Run every minute to update events
setInterval(movePastEvents, 60000);