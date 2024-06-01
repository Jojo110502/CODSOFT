console.log("app.js loaded");
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const viewBookingsButton = document.getElementById('viewBookings');
    const bookingForm = document.getElementById('bookingForm');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    console.log(searchForm, viewBookingsButton, bookingForm, registerForm, loginForm); // Logs elements or null if not found

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const searchQuery = document.getElementById('search').value;

            try {
                const response = await fetch('http://localhost:3000/destinations');
                const destinations = await response.json();

                const searchResults = destinations.filter(destination => destination.name.toLowerCase().includes(searchQuery.toLowerCase()));

                const searchResultsElement = document.getElementById('searchResults');
                searchResultsElement.innerHTML = '';
                searchResults.forEach(destination => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${destination.name}</strong> - ${destination.description}`;

                    if (destination.images && destination.images.length > 0) {
                        const imageContainer = document.createElement('div');
                        destination.images.forEach(imageUrl => {
                            const img = document.createElement('img');
                            img.src = imageUrl;
                            img.alt = `${destination.name} image`;
                            img.style.width = '100px';  // Adjust size as needed
                            img.style.margin = '5px';
                            imageContainer.appendChild(img);
                        });
                        li.appendChild(imageContainer);
                    }

                    searchResultsElement.appendChild(li);
                });
            } catch (error) {
                console.error('Error fetching destinations:', error);
            }
        });
    }

    if (viewBookingsButton) {
        viewBookingsButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('http://localhost:3000/bookings', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const bookings = await response.json();

                const bookingResultsElement = document.getElementById('bookingResults');
                bookingResultsElement.innerHTML = '';
                bookings.forEach(booking => {
                    const li = document.createElement('li');
                    li.textContent = `${booking.destination} - ${new Date(booking.date).toLocaleDateString()} - ${booking.status}`;
                    bookingResultsElement.appendChild(li);
                });
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const destination = document.getElementById('destination').value;
            const date = document.getElementById('date').value;
            const token = localStorage.getItem('token');

            try {
                const bookingResponse = await fetch('http://localhost:3000/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ destination, date })
                });

                if (bookingResponse.ok) {
                    alert('Booking successful');
                } else {
                    alert('Booking failed');
                }
            } catch (error) {
                console.error('Error booking:', error);
                alert('Booking failed');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                if (response.ok) {
                    alert('Registration successful');
                    window.location.href = 'login.html';
                } else {
                    alert('Registration failed');
                }
            } catch (error) {
                console.error('Error registering:', error);
                alert('Registration failed');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    alert('Login successful');
                    window.location.href = 'index.html';
                } else {
                    alert('Login failed');
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('Login failed');
            }
        });
    }
});
