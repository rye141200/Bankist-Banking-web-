'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
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

/* HELPER METHODS */
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.floor(threshold / 60)).padStart(2, '0');
    labelTimer.textContent = `${min}:${String(threshold % 60).padStart(
      2,
      '0'
    )}`;
    if (threshold <= 30) labelTimer.style.color = 'red';

    if (threshold === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    threshold -= 1;
  };

  let threshold = 5*60;
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

const calcDaysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
const formatMovementDate = function (date, locale) {
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  else if (daysPassed === 1) return `Yesterday`;
  else if (daysPassed <= 7) return `${daysPassed} days ago`;
  else return new Intl.DateTimeFormat(locale).format(date);
};

/*
  //* Display movements 
*/
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov < 0 ? 'withdrawal' : 'deposit';

    const movementDate = new Date(account.movementsDates[i]);

    const formattedMov = formatCur(mov, account.locale, account.currency);

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${
      i + 1
    }  ${type.toUpperCase()}</div>
    <div class="movements__date">${formatMovementDate(
      movementDate,
      account.locale
    )}</div>
    <div class="movements__value">${formattedMov}</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
//displayMovements(account1.movements);

/* Computing usernames */
const createUsernames = function (accounts) {
  accounts.forEach(
    account =>
      (account.username = account.owner
        .toLowerCase()
        .split(' ')
        .map(namePart => namePart[0])
        .join(''))
  );
};
createUsernames(accounts);
//console.log(accounts);

/* Computing the balance */

const calcDisplayBalance = function (account) {
  const balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  account.balance = balance;

  labelBalance.textContent = formatCur(
    account.balance,
    account.locale,
    account.currency
  );
};
//calcDisplayBalance(account1.movements);

const calcBalance = function (movements) {
  const balance = movements.reduce((acc, mov) => acc + mov, 0);
  return balance;
};
const createBalance = function (accounts) {
  accounts.forEach(account => {
    account.balance = calcBalance(account.movements);
  });
};
createBalance(accounts);

/* Calculate analytics  */
const getTotalIncome = function (movements) {
  const totalIncome = movements
    .filter(movement => movement > 0)
    .reduce((acc, cur) => acc + cur, 0);

  //labelSumIn.textContent = `${totalIncome}`; add this later
  return totalIncome.toFixed(2);
};
const getTotalOutcome = function (movements) {
  const totalOutcome = movements
    .filter(movement => movement < 0)
    .reduce((acc, cur) => acc + cur, 0);
  //labelSumOut.textContent = `${Math.abs(totalOutcome)}`; add this later
  return totalOutcome.toFixed();
};
const getInterest = function (movements, interestRate) {
  const interest = movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * interestRate) / 100)
    .filter(interest => interest > 1)
    .reduce((acc, cur) => acc + cur, 0);
  //labelSumInterest.textContent = `${interest}€` add this later
  return interest;
};
const calcDisplayAll = function (accounts) {
  accounts.forEach(function (account) {
    account.totalIncome = getTotalIncome(account.movements);
    account.totalOutcome = getTotalOutcome(account.movements);
    account.totalInterest = getInterest(
      account.movements,
      account.interestRate
    );
  });
};

//calcDisplayAll(accounts);
//console.log(accounts);

const calcDisplaySummary = function (movements, account) {
  const totalIncome = movements
    .filter(movement => movement > 0)
    .reduce((acc, cur) => acc + cur, 0);
  //console.log(totalIncome);
  labelSumIn.textContent = formatCur(
    totalIncome,
    account.locale,
    account.currency
  );

  const totalOutcome = movements
    .filter(movement => movement < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = formatCur(
    totalOutcome,
    account.locale,
    account.currency
  );
  //console.log(totalOutcome);

  const interest = movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(interest => interest > 1)
    .reduce((acc, cur) => acc + cur, 0);
  //console.log(interest);
  labelSumInterest.textContent = formatCur(
    interest,
    account.locale,
    account.currency
  );
};

const updateUI = function (currentAccount) {
  //DISPLAY MOVEMENTS
  displayMovements(currentAccount);

  //DISPLAY BALANCE
  calcDisplayBalance(currentAccount);

  //DISPLAY SUMMARY
  calcDisplaySummary(currentAccount.movements, currentAccount);
};

//* Fake login
//! Remove this later!!!
/*
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;
*/

const overAllBalance = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, cur) => acc + cur, 0);

//* Event handlers
/* 
//*Login functionality 
*/
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value.trim()
  );

  //Login
  if (currentAccount?.pin === Number(inputLoginPin.value.trim())) {
    //DISPLAY UI AND WELCOME USER
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;

    //Create current date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();

    if (timer) clearInterval(timer);

    timer = startLogOutTimer();
    updateUI(currentAccount);

    //Calculate balance for all
    //createBalance(accounts);
  } else {
    alert('User not found!!');
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();
  }
});
/* 
  //* Transfer functionality 
*/
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  //If account doesn't event exist
  if (receiverAcc == null) {
    alert('Invalid user');
    return;
  }

  //Reset input fields
  inputTransferTo.blur();
  inputTransferAmount.blur();
  inputTransferTo.value = inputTransferAmount.value = '';

  //Create transaction if possible
  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    currentAccount != receiverAcc
  ) {
    //transaction
    currentAccount.balance -= amount;
    receiverAcc.balance += amount;
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-1 * amount);

    //Add transaction date
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    updateUI(currentAccount);

    //reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

/* 
  //*Closing an account 
*/
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    //delete the account
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    console.log(index);
    accounts.splice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});

/* 
  //*Loan functionality 
*/
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loan = Math.floor(inputLoanAmount.value);
  if (loan > 0 && currentAccount.movements.some(mov => mov >= 0.1 * loan)) {
    setTimeout(function () {
      currentAccount.movements.push(loan);
      currentAccount.movementsDates.push(new Date());
      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }

  inputLoanAmount.value = '';
});

/* Sorting transactions (movements) */
let sortedState = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sortedState);
  sortedState = !sortedState;
});
