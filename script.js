const display = document.getElementById('display-value');
const overlay = document.getElementById('overlay-value');
const paywall = document.getElementById('paywall');
const paymentGateway = document.getElementById('payment-gateway');
const paywallClose = document.getElementById('paywall-close');
const gatewayClose = document.getElementById('gateway-close');
const maybeLater = document.getElementById('maybe-later');
const paywallTimer = document.getElementById('paywall-timer');
const paywallExpr = document.getElementById('paywall-expr');
const paywallReason = document.getElementById('paywall-reason');
const gatewayAmount = document.getElementById('gateway-amount');
const keys = document.querySelectorAll('.key');

let audioCtx = null;
let soundEnabled = false;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function unlockAudio() {
  if (soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  soundEnabled = true;
}

function playTone(freq, duration, type = 'sine', volume = 0.3, startTime = 0) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime + startTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function playNoise(duration, volume = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + duration);
}

function sfxPaywallTrigger() {
  unlockAudio();
  playTone(880, 0.08, 'square', 0.18, 0);
  playTone(1320, 0.08, 'square', 0.18, 0.08);
  playTone(1760, 0.12, 'square', 0.18, 0.16);
  playTone(2200, 0.15, 'sawtooth', 0.12, 0.24);
}

function sfxCashRegister() {
  unlockAudio();
  playTone(1800, 0.04, 'square', 0.2, 0);
  playTone(2400, 0.04, 'square', 0.2, 0.05);
  playTone(1800, 0.04, 'square', 0.2, 0.10);
  playTone(2400, 0.04, 'square', 0.2, 0.15);
  playTone(800, 0.08, 'triangle', 0.18, 0.20);
  playTone(1200, 0.15, 'triangle', 0.15, 0.28);
}

function sfxSadTrombone() {
  unlockAudio();
  const notes = [
    { f: 392, d: 0.18 },
    { f: 392, d: 0.18 },
    { f: 466, d: 0.18 },
    { f: 349, d: 0.55 }
  ];
  let t = 0;
  notes.forEach(n => {
    playTone(n.f, n.d, 'sawtooth', 0.22, t);
    t += n.d * 0.92;
  });
}

function sfxFailure() {
  unlockAudio();
  sfxSadTrombone();
  playNoise(0.4, 0.08);
  playTone(180, 0.5, 'square', 0.18, 0.3);
}

function sfxKeyClick() {
  unlockAudio();
  playTone(600 + Math.random() * 200, 0.04, 'square', 0.08);
}

function sfxClose() {
  unlockAudio();
  playTone(600, 0.06, 'sine', 0.15);
  playTone(400, 0.08, 'sine', 0.12, 0.06);
}

function sfxMaybeLater() {
  unlockAudio();
  playTone(880, 0.06, 'sine', 0.15);
  playTone(660, 0.06, 'sine', 0.15, 0.07);
  playTone(440, 0.1, 'sine', 0.12, 0.14);
}

let currentValue = '0';
let previousValue = null;
let operator = null;
let waitingForSecondOperand = false;
let lastResult = null;
let countdownId = null;
let countdownRemaining = 30;
let lastOperator = null;
let expression = '';

const BASIC_OPS = ['+', '−'];
const ADVANCED_OPS = ['×', '÷', '%'];

function inputDigit(digit) {
  if (waitingForSecondOperand) {
    currentValue = digit;
    waitingForSecondOperand = false;
  } else {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }
  updateExpression();
  updateDisplay();
}

function inputDecimal() {
  if (waitingForSecondOperand) {
    currentValue = '0.';
    waitingForSecondOperand = false;
    updateExpression();
    updateDisplay();
    return;
  }
  if (!currentValue.includes('.')) {
    currentValue = currentValue + '.';
    updateExpression();
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
  lastOperator = nextOperator;
  updateExpression();
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
  lastOperator = null;
  
  updateExpression();
  updateDisplay();
  showPaywall();
}

function updateExpression() {
  let expr = '';
  if (previousValue !== null) {
    expr = formatNumber(previousValue);
    if (lastOperator) {
      expr += ' ' + lastOperator + ' ';
      if (waitingForSecondOperand) {
        expr += currentValue;
      } else {
        expr += formatNumber(parseFloat(currentValue));
      }
    }
  } else {
    expr = currentValue;
  }
  expression = expr;
  if (paywallExpr) paywallExpr.textContent = expr;
}

function getOperationTier(op) {
  if (ADVANCED_OPS.includes(op)) return 'advanced';
  if (BASIC_OPS.includes(op)) return 'basic';
  return 'basic';
}

function updatePaywallTier(op) {
  const tiers = document.querySelectorAll('.tier');
  const reasonEl = document.getElementById('paywall-reason');
  tiers.forEach(tier => {
    tier.classList.remove('recommended');
    tier.querySelector('.tier-select').textContent = 'SELECT ' + tier.dataset.tier.toUpperCase();
  });

  if (ADVANCED_OPS.includes(op)) {
    const advancedTier = document.querySelector('.tier[data-tier="advanced"]');
    advancedTier.classList.add('recommended');
    advancedTier.querySelector('.tier-select').textContent = 'SELECT ADVANCED';
    reasonEl.textContent = 'Multiplication requires the Advanced STEM Pass. Upgrade to unlock all STEM features.';
  } else {
    const basicTier = document.querySelector('.tier[data-tier="basic"]');
    basicTier.classList.add('recommended');
    basicTier.querySelector('.tier-select').textContent = 'SELECT BASIC';
    reasonEl.textContent = 'Basic arithmetic requires a Basic Mathematics subscription.';
  }
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
  lastOperator = null;
  expression = '';
  updateDisplay();
  overlay.textContent = '';
}

function toggleSign() {
  currentValue = String(-parseFloat(currentValue));
  updateExpression();
  updateDisplay();
}

function handleBackspace() {
  if (currentValue.length > 1) {
    currentValue = currentValue.slice(0, -1);
  } else {
    currentValue = '0';
  }
  updateExpression();
  updateDisplay();
}

function showPaywall() {
  const tier = getOperationTier(lastOperator);
  updatePaywallTier(lastOperator);
  paywall.classList.add('show');
  sfxPaywallTrigger();
  startCountdown();
}

function hidePaywall() {
  if (!paywall.classList.contains('show')) return;
  paywall.classList.remove('show');
  sfxClose();
  stopCountdown();
}

function showPaymentGateway(tier) {
  const amount = tier === 'advanced' ? '$24.99/mo' : '$9.99/mo';
  gatewayAmount.textContent = amount;
  hidePaywall();
  setTimeout(() => {
    paymentGateway.classList.add('show');
    sfxCashRegister();
  }, 180);
}

function hidePaymentGateway() {
  paymentGateway.classList.remove('show');
  sfxClose();
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
  sfxFailure();
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
    sfxKeyClick();
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
  sfxMaybeLater();
  hidePaywall();
});

// Tier selection
document.querySelectorAll('.tier-select').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const tier = btn.dataset.tier;
    showPaymentGateway(tier);
  });
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