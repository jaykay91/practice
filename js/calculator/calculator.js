const operationBtns = document.querySelectorAll('.js-oper-btn');
const numberBtns = document.querySelectorAll('.js-num-btn');
const backBtn = document.querySelector('.js-back-btn');
const cBtn = document.querySelector('.js-c-btn');
const equalBtn = document.querySelector('.js-equal-btn');

let state = {
  buffers: [],
  number: 0,
  calculated: 0,
  operator: null,
  wait: 'RESET',
};

const setState = newState => state = Object.assign({}, state, newState)
const getState = () => state

const createRender = selectorMap => {
  const domMap = selectorMap.map(([selector, render]) => {
    const dom = document.querySelector(selector);
    return [dom, render];
  });

  return state => {
    domMap.forEach(([dom, render]) => {
      dom.textContent = render(state);
    });
  }
}

const makeNumberUsingComma = num => {
  const strnum = `${num}`
  const arr = strnum.split('')
  let strbuf = arr.splice(-3).join('')

  while (arr.length) {
    const slarr = arr.splice(-3)
    strbuf = `${slarr.join('')},${strbuf}`
  }

  return strbuf
}

const render = createRender([
  [
    '.js-screen',
    ({ number }) => {
      return makeNumberUsingComma(number);
    },
  ],
  [
    '.js-subscreen',
    ({ buffers }) => buffers.reduce((prev, curr) => `${prev} ${curr}`, ''),
  ],
]);

render(state);

const updateArray = (oldarr, ...args) => [...oldarr, ...args]

const concatNumber = (oldnum, newnum) => {
  if (`${oldnum}` === '0') return newnum
  return parseInt(`${oldnum}${newnum}`)
}

const eraseLastNumber = number => {
  const strnum = `${number}`
  const slstr = strnum.length === 1 ? 
    strnum : strnum.slice(0, strnum.length - 1)
  return parseInt(slstr)
}

const calculate = (oldnum, op, newnum) => {
  if (!op) return newnum
   
  const operations = {
    ['+'](a, b) { return a + b },
    ['-'](a, b) { return a - b },
    ['*'](a, b) { return a*b },
    ['/'](a, b) { return a/b },
  }

  return operations[op](oldnum, newnum)
}

const onClickButton = {
  number(newnum) {
    const { number, wait, operator, buffers } = getState()

    let newState = {};

    if (wait === 'NUMBER') {
      const connum = concatNumber(number, newnum)
      newState = { number: connum }
      
    } else if (wait === 'OPERATOR') {  
      const newBuffers = updateArray(buffers, operator)
      newState = { wait: 'NUMBER', number: newnum, buffers: newBuffers }

    } else if (wait === 'RESET') {
      newState = {
        wait: 'NUMBER',
        number: newnum,
      }
    }

    setState(newState)
  },
  operator(newOperator) {
    const { buffers, number, wait, calculated, operator } = getState()

    let newState = {}

    if (wait === 'NUMBER' || wait === 'RESET') {
      const newCalculated = calculate(calculated, operator, number)
      const newBuffers = updateArray(buffers, number)
      const newWait = 'OPERATOR'
      
      newState = { 
        buffers: newBuffers, 
        wait: newWait, 
        calculated: newCalculated,
        number: newCalculated,
        operator: newOperator, 
      }

    } else if (wait === 'OPERATOR') {
      newState = { operator: newOperator }
    }

    setState(newState)
  },
  c() {
    setState({ 
      calculated: 0,
      operator: null,
      number: 0, 
      wait: 'RESET', 
      buffers: [],
     })
  },
  back() {
    const { number, wait } = getState()

    if (wait === 'OPERATOR') return
    if (wait === 'RESET') return

    const eranum = eraseLastNumber(number)
    setState({ number: eranum })
  },
  equal() {
    const { calculated, operator, number, wait } = getState()

    let newCalculated;
    
    if (wait === 'OPERATOR') {
      newCalculated = calculated;      

    } else {
      newCalculated = calculate(calculated, operator, number);
    }
    
    setState({ 
      calculated: 0,
      operator: null,
      number: newCalculated, 
      wait: 'RESET', 
      buffers: [],
    });
  },
}


document.addEventListener('keyup', e => {
  const key = e.key;
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const operations = ['+', '-', '*', '/'];
  const equal = '=';
  const backspace = 'Backspace';
  const esc = 'Escape';

  if (numbers.includes(key)) {
    onClickButton.number(+key);
    render(state);
    return;
  }

  if (operations.includes(key)) {
    onClickButton.operator(key);
    render(state);
    return;
  }

  if (key === equal) {
    onClickButton.equal();
    render(state);
    return;
  }

  if (key === backspace) {
    onClickButton.back();
    render(state);
    return;
  }

  if (key === esc) {
    onClickButton.c();
    render(state);
    return;
  }
});

operationBtns.forEach(el => el.addEventListener('click', e => {
  // console.log(state)
  const op = e.target.textContent
  onClickButton.operator(op)
  render(state)
}))

numberBtns.forEach(el => el.addEventListener('click', e => {
  // console.log(state)
  const number = e.target.textContent
  onClickButton.number(parseInt(number))
  render(state)

}))
backBtn.addEventListener('click', e => {
  onClickButton.back()
  render(state)
})
cBtn.addEventListener('click', e => {
  onClickButton.c()
  render(state)
})
equalBtn.addEventListener('click', e => {
  onClickButton.equal()
  render(state)
})

/*
  할 일 목록
    소수점 연산 추가
    소수점 버튼 구현
    리팩토링
*/
