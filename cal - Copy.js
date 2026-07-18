// Simple calculator logic
const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.getElementById('buttons');

let expr = ''; // expression shown/kept as string

function updateDisplays(){
  expressionEl.textContent = expr === '' ? '0' : expr;
  // result is tentative/evaluated value
  try {
    const safe = toEval(expr);
    const val = safe === '' ? '' : eval(safe);
    resultEl.textContent = (val === '' || val === undefined) ? '0' : String(val);
  } catch {
    resultEl.textContent = 'Error';
  }
}

function toEval(s){
  // Convert calculator symbols to JS operators and sanitize input
  let out = s.replace(/×/g, '*').replace(/÷/g, '/');
  // Allow only digits, operators, parentheses and decimal point
  out = out.replace(/[^0-9+\-*/().%]/g,'');
  return out;
}

function isOperator(ch){
  return ['+', '-', '×', '÷', '*', '/'].includes(ch);
}

function appendValue(val){
  const last = expr.slice(-1);
  if (val === '.'){
    // prevent multiple dots in the current number
    const tokens = expr.split(/[\+\-×÷\*\/]/);
    const current = tokens[tokens.length - 1];
    if (current.includes('.')) return;
    if (current === '') {
      expr += '0.';
    } else {
      expr += '.';
    }
  } else if (isOperator(val)){
    if (expr === '' && val !== '-') return; // allow negative start
    if (isOperator(last)) {
      // replace last operator with new one
      expr = expr.slice(0, -1) + val;
    } else {
      expr += val;
    }
  } else {
    // digit
    if (expr === '0') expr = val;
    else expr += val;
  }
  updateDisplays();
}

function clearAll(){
  expr = '';
  updateDisplays();
}

function deleteLast(){
  if (expr.length > 0) expr = expr.slice(0, -1);
  updateDisplays();
}

function calculate(){
  if (expr === '') return;
  try {
    // handle percent operator: convert occurrences like "50%" => "(50/100)"
    let fixed = expr.replace(/([0-9.]+)%/g, '($1/100)');
    fixed = fixed.replace(/×/g,'*').replace(/÷/g,'/');
    // sanitize
    fixed = fixed.replace(/[^0-9+\-*/().]/g,'');
    const value = eval(fixed);
    expr = String(value);
    updateDisplays();
  } catch (e){
    resultEl.textContent = 'Error';
  }
}

function percentCurrent(){
  // convert last number to percent
  const match = expr.match(/([0-9.]+)$/);
  if (!match) return;
  const num = parseFloat(match[1]);
  const percentVal = num / 100;
  expr = expr.slice(0, match.index) + String(percentVal);
  updateDisplays();
}

buttons.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const val = btn.getAttribute('data-value');
  const action = btn.getAttribute('data-action');
  if (val) {
    appendValue(val);
    return;
  }
  if (action === 'clear') clearAll();
  else if (action === 'delete') deleteLast();
  else if (action === 'calculate') calculate();
  else if (action === 'percent') percentCurrent();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if ((e.key >= '0' && e.key <= '9') || ['+','-','*','/','.','(',')'].includes(e.key)){
    // map * and / to native symbols used in UI are okay
    const map = {'*':'×','/':'÷'};
    appendValue(map[e.key] || e.key);
    e.preventDefault();
  } else if (e.key === 'Enter' || e.key === '='){
    calculate();
    e.preventDefault();
  } else if (e.key === 'Backspace'){
    deleteLast();
    e.preventDefault();
  } else if (e.key === 'Escape'){
    clearAll();
  } else if (e.key === '%'){
    percentCurrent();
    e.preventDefault();
  }
});

// initialize
clearAll();