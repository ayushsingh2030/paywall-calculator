const display = document.getElementById('display-value');
const overlay = document.getElementById('overlay-value');
const paywall = document.getElementById('paywall');
const paywallClose = document.querySelector('.paywall-close');
const maybeLater = document.getElementById('maybe-later');
const paywallSubscribe = document.getElementById('paywall-subscribe');
const paywallTimer = document.getElementById('paywall-timer');
const paywallSpinner = document.getElementById('paywall-spinner');
const keys = document.querySelectorAll('.key');

let firstOperand = null;
let operator = null;
let secondOperand = null;
let shouldResetDisplay = false;
let lastResult = null;
let countdownId = null;
let countdownRemaining = 30;

function appendToDisplay(value) {
  const current = display.textContent;

  if (shouldResetDisplay) {
    display.textContent = '0';
    overlay.textContent = '0';
    shouldResetDisplay = false;
  }

  if (value === '.' && current.endsWith('.')) {
    return;
  }

  if (current === '0' && value !== '.') {
    display.textContent = value;
  } else {
    display.textContent = current + value;
  }
}

function appendOverlay(value) {
  if (overlay.textContent === '0' && value !== '.') {
    overlay.textContent = value;
  } else {
    overlay.textContent = overlay.textContent + value;
  }
}

function chooseOperator(nextOperator) {
  const inputVal = parseFloat(overlay.textContent || display.textContent);

  if (firstOperand === null && !operator) {
    firstOperand = inputVal;
    overlay.textContent = '0';
    operator = nextOperator;
  } else if (operator && secondOperand === null) {
    secondOperand = inputVal;
    operate();
    operator = nextOperator;
    overlay.textContent = '0';
    firstOperand = parseFloat(display.textContent);
  }
  updateDisplay();
}

function operate() {
  const prev = firstOperand || 0;
  const next = secondOperand || 0;

  switch (operator) {
    case '+':
      firstOperand = prev + next;
      break;
    case '−':
      firstOperand = prev - next;
      break;
    case '×':
      firstOperand = prev * next;
      break;
    case '÷':
      firstOperand = next !== 0 ? prev / next : 'Error';
      break;
    case '%':
      firstOperand = prev % next;
      break;
    default:
      firstOperand = next;
  }
}

function updateDisplay() {
  if (secondOperand !== null && operator) {
    overlay.textContent = '0';
    operator = null;
    secondOperand = null;
  } else {
    overlay.textContent = '0';
  }
}

function showPaywall() {
  paywall.classList.add('show');
  startCountdown();
}

function hidePaywall() {
  paywall.classList.remove('show');
  stopCountdown();
  clearSpinner();
  displayResult(lastResult);
}

function startCountdown() {
  countdownRemaining = 30;
  updateTimer();
  countdownId = setInterval(() => {
    countdownRemaining--;
    updateTimer();
    if (countdownRemaining <= 0) {
      stopCountdown();
      hidePaywall();
    }
  }, 1000);
}

function stopCountdown() {
  if (countdownId) {
    clearInterval(countdownId);
    countdownId = null;
  }
}

function updateTimer() {
  const minutes = String(Math.floor(countdownRemaining / 60)).padStart(2, '0');
  const seconds = String(countdownRemaining % 60).padStart(2, '0');
  paywallTimer.textContent = `${minutes}:${seconds}`;
}

function showSpinner() {
  paywallSpinner.style.display = 'inline-block';
}

function clearSpinner() {
  paywallSpinner.style.display = 'none';
}

function displayResult(result) {
  const num = typeof result === 'number' ? result : 0;
  display.textContent = num.toLocaleString();
  overlay.textContent = num.toLocaleString();
  lastResult = num;
}

function processSubscription() {
  showSpinner();
  display.textContent = 'Payment Failed: Bro is broke';
  overlay.textContent = 'Transaction Declined';

  setTimeout(() => {
    displayResult(0);
    hidePaywall();
  }, 2500);
}

keys.forEach(key => {
  key.addEventListener('click', () => {
    const value = key.textContent;

    if (/[0-9.]/.test(value)) {
      appendToDisplay(value);
      appendOverlay(value);
    } else if (/[+\-×÷%]/.test(value)) {
      chooseOperator(value);
    } else if (value === 'AC') {
      display.textContent = '0';
      overlay.textContent = '0';
      firstOperand = null;
      operator = null;
      secondOperand = null;
      shouldResetDisplay = false;
    } else if (value === '→') {
      const inputVal = parseFloat(overlay.textContent || display.textContent);
      if (isNaN(inputVal)) return;
      firstOperand = firstOperand !== null ? firstOperand : inputVal;
      operator = null;
      secondOperand = inputVal;
      operate();
      overlay.textContent = '0';
    } else if (value === '=') {
      if (operator && secondOperand === null) {
        secondOperand = parseFloat(overlay.textContent || display.textContent);
      }
      if (operator && !isNaN(firstOperand) && !isNaN(secondOperand)) {
        operate();
        lastResult = firstOperand;
        showPaywall();
      }
    }
  });
});

paywallClose.addEventListener('click', (e) => {
  e.stopPropagation();
  hidePaywall();
});

maybeLater.addEventListener('click', (e) => {
  e.stopPropagation();
  hidePaywall();
});

paywallSubscribe.addEventListener('click', (e) => {
  e.stopPropagation();
  processSubscription();
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    appendToDisplay(e.key);
    appendOverlay(e.key);
  } else if (e.key === '.') {
    appendToDisplay('.');
    appendOverlay('.');
  } else if (e.key === '+' || e.key === '-') {
    chooseOperator(e.key);
  } else if (e.key === '*') {
    chooseOperator('×');
  } else if (e.key === '/') {
    chooseOperator('÷');
  } else if (e.key === '%') {
    chooseOperator('%');
  } else if (e.key === 'Enter' || e.key === '=') {
    if (operator && secondOperand === null) {
      secondOperand = parseFloat(overlay.textContent || display.textContent);
    }
    if (operator && !isNaN(firstOperand) && !isNaN(secondOperand)) {
      operate();
      lastResult = firstOperand;
      showPaywall();
    }
  } else if (e.key === 'Escape') {
    hidePaywall();
  }
});