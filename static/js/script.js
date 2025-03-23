let isFlightInfoSet = false;

function checkSales() {
    fetch('/check_sales', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.debug("Sales status:", data);
        if (data.stop_sales) {
            disableForm();
        } else {
            enableForm();
        }
    })
    .catch(error => {
        console.error("Error checking sales status:", error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    checkSales();
});

document.getElementById('predictionForm').addEventListener('click', function () {
    checkSales();
});

function setFlightInfo() {
    const totalSeats = document.getElementById('totalSeats').value;
    const avgTickets = document.getElementById('avgTickets').value;

    if (!totalSeats || !avgTickets) {
        alert("Заполните все поля");
        return;
    }

    fetch('/set_flight_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            total_seats: totalSeats,
            avg_tickets: avgTickets
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            document.getElementById('totalSeats').disabled = true;
            document.getElementById('avgTickets').disabled = true;
            document.getElementById('setButton').disabled = true;
            document.getElementById('setButton').style.backgroundColor = "gray";
            isFlightInfoSet = true;
            checkSales();
        }
    })
    .catch(error => {
        console.error("Error setting flight info:", error);
    });
}

function resetFlightInfo() {
    const totalSeats = document.getElementById('totalSeats');
    const avgTickets = document.getElementById('avgTickets');
    const ticketList = document.getElementById('ticketList');
    const soldTickets = document.getElementById('soldTickets');
    const setButton = document.getElementById('setButton');
    const predictionForm = document.getElementById('predictionForm');

    fetch('/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            totalSeats.disabled = false;
            avgTickets.disabled = false;
            setButton.disabled = false;
            setButton.style.backgroundColor = "";

            totalSeats.value = '';
            avgTickets.value = '';

            ticketList.innerHTML = '';
            soldTickets.textContent = '0';
            checkedTickets.textContent = '0';
            cancelledTickets.textContent = '0';

            predictionForm.reset();
            enableForm();

            isFlightInfoSet = false;
        }
    })
    .catch(error => {
        console.error("Error resetting flight info:", error);
    });
}

function addTicket() {
    if (!isFlightInfoSet) {
        alert("Сначала установите информацию о рейсе");
        return;
    }

    fetch('/check_sales', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.debug("Sales status:", data);
        if (data.stop_sales) {
            disableForm(); 
            alert("Продажа билетов завершена!");
            return;
        }

        const form = document.getElementById('predictionForm');
        const inputs = form.querySelectorAll('input, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        if (!isValid) {
            alert("Заполните все поля");
            return;
        }

        const formData = {
            name: document.getElementById('name').value,
            gender: document.getElementById('gender').value,
            age: document.getElementById('age').value,
            flights: document.getElementById('flights').value,
            missed: document.getElementById('missed').value,
            cancelled: document.getElementById('cancelled').value,
            returnable: document.getElementById('returnable').value === "yes" ? 1 : 0,
            luggage: document.getElementById('luggage').value === "yes" ? 1 : 0,
            type: document.getElementById('type').value,
            reason: document.getElementById('reason').value
        };

        console.debug("Sending ticket data to server:", formData);

        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            console.debug("Received response from server:", data);

            if (data.stop_sales) {
                disableForm();
                alert("Продажа билетов завершена!");
                return;
            }

            const ticketList = document.getElementById('ticketList');
            const listItem = document.createElement('li');
            listItem.textContent = `${ticketList.children.length + 1}. ${formData.name}`;
            ticketList.appendChild(listItem);

            document.getElementById('soldTickets').textContent = data.sold_tickets;
            document.getElementById('checkedTickets').textContent = data.yes_count;
            document.getElementById('cancelledTickets').textContent = data.no_count;

            form.reset();
        })
        .catch(error => {
            console.error("Error adding ticket:", error);
        });
    })
    .catch(error => {
        console.error("Error checking sales status:", error);
    });
}

function disableForm() {
    document.getElementById('salesClosedMessage').style.display = 'block';

    document.getElementById('predictionForm').querySelectorAll('input, select, button').forEach(element => {
        element.disabled = true;
    });

    document.querySelector('.reset-button').disabled = false;
}

function enableForm() {
    document.getElementById('salesClosedMessage').style.display = 'none';

    document.getElementById('predictionForm').querySelectorAll('input, select, button').forEach(element => {
        element.disabled = false;
    });
}