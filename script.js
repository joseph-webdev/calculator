class Button {
    constructor(text, color = lightGray) {
        this.text = text;
        this.color = color;
        this.disabled = false;
    }
    setColor(color) {
        this.color = color;
    }
    setText(text) {
        this.text = text;
    }
    disable() {
        this.disabled = true;
        this.setColor(white);
    }
}

function findButtons(buttonNames) {
    if (typeof buttonNames === 'string') {
        buttonNames = [buttonNames];
    } 
    return buttons.filter(b => buttonNames.includes(b.text));
}

const lightGray = '#f1f3f4';
const darkGray = '#dadce0';
const white = '#ffffff';

let buttons = [
    ['', '', '', 'x!', '%', 'AC'],
    ['sin', 'ln', '7', '8', '9', '/'],
    ['cos', 'log', '4', '5', '6', '*'],
    ['tan', '√', '1', '2', '3', '-'],
    ['EXP', '^', '0', '.', '=', '+']
].flat().map(b => new Button(b));

const specialButtons = findButtons(['AC', 'sin', 'cos', 'tan', 'ln', 'log', '√', 'EXP', '^', '%', 'x!']);
specialButtons.forEach(b => b.setColor(darkGray));
findButtons('').forEach(b => b.disable());

const calculation = {
    left: '',
    operand: '',
    right: ''
}
const history = {
    left: '',
    operand: '',
    right: ''
};

function activeNumber() {
    return calculation.operand ? 'right' : 'left';
}

const buttonElements = new Map();

for (const button of buttons) {
    const buttonDiv = $('<div></div>', {
        'class': 'col-2 p-1'
    });
    const buttonElem = $('<button></button>', {
        'class': `btn calc-button btn-block col-12 h-100 ${button.disabled ? 'disabled' : ''}`,
        'css': {
            'background-color': button.color,
        },
    'text': button.text
    });
    buttonElements.set(button.text, buttonElem);
    buttonDiv.append(buttonElem);
    $('#buttons').append(buttonDiv);
}

function updateDisplay() {
    const { left, operand, right } = calculation;
    if (left === '0' && !operand && !right) {
        calculation.left = '';
    }
    if (operand && !left) {
        calculation.left = '0';
    }
    $('#display').text((left || '0') + (operand ? ` ${operand} ` : '') + (right || ''));
}

function binaryEvaluate() {
    let { left, operand, right } = calculation;
    if (!((left && operand && (right !== '')))) {
        console.log(JSON.stringify(history))
        if (history.operand && history.right) {
            operand = calculation.operand = history.operand;
            right = calculation.right = history.right;
        } else {
            return false;
        }
    }
    if (parseFloat(left) === NaN || parseFloat(right) === NaN) {
        return false;
    }
    if (operand === '/' && parseFloat(right) === 0) {
        return !window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    }
    history.left = left;
    history.operand = operand;
    history.right = right;
    switch (operand) {
        case '+':
            binaryCalculate(left, right, (l, r) => l + r);
        break;
        case '-':
            binaryCalculate(left, right, (l, r) => l - r);
        break;
        case '*':
            binaryCalculate(left, right, (l, r) => l * r);
        break;
        case '/':
            binaryCalculate(left, right, (l, r) => l / r);
        break;
        case '^':
            binaryCalculate(left, right, (l, r) => l ** r);
        break;
    }
    updateDisplay();
    return true;
}

function binaryCalculate(left, right, operation) {
    left = parseInt(left) === parseFloat(left) ? parseInt(left) : parseFloat(left);
    right = parseInt(right) === parseFloat(right) ? parseInt(right) : parseFloat(right);
    const result = operation(left, right);
    $('#history').text(`${left} ${calculation.operand} ${right} = ${result}`);
    calculation.left = result;
    calculation.operand = calculation.right = '';
}

