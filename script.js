/* ============================================================
   CALCULATOR – script.js
   Beginner-friendly: no eval(), manual operation handling,
   keyboard support, division-by-zero guard.
   ============================================================ */

// ── 1. Grab DOM elements ──────────────────────────────────────
const resultEl    = document.getElementById('result');      // big number display
const expressionEl = document.getElementById('expression'); // small top display
const buttons     = document.querySelectorAll('.btn');      // all buttons

// ── 2. State variables ────────────────────────────────────────
let firstNumber  = '';   // the first operand (e.g. "12")
let secondNumber = '';   // the second operand (e.g. "5")
let operator     = '';   // the chosen operator: +  -  *  /
let resultShown  = false; // did we just press "=" ?

// ── 3. Helper: update the big display ─────────────────────────
function updateDisplay(value) {
  resultEl.textContent = value;

  // Adjust font size based on length so the number fits
  resultEl.classList.remove('small', 'xsmall', 'error');
  if (String(value).length > 12) resultEl.classList.add('xsmall');
  else if (String(value).length > 9) resultEl.classList.add('small');
}

// ── 4. Helper: update the small expression line ───────────────
function updateExpression(text) {
  expressionEl.textContent = text;
}

// ── 5. Map operator symbol → readable label for display ───────
const DISPLAY_OP = { '+': '+', '-': '−', '*': '×', '/': '÷' };

// ── 6. Perform the actual math – NO eval() ────────────────────
/**
 * calculate(a, op, b)
 *  a, b  – numbers (not strings)
 *  op    – '+' | '-' | '*' | '/'
 *  returns the numeric result, or throws on division by zero
 */
function calculate(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/':
      // Guard: division by zero is not allowed
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
    default:
      throw new Error('Unknown operator: ' + op);
  }
}

// ── 7. Handle a digit button press (0–9) ──────────────────────
function handleNumber(digit) {
  // If we just showed a result and user types a new digit,
  // start a fresh calculation
  if (resultShown) {
    firstNumber  = '';
    secondNumber = '';
    operator     = '';
    resultShown  = false;
  }

  if (operator === '') {
    // Still entering the FIRST number
    firstNumber += digit;
    updateDisplay(firstNumber);
    updateExpression('');
  } else {
    // Entering the SECOND number
    secondNumber += digit;
    updateDisplay(secondNumber);
    // Show full expression in the top line
    updateExpression(firstNumber + ' ' + DISPLAY_OP[operator]);
  }
}

// ── 8. Handle the decimal point ───────────────────────────────
function handleDecimal() {
  if (resultShown) {
    // Start fresh after a result
    firstNumber  = '0';
    secondNumber = '';
    operator     = '';
    resultShown  = false;
  }

  if (operator === '') {
    // Add a decimal to the first number if it doesn't already have one
    if (firstNumber.includes('.')) return;
    firstNumber = firstNumber === '' ? '0' : firstNumber;
    firstNumber += '.';
    updateDisplay(firstNumber);
  } else {
    // Add a decimal to the second number if it doesn't already have one
    if (secondNumber.includes('.')) return;
    secondNumber = secondNumber === '' ? '0' : secondNumber;
    secondNumber += '.';
    updateDisplay(secondNumber);
    updateExpression(firstNumber + ' ' + DISPLAY_OP[operator]);
  }
}

// ── 9. Handle an operator button press (+, −, ×, ÷) ──────────
function handleOperator(op) {
  // If both numbers and an operator are already set, calculate first
  // (chaining: 5 + 3 × …  →  first resolves 5+3, then uses 8 as first number)
  if (firstNumber !== '' && secondNumber !== '' && operator !== '') {
    handleEquals();            // resolve the pending operation
    operator = op;             // immediately set the new operator
    resultShown = false;       // allow chaining
    updateExpression(firstNumber + ' ' + DISPLAY_OP[operator]);
    return;
  }

  if (firstNumber === '') return; // nothing to operate on yet

  operator    = op;
  resultShown = false;
  secondNumber = '';

  // Highlight the active operator button
  highlightOperator(op);

  updateExpression(firstNumber + ' ' + DISPLAY_OP[operator]);
}

