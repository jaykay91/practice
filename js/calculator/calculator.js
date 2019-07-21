// const operationBtns = document.querySelectorAll('.js-oper-btn')
// const numberBtns = document.querySelectorAll('.js-num-btn')
// const backBtn = document.querySelector('.js-back-btn')
// const cBtn = document.querySelector('.js-c-btn')
// const equalBtn = document.querySelector('.js-equal-btn')
// const ceBtn = document.querySelector('.js-ce-btn')
// const dotBtn = document.querySelector('.js-dot-btn')

const calculator = document.querySelector('#calculator')

let state = {
  buffers: [],
  number: '0',
  calculated: '0',
  operator: null,
  WAIT_STATUS: 'RESET',
}

const setState = newState => state = Object.assign({}, state, newState)
const getState = () => state

const createRender = selectorMap => {
  const domMap = selectorMap.map(([selector, render]) => {
    const dom = document.querySelector(selector)
    return [dom, render]
  })

  return state => {
    domMap.forEach(([dom, render]) => {
      dom.textContent = render(state)
    })
  }
}

const makeNumberUsingComma = str => {
  if (str.includes('Infinity') || str.includes('NaN')) {
    return '0으로 나눌 수 없습니다.'
  }
  
  const splitMinus = numstr => {
    if (numstr[0] !== '-') return ['', numstr] 
    return ['-', numstr.slice(1)]
  }

  const [minus, number] = splitMinus(str)
  
  const splitDot = numstr => {
    const dotIndex = number.indexOf('.')

    if (dotIndex === -1) return [numstr, '']
    
    const strnum = numstr.slice(0, dotIndex)
    const dotstr = numstr.slice(dotIndex)    

    return [strnum, dotstr]
  } 
  
  const [strnum, dotstr] = splitDot(number)
  
  const arr = strnum.split('')
  let strbuf = arr.splice(-3).join('')

  while (arr.length) {
    const slarr = arr.splice(-3)
    strbuf = `${slarr.join('')},${strbuf}`
  }

  return minus + strbuf + dotstr
}

const render = createRender([
  [
    '.js-screen',
    ({ number }) => {
      return makeNumberUsingComma(number)
    },
  ],
  [
    '.js-subscreen',
    ({ buffers }) => buffers.reduce((prev, curr) => `${prev} ${curr}`, ''),
  ],
])

render(state)

const updateArray = (oldarr, input) => {
  const dotIndex = input.indexOf('.')
  if (dotIndex === -1) return [...oldarr, input]
  if (dotIndex !== input.length - 1) return [...oldarr, input]

  return [...oldarr, input.slice(0, dotIndex)]
}

const concatNumber = (oldnum, newstr) => {
  if (oldnum.length > 9) return oldnum
  
  if (newstr === '.') {
    const hasDot = oldnum.includes('.')
    return hasDot ? oldnum : `${oldnum}.`
  }

  if (`${oldnum}` === '0') return `${newstr}`

  return `${oldnum}${newstr}`
}

const eraseLastNumber = number => {
  const strnum = `${number}`
  const slstr = strnum.length === 1 ? 
    strnum : strnum.slice(0, strnum.length - 1)
  return slstr
}

const eraseDot = numstr => {
  const dotidx = numstr.lastIndexOf('.')
  if (dotidx === -1) return numstr
  const lastidx = numstr.length - 1
  if (dotidx !== lastidx) return numstr
  return numstr.slice(0, lastidx)
}

const calculate = (oldstr, op, newstr) => {
  const oldnum = parseFloat(oldstr)
  const newnum = parseFloat(newstr)

  if (!op) return eraseDot(newstr)
   
  const operations = {
    ['+'](a, b) { return a + b },
    ['-'](a, b) { return a - b },
    ['*'](a, b) { return a*b },
    ['/'](a, b) { return a/b },
  }

  const calculated = operations[op](oldnum, newnum)
  const fixed = parseFloat(calculated.toFixed(10))

  return `${fixed}`
}

