const display = document.getElementById('display-value');
const overlay = document.getElementById('overlay-value');
const paywall = document.getElementById('paywall');
const paymentGateway = document.getElementById('payment-gateway');
const paywallClose = document.getElementById('paywall-close');
const gatewayClose = document.getElementById('gateway-close');
const maybeLater = document.getElementById('maybe-later');
const paywallSubscribe = document.getElementById('paywall-subscribe');
const paywallTimer = document.getElementById('paywall-timer');
const keys = document.querySelectorAll('.key');

let currentValue = '0';
let previousValue = null;
let operator = null;
let waitingForSecondOperand = false;
let lastResult = null;
let countdownId = null;
let countdownRemaining = 30;

function inputDigit(digit) {
  if (waitingForSecondOperand) {
    currentValue = digit;
    waitingForSecondOperand = false;
  } else {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (waitingForSecondOperand) {
    currentValue = '0.';
    waitingForSecondOperand = false;
    updateDisplay();
    return;
  }
  if (!currentValue.includes('.')) {
    currentValue = currentValue + '.';
    updateDisplay();
  }
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(currentValue);

  if (operator && !waitingForSecondOperand) {
    const result = calculate(parseFloat(previousValue), inputValue, operator);
    currentValue = String(result);
    previousValue = result;
  } else {
    previousValue = inputValue;
  }

  operator = nextOperator;
  waitingForSecondOperand = true;
  updateDisplay();
}

function calculate(firstOperand, secondOperand, op) {
  switch (op) {
    case '+': return firstOperand + secondOperand;
    case '−': return firstOperand - secondOperand;
    case '×': return firstOperand * secondOperand;
    case '÷': return secondOperand !== 0 ? firstOperand / secondOperand : 'Error';
    case '%': return firstOperand % secondOperand;
    default: return secondOperand;
  }
}

function performEquals() {
  if (operator === null) return;

  let result;
  const inputValue = parseFloat(currentValue);

  result = calculate(parseFloat(previousValue), inputValue, operator);
  
  lastResult = result;
  currentValue = String(result);
  operator = null;
  previousValue = null;
  waitingForSecondOperand = false;
  
  updateDisplay();
  showPaywall();
}

function updateDisplay() {
  display.textContent = currentValue;
  
  if (operator && previousValue !== null) {
    const opSymbol = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
    overlay.textContent = `${formatNumber(previousValue)} ${opSymbol}`;
  } else {
    overlay.textContent = '';
  }
}

function formatNumber(num) {
  if (typeof num === 'string') return num;
  if (!isFinite(num)) return 'Error';
  if (Number.isInteger(num)) return num.toString();
  return parseFloat(num.toPrecision(12)).toString();
}

function clearAll() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  waitingForSecondOperand = false;
  updateDisplay();
  overlay.textContent = '';
}

function toggleSign() {
  currentValue = String(-parseFloat(currentValue));
  updateDisplay();
}

function handleBackspace() {
  if (currentValue.length > 1) {
    currentValue = currentValue.slice(0, -1);
  } else {
    currentValue = '0';
  }
  updateDisplay();
}

function showPaywall() {
  paywall.classList.add('show');
  startCountdown();
}

function hidePaywall() {
  paywall.classList.remove('show');
  stopCountdown();
}

function showPaymentGateway() {
  hidePaywall();
  paymentGateway.classList.add('show');
}

function hidePaymentGateway() {
  paymentGateway.classList.remove('show');
  showPaywall();
}

function showPaymentFailure() {
  const paymentCard = document.querySelector('.payment-card');
  let failureOverlay = paymentCard.querySelector('.payment-failure');
  
  if (!failureOverlay) {
    failureOverlay = document.createElement('div');
    failureOverlay.className = 'payment-failure';
    failureOverlay.innerHTML = `
      <div class="failure-icon">💸</div>
      <div class="failure-title">Payment Failed</div>
      <div class="failure-message">Bro is broke. Transaction declined due to insufficient funds.</div>
      <button class="failure-btn" id="failure-close">Try Again</button>
    `;
    paymentCard.appendChild(failureOverlay);
    
    document.getElementById('failure-close').addEventListener('click', () => {
      failureOverlay.classList.remove('show');
    });
  }
  
  failureOverlay.classList.add('show');
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

// Key event listeners
keys.forEach(key => {
  key.addEventListener('click', () => {
    const action = key.dataset.action;
    const value = key.dataset.value;

    if (value !== undefined) {
      if (/[0-9]/.test(value)) {
        inputDigit(value);
      } else if (value === '.') {
        inputDecimal();
      } else if (['+', '−', '×', '÷', '%'].includes(value)) {
        handleOperator(value);
      }
    } else if (action === 'clear') {
      clearAll();
    } else if (action === 'negate') {
      toggleSign();
    } else if (action === 'backspace') {
      handleBackspace();
    } else if (action === 'equals') {
      performEquals();
    }
  });
});

// Paywall event listeners
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
  showPaymentGateway();
});

gatewayClose.addEventListener('click', (e) => {
  e.stopPropagation();
  hidePaymentGateway();
});

// Payment method switching
document.querySelectorAll('.payment-method').forEach(method => {
  method.addEventListener('click', () => {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    method.classList.add('active');
    
    const selectedMethod = method.dataset.method;
    document.getElementById('upi-section').style.display = selectedMethod === 'upi' ? 'block' : 'none';
    document.getElementById('card-section').style.display = selectedMethod === 'card' ? 'block' : 'none';
    document.getElementById('wallets-section').style.display = selectedMethod === 'wallets' ? 'block' : 'none';
  });
});

// UPI pay buttons
document.getElementById('upi-pay').addEventListener('click', () => {
  const upiId = document.getElementById('upi-id').value;
  if (upiId) {
    showPaymentFailure();
  }
});

// UPI app buttons
document.querySelectorAll('.upi-app').forEach(app => {
  app.addEventListener('click', () => {
    showPaymentFailure();
  });
});

// Card pay button
document.getElementById('card-pay').addEventListener('click', () => {
  const cardNumber = document.getElementById('card-number').value;
  if (cardNumber.length >= 13) {
    showPaymentFailure();
  }
});

// Wallet buttons
document.querySelectorAll('.wallet-option').forEach(wallet => {
  wallet.addEventListener('click', () => {
    showPaymentFailure();
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (paywall.classList.contains('show') || paymentGateway.classList.contains('show')) {
    if (e.key === 'Escape') {
      if (paymentGateway.classList.contains('show')) {
        hidePaymentGateway();
      } else {
        hidePaywall();
      }
    }
    return;
  }

  if (e.key >= '0' && e.key <= '9') {
    inputDigit(e.key);
  } else if (e.key === '.') {
    inputDecimal();
  } else if (e.key === '+' || e.key === '-') {
    handleOperator(e.key);
  } else if (e.key === '*') {
    handleOperator('×');
  } else if (e.key === '/') {
    e.preventDefault();
    handleOperator('÷');
  } else if (e.key === '%') {
    handleOperator('%');
  } else if (e.key === 'Enter' || e.key === '=') {
    performEquals();
  } else if (e.key === 'Backspace') {
    handleBackspace();
  } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
    clearAll();
  }
});

// Card number formatting
document.getElementById('card-number').addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  value = value.replace(/(.{4})/g, '$1 ').trim();
  e.target.value = value;
});