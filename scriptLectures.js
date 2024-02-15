'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

/* Login functionality */
//Event handlers

let currentAccount;
const overAllBalance = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, cur) => acc + cur, 0);

const updateUI = function (currentAccount) {
  //DISPLAY MOVEMENTS
  displayMovements(currentAccount.movements);

  //DISPLAY BALANCE
  calcDisplayBalance(currentAccount);

  //DISPLAY SUMMARY
  calcDisplaySummary(currentAccount.movements, currentAccount);
};

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

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();

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
/* Transfer functionality */
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
    updateUI(currentAccount);
  }
});

/* Closing an account */
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

/* Loan functionality */
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loan = Number(inputLoanAmount.value);
  if (loan > 0 && currentAccount.movements.some(mov => mov >= 0.1 * loan)) {
    currentAccount.movements.push(loan);

    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

/* Sorting transactions (movements) */
let sortedState = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sortedState);
  sortedState = !sortedState;
});

/* HELPER METHODS */
/* Display movements */
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov < 0 ? 'withdrawal' : 'deposit';
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${
      i + 1
    }  ${type.toUpperCase()}</div>
    <div class="movements__value">${mov}€</div>
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
  labelBalance.textContent = `${balance} €`;
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
  return totalIncome;
};
const getTotalOutcome = function (movements) {
  const totalOutcome = movements
    .filter(movement => movement < 0)
    .reduce((acc, cur) => acc + cur, 0);
  //labelSumOut.textContent = `${Math.abs(totalOutcome)}`; add this later
  return totalOutcome;
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
  labelSumIn.textContent = `${totalIncome}€`;

  const totalOutcome = movements
    .filter(movement => movement < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = `${Math.abs(totalOutcome)}€`;
  //console.log(totalOutcome);

  const interest = movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(interest => interest > 1)
    .reduce((acc, cur) => acc + cur, 0);
  //console.log(interest);
  labelSumInterest.textContent = `${interest}€`;
};

//calcDisplaySummary(account1.movements);
//console.log(accounts);
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/* Exercises */
/*
//1)
const bankDepositSum = accounts
  .map(acc => acc.movements.filter(mov => mov > 0))
  .flat()
  .reduce((acc, cur) => acc + cur, 0);
console.log(bankDepositSum);

//2)
let numDeposits1000;

numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov >= 1000).length;
console.log(numDeposits1000);

//3
const sumsObject = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(sumsObject);

//4
const convertTitleCase = function (title) {
  const exceptions = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with', 'of'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!exceptions.includes(word))
        return word[0].toUpperCase() + word.slice(1);
      else return word;
    });
  return titleCase.join(' ');
};

console.log(convertTitleCase('this is a nice title'));
*/
/* Calculating the global balance */
const balance = movements.reduce(function (acc, cur) {
  return acc + cur;
}, 0);
//console.log(balance);

/* Maximum using reduce */
const max = movements.reduce(
  (acc, mov) => (acc < mov ? mov : acc),
  movements[0]
);

/* Array filling methods */
//console.log(Array.from({length:100}, ()=>Math.trunc(Math.random()*6)+1));

/* Sorting in JS */
/*
const owners = ['jonas', 'Adam', 'martha', 'zach'];
console.log(owners.map(owner => owner).sort());
console.log(owners);

console.log(movements.sort((a, b) => a - b));
*/
//console.log(max);

/* flat and flatMap */

/*  
const arr = [[1,2,3],[4,5,6],7,8];
console.log(arr.flat());
*/
/* Getting the deposits */
/*
const getDeposits = movements.filter(movement => movement>0);
console.log(getDeposits);

const getWithdrawals = movements.filter(movement=> movement<0);
console.log(getWithdrawals);
*/
/*
const movementsUSD = movements.map((mov) => Math.trunc(mov *1.1));
console.log(movementsUSD);*/
/////////////////////////////////////////////////
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/*
const checkDogs = function(dogsJulia,dogsKate){
  //Shallow copy
  const juliaCorrectDogs = dogsJulia.slice(1,-2);
  const dogsArr = [...juliaCorrectDogs,...dogsKate];
  dogsArr.forEach(function(dog,index){
    if(dog >=3)
      console.log(`Dog number ${index} is an adult, and is ${dog} years old`);
    else
      console.log(`Dog number ${index} is a puppy, and is ${dog} years old`);

  });
};
checkDogs([3, 5, 2, 12, 7],[4, 1, 15, 8, 3]);
*/

// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/*
const calcAverageHumanAge = function (ages) {
  //1) Calculating the ages
  const averageHumanAges = ages.map(age => (age <= 2 ? 2 * age : age * 4 + 16));
  console.log(averageHumanAges);

  //2) Excluding ages
  const excludedAges = averageHumanAges.filter(humanAge => humanAge >= 18);
  console.log(excludedAges);

  //3) Calculating average
  const average = excludedAges.reduce((acc,cur) => acc + cur,0) / excludedAges.length;
  console.log(average);

};
calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

*/

// Coding Challenge #3

/* 
Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/*
const calcAverageHumanAge = ages =>
  ages
    .map(age => (age <= 2 ? age * 2 : age * 4 + 16))
    .filter(humanAge => humanAge >= 18)
    .reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
*/

// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK 😀
*/
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

//1) recommended food portion
const calcRecommendedPortion = function (dogs) {
  dogs.forEach(
    dog => (dog.recommendedPortion = Math.trunc(dog.weight ** 0.75 * 28))
  );
};
calcRecommendedPortion(dogs);
console.log(dogs);

//2) Getting Sarah's dog
const checkSarahsDog = function (dogs) {
  const sarahDog = dogs.find(dog => dog.owners.includes('Sarah'));
  console.log(
    `Sarah's dog ${
      sarahDog.curFood > sarahDog.recommendedPortion ? `is` : `isn't`
    } eating too much!`
  );
};
checkSarahsDog(dogs);

//3) Too much and too little!
const filterByEat = function (dogs) {
  const ownersEatTooMuch = dogs
    .filter(dog => dog.curFood > dog.recommendedPortion)
    .flatMap(dog => dog.owners);
  console.log(ownersEatTooMuch);
  const ownersEatTooLittle = dogs
    .filter(dog => dog.curFood < dog.recommendedPortion)
    .flatMap(dog => dog.owners);
  console.log(ownersEatTooLittle);
  return [ownersEatTooMuch, ownersEatTooLittle];
};
const [ownersEatTooMuch, ownersEatTooLittle] = filterByEat(dogs);
//4) printing
const printDogFormat = function (ownersArray, eatsTooMuch) {
  let printedString = ownersArray.map((owner, index) => {
    if (index == ownersArray.length - 1) return owner + `'s`;
    return owner;
  });
  printedString = printedString.join(' and ');
  if (eatsTooMuch) console.log(printedString + ` eats too much!`);
  else console.log(printedString + ` eats too little`);
};
printDogFormat(ownersEatTooMuch, true);
printDogFormat(ownersEatTooLittle, false);

//5) using some
console.log(dogs.some(dog => dog.curFood === dog.recommendedPortion));

//6)
const okayPortion = dog =>
  dog.curFood > dog.recommendedPortion * 0.9 &&
  dog.curFood < dog.recommendedPortion;
console.log(dogs.some(okayPortion));

//7)
const okayPortionDogs = dogs.filter(okayPortion);
console.log(okayPortionDogs);

//8)
const shallowCopy = dogs.slice().sort((a, b) => a.recommendedPortion - b.recommendedPortion);
console.log(shallowCopy);
console.log(dogs);