const onClickButton = {
  number(newnum) {
    const { number, WAIT_STATUS, operator, buffers } = getState()

    let newState = {}

    if (WAIT_STATUS === 'NUMBER') {
      const connum = concatNumber(number, newnum)
      newState = { number: connum }
      
    } else if (WAIT_STATUS === 'OPERATOR') {  
      const newBuffers = updateArray(buffers, operator)
      newState = { WAIT_STATUS: 'NUMBER', number: newnum, buffers: newBuffers }

    } else if (WAIT_STATUS === 'RESET') {
      newState = {
        WAIT_STATUS: 'NUMBER',
        number: newnum,
      }
    }

    setState(newState)
  },
  operator(newOperator) {
    const { buffers, number, WAIT_STATUS, calculated, operator } = getState()

    let newState = {}

    if (WAIT_STATUS === 'NUMBER' || WAIT_STATUS === 'RESET') {
      const newCalculated = calculate(calculated, operator, number)
      const newBuffers = updateArray(buffers, number)
      const newWait = 'OPERATOR'
      
      newState = { 
        buffers: newBuffers, 
        WAIT_STATUS: newWait, 
        calculated: newCalculated,
        number: newCalculated,
        operator: newOperator, 
      }

    } else if (WAIT_STATUS === 'OPERATOR') {
      newState = { operator: newOperator }
    }

    setState(newState)
  },
  c() {
    setState({ 
      calculated: '0',
      operator: null,
      number: '0', 
      WAIT_STATUS: 'RESET', 
      buffers: [],
     })
  },
  back() {
    const { number, WAIT_STATUS } = getState()

    if (WAIT_STATUS === 'OPERATOR') return
    if (WAIT_STATUS === 'RESET') return

    const eranum = eraseLastNumber(number)
    setState({ number: eranum })
  },
  equal() {
    const { calculated, operator, number, WAIT_STATUS } = getState()

    let newCalculated = {}
    
    if (WAIT_STATUS === 'OPERATOR') {
      newCalculated = calculated      

    } else {
      newCalculated = calculate(calculated, operator, number)
    }
    
    setState({ 
      calculated: '0',
      operator: null,
      number: newCalculated, 
      WAIT_STATUS: 'RESET', 
      buffers: [],
    })
  },
  ce() {
    const { WAIT_STATUS, operator, buffers } = getState()

    const nextBuffers = (buffers, operator) => {
      if (WAIT_STATUS !== 'OPERATOR') return buffers
      return updateArray(buffers, operator)
    }

    const newBuffers = nextBuffers(buffers, operator)

    setState({
      WAIT_STATUS: 'NUMBER',
      number: '0',
      buffers: newBuffers,
    })
  },
  dot() {
    const { number, WAIT_STATUS } = getState()
    
    let state;
    if (WAIT_STATUS === 'NUMBER') {
      state = { number: concatNumber(number, '.') }
    } else if (WAIT_STATUS === 'RESET') {
      state = { 
        number: concatNumber('0', '.'),
        WAIT_STATUS: 'NUMBER',
      }
    }
    
    setState(state)
  }, 
}


document.addEventListener('keydown', e => {
  console.log(state)
  
  const key = e.key
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const operations = ['+', '-', '*', '/']
  const esc = 'Escape'

  if (numbers.includes(key)) {
    onClickButton.number(key)
    render(state)
    return
  }

  if (operations.includes(key)) {
    onClickButton.operator(key)
    render(state)
    return
  }

  if (key === '=' || key === 'Enter') {
    onClickButton.equal()
    render(state)
    return
  }

  if (key === 'Backspace') {
    onClickButton.back()
    render(state)
    return
  }

  if (key === esc) {
    onClickButton.c()
    render(state)
    return
  }

  if (key === '.') {
    onClickButton.dot()
    render(state)
    return
  }
})

// operationBtns.forEach(el => el.addEventListener('click', e => {
//   console.log(state)
//   const op = e.target.textContent
//   onClickButton.operator(op)
//   render(state)
// }))

// numberBtns.forEach(el => el.addEventListener('click', e => {
//   console.log(state)
//   const number = e.target.textContent
//   onClickButton.number(number)
//   render(state)
// }))

// backBtn.addEventListener('click', e => {
//   onClickButton.back()
//   render(state)
// })

// cBtn.addEventListener('click', e => {
//   onClickButton.c()
//   render(state)
// })

// equalBtn.addEventListener('click', e => {
//   onClickButton.equal()
//   render(state)
// })

// dotBtn.addEventListener('click', e => {
//   onClickButton.dot()
//   render(state)
// })

// ceBtn.addEventListener('click', e => {
//   onClickButton.ce()
//   render(state)
// })

const hookMap = {
  INPUT_OPERATION() {
    
  },
  INPUT_NUMBER() {

  },
  INPUT_EQUAL() {

  },
  INPUT_BACKSPACE() {

  },
  INPUT_CLEAR() {
    
  },
  INPUT_CLEAR_ENTRY() {

  },
  INPUT_DOT() {

  },
}

const getNextState = (state, input) => {
  
}

calculator.addEventListener('click', ({ target }) => {
  const hook = target.dataset.hook
  if (!hook) return
  const input = target.dataset.input
  const getNextState = hookMap[hook]
  const prev = getState()
  const next = getNextState(prev, input)
  setState(next)
})

// calculator.addEventListener('keydown', ev => {

// })


/*
  할 일 목록
    리팩토링
*/
