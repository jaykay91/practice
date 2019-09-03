const calculator = document.querySelector('#calculator')

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

let state = {
  buffers: [],
  number: '0',
  calculated: '0',
  operator: null,
  WAIT_STATUS: 'RESET',
}

const setState = newState => {
  state = Object.assign({}, state, newState)
  render(state)
}

const getState = () => state

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

const hookMap = {
  INPUT_OPERATION(state, input) {
    const { buffers, number, WAIT_STATUS, calculated, operator } = state

    let newState
    if (WAIT_STATUS === 'NUMBER' || WAIT_STATUS === 'RESET') {
      const newCalculated = calculate(calculated, operator, number)
      const newBuffers = updateArray(buffers, number)
      const newWait = 'OPERATOR'
      
      newState = { 
        buffers: newBuffers, 
        WAIT_STATUS: newWait, 
        calculated: newCalculated,
        number: newCalculated,
        operator: input, 
      }
    } else if (WAIT_STATUS === 'OPERATOR') {
      newState = { operator: input }
    } else {
      newState = {}
    }

    return newState
  },
  INPUT_NUMBER(state, newnum) {
    const { number, WAIT_STATUS, operator, buffers } = state

    let newState
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
    } else {
      newState = {}
    }

    return newState
  },
  INPUT_EQUAL(state) {
    const { calculated, operator, number, WAIT_STATUS } = state

    let newCalculated
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
  INPUT_BACKSPACE(state) {
    const { number, WAIT_STATUS } = state
    if (WAIT_STATUS === 'OPERATOR') return
    if (WAIT_STATUS === 'RESET') return
    const eranum = eraseLastNumber(number)
    return { number: eranum }
  },
  INPUT_CLEAR() {
    return { 
      calculated: '0',
      operator: null,
      number: '0', 
      WAIT_STATUS: 'RESET', 
      buffers: [],
    }
  },
  INPUT_CLEAR_ENTRY(state) {
    const { WAIT_STATUS, operator, buffers } = state

    const nextBuffers = (buffers, operator) => {
      if (WAIT_STATUS !== 'OPERATOR') return buffers
      return updateArray(buffers, operator)
    }

    const newBuffers = nextBuffers(buffers, operator)

    return {
      WAIT_STATUS: 'NUMBER',
      number: '0',
      buffers: newBuffers,
    }
  },
  INPUT_DOT(state) {
    const { number, WAIT_STATUS } = state
    
    let newState
    if (WAIT_STATUS === 'NUMBER') {
      newState = { number: concatNumber(number, '.') }
    } else if (WAIT_STATUS === 'RESET') {
      newState = { 
        number: concatNumber('0', '.'),
        WAIT_STATUS: 'NUMBER',
      }
    } else {
      newState = {}
    }
    
    return newState
  },
}

calculator.addEventListener('click', ({ target }) => {
  target.blur()
  const hook = target.dataset.hook
  if (!hook) return
  const input = target.dataset.input
  const getNextState = hookMap[hook]
  const prev = getState()
  const next = getNextState(prev, input)
  setState(next)
})

document.addEventListener('keydown', e => {
  const input = e.key
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const operations = ['+', '-', '*', '/']
  const equals = ['=', 'Enter']
  const esc = 'Escape'
  const backspace = 'Backspace'
  const dot = '.'

  let hook
  if (numbers.includes(input)) {
    hook = 'INPUT_NUMBER'
  } else if (operations.includes(input)) {
    hook = 'INPUT_OPERATION'
  } else if (equals.includes(input)) {
    hook = 'INPUT_EQUAL'
  } else if (input === esc) {
    hook = 'INPUT_CLEAR'
  } else if (input === backspace) {
    hook = 'INPUT_BACKSPACE'
  } else if (input === dot) {
    hook = 'INPUT_DOT'
  } else {
    return
  }

  const getNextState = hookMap[hook]
  const prev = getState()
  const next = getNextState(prev, input)
  setState(next)
})
