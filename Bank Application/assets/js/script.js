'use strict';

// Data
const account1 = {
	owner: 'Xolani Shongwe',
	movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
	interestRate: 1.2, // %
	pin: 1111,

	movementsDates: [
		'2022-11-18T21:31:17.178Z',
		'2022-12-23T07:42:02.383Z',
		'2022-04-21T09:15:04.904Z',
		'2023-04-01T10:17:24.185Z',
		'2023-10-16T14:11:59.604Z',
		'2023-05-27T17:01:17.194Z',
		'2023-10-13T23:36:17.929Z',
		'2023-10-15T10:51:36.790Z',
	],
	currency: 'ZAR',
	locale: 'en-ZA',
};

const account2 = {
	owner: 'Sbusiso Dlamini',
	movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
	interestRate: 1.5,
	pin: 2222,

	movementsDates: [
		'2022-09-01T13:15:33.035Z',
		'2022-10-30T09:48:16.867Z',
		'2022-12-25T06:04:23.907Z',
		'2023-01-25T14:18:46.235Z',
		'2023-02-05T16:33:06.386Z',
		'2023-04-10T14:43:26.374Z',
		'2023-10-14T18:49:59.371Z',
		'2023-05-16T12:01:20.894Z',
	],
	currency: 'USD',
	locale: 'en-US',
};

const accounts = [account1, account2];

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const currencies = new Map([
	['USD', 'United States dollar'],
	['EUR', 'Euro'],
	['GBP', 'Pound sterling'],
]);

const formatMovementDate = function (date, locale) {
	const calcDaysPassed = (date1, date2) => {
		return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
	};

	const daysPassed = calcDaysPassed(new Date(), date);

	if (daysPassed === 0) return 'Today';
	if (daysPassed === 1) return 'Yesterday';
	if (daysPassed <= 7) return `${daysPassed} days ago`;

	return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
	}).format(value);
};