// ── 10. Handle the "=" button ─────────────────────────────────
function handleEquals() {
  // Need both numbers and an operator to proceed
  if (firstNumber === '' || operator === '' || secondNumber === '') return;

  const a = parseFloat(firstNumber);
  const b = parseFloat(secondNumber);

  try {
    const result = calculate(a, operator, b);

    // Show expression in top line: e.g. "12 + 5 ="
    updateExpression(firstNumber + ' ' + DISPLAY_OP[operator] + ' ' + secondNumber + ' =');

    // Round to avoid floating-point noise (0.1+0.2 → 0.3, not 0.30000000001)
    const rounded = parseFloat(result.toFixed(10));

    firstNumber  = String(rounded); // result becomes first number for chaining
    secondNumber = '';
    operator     = '';
    resultShown  = true;

    updateDisplay(rounded);
    clearOperatorHighlight();
  } catch (err) {
    // Display a friendly error (e.g. division by zero)
    updateDisplay(err.message);
    resultEl.classList.add('error');
    resetState();
  }
}

// ── 11. Handle "C" (clear) ────────────────────────────────────
function handleClear() {
  resetState();
  updateDisplay('0');
  updateExpression('');
  clearOperatorHighlight();
}

// ── 12. Handle "%" (percent) ──────────────────────────────────
function handlePercent() {
  if (operator === '' && firstNumber !== '') {
    // Convert first number to its percentage value
    firstNumber = String(parseFloat(firstNumber) / 100);
    updateDisplay(firstNumber);
  } else if (secondNumber !== '') {
    // Convert second number to percentage of first
    secondNumber = String(parseFloat(secondNumber) / 100);
    updateDisplay(secondNumber);
  }
}

// ── 13. Reset internal state (not display) ────────────────────
function resetState() {
  firstNumber  = '';
  secondNumber = '';
  operator     = '';
  resultShown  = false;
}

// ── 14. Operator button highlight helpers ─────────────────────
function highlightOperator(op) {
  clearOperatorHighlight();
  // Find the operator button whose data-value matches op
  const activeBtn = document.querySelector(`.btn--operator[data-value="${op}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

function clearOperatorHighlight() {
  document.querySelectorAll('.btn--operator').forEach(btn => {
    btn.classList.remove('active');
  });
}

// ── 15. Central click handler – reads data-action attribute ───
function handleButtonClick(event) {
  const btn    = event.currentTarget;
  const action = btn.dataset.action;  // "number" | "operator" | "calculate" | "clear" | "decimal" | "percent"
  const value  = btn.dataset.value;   // digit string or operator symbol

  switch (action) {
    case 'number':    handleNumber(value);   break;
    case 'operator':  handleOperator(value); break;
    case 'calculate': handleEquals();        break;
    case 'clear':     handleClear();         break;
    case 'decimal':   handleDecimal();       break;
    case 'percent':   handlePercent();       break;
  }
}

// ── 16. Attach click listeners to every button ────────────────
buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

// ── 17. Keyboard support ──────────────────────────────────────
/**
 * Map keyboard keys to the same logic used by button clicks.
 * This means the keyboard path goes through the same functions
 * as the click path – no duplicate logic.
 */
document.addEventListener('keydown', function(event) {
  const key = event.key;

  if (key >= '0' && key <= '9') {
    // Digits 0–9
    handleNumber(key);
    flashButton(`btn-${key}`);

  } else if (key === '.') {
    handleDecimal();
    flashButton('btn-dot');

  } else if (key === '+') {
    handleOperator('+');
    flashButton('btn-add');

  } else if (key === '-') {
    handleOperator('-');
    flashButton('btn-sub');

  } else if (key === '*') {
    handleOperator('*');
    flashButton('btn-mul');

  } else if (key === '/') {
    // Prevent the browser's Quick Find shortcut
    event.preventDefault();
    handleOperator('/');
    flashButton('btn-div');

  } else if (key === 'Enter' || key === '=') {
    handleEquals();
    flashButton('btn-eq');

  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    handleClear();
    flashButton('btn-clear');

  } else if (key === '%') {
    handlePercent();
    flashButton('btn-pct');
  }
});

// ── 18. Visual flash for keyboard press ──────────────────────
/**
 * Briefly applies an 'active' CSS look to the button
 * that corresponds to a keyboard key press.
 */
function flashButton(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.classList.add('key-active');
  setTimeout(() => btn.classList.remove('key-active'), 120);
}

// .key-active styles are defined in style.css
