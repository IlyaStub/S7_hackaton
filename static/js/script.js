let isFlightInfoSet = false;

function setFlightInfo() {
    const totalSeats = document.getElementById('totalSeats');
    const avgTickets = document.getElementById('avgTickets');
    const errorMessage = document.getElementById('errorMessage');
    const setButton = document.getElementById('setButton'); 


    if (!totalSeats.value.trim() || !avgTickets.value.trim()) {
        errorMessage.textContent = "Заполните все поля";
        errorMessage.style.display = 'block';
        return;
    }

    
    totalSeats.disabled = true;
    avgTickets.disabled = true;
    setButton.classList.add('disabled'); 
    setButton.disabled = true; 
    isFlightInfoSet = true; 
    errorMessage.style.display = 'none';
}

function resetFlightInfo() {
    const totalSeats = document.getElementById('totalSeats');
    const avgTickets = document.getElementById('avgTickets');
    const ticketList = document.getElementById('ticketList');
    const soldTickets = document.getElementById('soldTickets');
    const setButton = document.getElementById('setButton'); 

    totalSeats.disabled = false;
    avgTickets.disabled = false;
    setButton.classList.remove('disabled'); 
    setButton.disabled = false;

    totalSeats.value = '';
    avgTickets.value = '';

    ticketList.innerHTML = '';

    soldTickets.textContent = '0';

    isFlightInfoSet = false;
}

function addTicket() {
    const form = document.getElementById('predictionForm');
    const errorMessage = document.getElementById('addTicketErrorMessage');

    if (!isFlightInfoSet) {
        errorMessage.textContent = "Сначала установите информацию о рейсе";
        errorMessage.style.display = 'block';
        return;
    }

    let isValid = true;
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error'); 
        } else {
            input.classList.remove('error'); 
        }
    });

    if (!isValid) {
        errorMessage.textContent = "Заполните все поля";
        errorMessage.style.display = 'block'; 
        return; 
    }

    errorMessage.style.display = 'none';

    const name = document.getElementById('name').value;

    const listItem = document.createElement('li');
    const ticketList = document.getElementById('ticketList');
    const ticketNumber = ticketList.children.length + 1; 
    listItem.textContent = `${ticketNumber}. ${name}`; 

    ticketList.appendChild(listItem);

    const soldTickets = document.getElementById('soldTickets');
    soldTickets.textContent = ticketList.children.length;

    form.reset();
}