function unaryEvaluate() {
    let { left, operand, right } = calculation;
    if (operand && right && !binaryEvaluate()) {
        return false;
    }
    if (!operand) {
        operand = calculation.operand = history.operand;
        left = calculation.left = history.left;
    }
    left = left || '0';
    if (left === '0' && ['log', 'ln'].includes(operand)) {
        return !window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    }
    if (operand === 'x!' && !Number.isInteger(parseFloat(left))) {
        calculation.operand = '';
        return;
    }
    history.left = left;
    history.operand = operand;
    history.right = right;
    switch (operand) {
        case 'sin':
            unaryCalculate(left, Math.sin);
            $('#history').text(`sin(${left}) = ${calculation.left}`);
        break;
        case 'cos':
            unaryCalculate(left, Math.cos);
            $('#history').text(`cos(${left}) = ${calculation.left}`);
        break;
        case 'tan':
            unaryCalculate(left, Math.tan);
            $('#history').text(`tan(${left}) = ${calculation.left}`);
        break;
        case 'ln':
            unaryCalculate(left, Math.log);
            $('#history').text(`ln(${left}) = ${calculation.left}`);
        break;
        case 'log':
            unaryCalculate(left, Math.log10);
            $('#history').text(`log(${left}) = ${calculation.left}`);
        break;
        case '√':
            unaryCalculate(left, Math.sqrt);
            $('#history').text(`√(${left}) = ${calculation.left}`);
        break;
        case '%':
            unaryCalculate(left, x => x / 100);
            $('#history').text(`${left}% = ${calculation.left}`);
        break;
        case 'x!':
            unaryCalculate(left, x => {
                if (x > 170) return Infinity;
                let result = 1;
                for (let i = 1; i <= x; i++) {
                    result *= i;
                }
                return result;
            });
            $('#history').text(`${left}! = ${calculation.left}`);
        break;
    }
    updateDisplay();
}

function unaryCalculate(value, operation) {
    value = parseInt(value) === parseFloat(value) ? parseInt(value) : parseFloat(value);
    const result = operation(value);
    calculation.left = result;
    calculation.operand = calculation.right = '';
}

for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
    buttonElements.get(digit).click(() => {
        const active = activeNumber();
        calculation[active] += digit;
        updateDisplay();
    });
}

for (const operand of ['+', '-', '*', '/', '^', '%']) {
    buttonElements.get(operand).click(() => {
        if (!calculation.right) {
            calculation.operand = operand;
        } else {
            binaryEvaluate() ? calculation.operand = operand : '';
        }
        updateDisplay();
    });
}

for (const operand of ['sin', 'cos', 'tan', 'ln', 'log', '√', '%', 'x!']) {
    buttonElements.get(operand).click(() => {
        calculation.operand = operand;
        unaryEvaluate();
    });
}

buttonElements.get('AC').click(() => {
    calculation.operand = calculation.right = '';
    calculation.left = '';
    updateDisplay();
});

buttonElements.get('.').click(() => {
    const active = activeNumber();
    if (!calculation[active].includes('.')) {
        calculation[active] = (calculation[active] || '0') + '.';
    }
    updateDisplay();
});

buttonElements.get('EXP').click(() => {
    const active = activeNumber();
    if (!calculation[active]) return;
    if (calculation[active].includes('e')) return;
    calculation[active] += 'e';
    updateDisplay();
});

$('body').on('keydown', e => {
    if (e.key === 'Enter') {
        return buttonElements.get('=').click();
    }
    if (e.key === 'Backspace') {
        if (calculation.operand && calculation[activeNumber()] === '')
            calculation.operand = '';
        else
            calculation[activeNumber()] = calculation[activeNumber()].slice(0, -1);
        return updateDisplay();
    }
    if (e.key === 'Escape') {
        return buttonElements.get('AC').click();
    }
    buttonElements.get(e.key).click();
})

buttonElements.get('=').click(() => {
    binaryEvaluate();
});