const displayMovements = function (acc, sort = false) {
	containerMovements.innerHTML = '';

	const movs = sort
		? acc.movements.slice().sort((a, b) => a - b)
		: acc.movements;

	movs.forEach((mov, i) => {
		const type = mov > 0 ? 'deposit' : 'withdrawal';

		const date = new Date(acc.movementsDates[i]);
		const displayDate = formatMovementDate(date, acc.locale);

		const formattedMov = formatCurrency(mov, acc.locale, acc.currency);

		const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
			i + 1
		} ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div> 
    `;

		containerMovements.insertAdjacentHTML('afterbegin', html);
	});
};

const calcDisplayBalance = function (acc) {
	acc.balance = acc.movements.reduce((acc, mov) => {
		return acc + mov;
	}, 0);

	const formattedBalance = formatCurrency(acc.balance, acc.locale, acc.currency);
	labelBalance.textContent = `${formattedBalance}`;
};


const calcDisplaySummary = function (acc) {
	const incomeIn = acc.movements
		.filter((mov) => mov > 0)
		.reduce((accumulator, current) => accumulator + current, 0);

	labelSumIn.textContent = formatCurrency(incomeIn, acc.locale, acc.currency);

	const incomeOut = acc.movements
		.filter((mov) => mov < 0)
		.reduce((accumulator, current) => accumulator + current, 0);

	labelSumOut.textContent = formatCurrency(Math.abs(incomeOut), acc.locale, acc.currency);

	// Interest is 1.2 of the deposited amount
	const interestRate = acc.movements
		.filter((mov) => mov > 0)
		.map((deposite) => (deposite * acc.interestRate) / 100)
		.filter((int, index, array) => index >= 1)
		.reduce((accumulator, int) => accumulator + int, 0);

	labelSumInterest.textContent = formatCurrency(interestRate, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
	accs.forEach((acc) => {
		acc.username = acc.owner
			.toLowerCase()
			.split(' ')
			.map((name) => name[0])
			.join('');
	});
};

createUsernames(accounts);

const updateUI = function (acc) {
	// Display movements
	displayMovements(acc);

	// Display balance
	calcDisplayBalance(acc);

	// Display summary
	calcDisplaySummary(acc);
};

const startLogOutTimer = function () {

	const tick = function () {
		const min = String(Math.trunc(time / 60)).padStart(2, 0);
		const sec = String(time % 60).padStart(2, 0);
		// In each call, print the remaining time to UI
		labelTimer.textContent = `${min}:${sec}`;

		
		// When 0 seconds, stop timer and log out user
		if(time === 0) {
			clearInterval(timer);
			labelWelcome.textContent = `Log in to get started`;
			containerApp.style.opacity = 0;
		}
		
		// Decrease 1 second
		time--;
	};
	// Set time to 5 minutes
	let time = 600;

	// Call the timer every second
	tick();
	const timer = setInterval(tick, 1000);
	return timer;
};

let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
	// Prevent form from submitting
	e.preventDefault();

	currentAccount = accounts.find(
		(acc) => acc.username === inputLoginUsername.value
	);
	console.log(currentAccount);

	if (currentAccount?.pin === +inputLoginPin.value) {
		// Display UI and Login Message
		labelWelcome.textContent = `Welcome back, ${
			currentAccount.owner.split(' ')[0]
		}`;

		containerApp.style.opacity = 100;

		// Create Current Date
		const now = new Date();
		const options = {
			hour: 'numeric',
			minute: 'numeric',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			weekday: 'long',
		};

		labelDate.textContent = new Intl.DateTimeFormat(
			currentAccount.locale,
			options
		).format(now);

		// Clear input fields
		inputLoginUsername.value = inputLoginPin.value = '';
		inputLoginPin.blur();

		
		// Timer
		if (timer) clearInterval(timer);
		timer = startLogOutTimer();

		// Update User Interface
		updateUI(currentAccount);
	}
});

btnTransfer.addEventListener('click', function (e) {
	e.preventDefault();
	const amount = +inputTransferAmount.value;
	const receiverAcc = accounts.find(
		(acc) => acc.username === inputTransferTo.value
	);

	inputTransferAmount.value = inputTransferTo.value = '';

	if (
		amount > 0 &&
		receiverAcc &&
		currentAccount.balance >= amount &&
		receiverAcc?.username !== currentAccount.username
	) {
		currentAccount.movements.push(-amount);
		receiverAcc.movements.push(amount);

		// Add transfer date
		currentAccount.movementsDates.push(new Date().toISOString());
		receiverAcc.movementsDates.push(new Date().toISOString());

		// Update User Interface
		updateUI(currentAccount);

		// Reset Timer
		clearInterval(timer);
		timer = startLogOutTimer();
	}
});

btnLoan.addEventListener('click', function (e) {
	e.preventDefault();

	const amount = Math.floor(inputLoanAmount.value);
	const interestAmtCheck = currentAccount.movements.some((mov) => {
		return mov >= amount * 0.1;
	});

	if (amount > 0 && interestAmtCheck) {
		setTimeout(function (){
			// Add Movement
			currentAccount.movements.push(amount);

			// Add loan date
			currentAccount.movementsDates.push(new Date().toISOString());

			// Update UI
			updateUI(currentAccount);

			// Reset Timer
			clearInterval(timer);
			timer = startLogOutTimer();
		}, 3000);
	}

	// Clear the input field
	inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
	e.preventDefault();
	// Check if the user name and pin is correct
	if (
		inputCloseUsername.value === currentAccount.username &&
		+inputClosePin.value &&
		currentAccount.pin
	) {
		const index = accounts.findIndex(
			(acc) => acc.username === inputCloseUsername.value
		);
		// Delete Account
		accounts.splice(index, 1);

		// Hide the User Interface
		containerApp.style.opacity = 0;
	}

	// Clear the fields
	inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
	e.preventDefault();
	displayMovements(currentAccount.movements, !sorted);
	sorted = !sorted;
});
