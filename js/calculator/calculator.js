const operationBtns = document.querySelectorAll('.js-oper-btn')
const numberBtns = document.querySelectorAll('.js-num-btn')
const backBtn = document.querySelector('.js-back-btn')
const cBtn = document.querySelector('.js-c-btn')
const equalBtn = document.querySelector('.js-equal-btn')
const ceBtn = document.querySelector('.js-ce-btn')
const dotBtn = document.querySelector('.js-dot-btn')

let state = {
  buffers: [],
  number: '0',
  calculated: '0',
  operator: null,
  wait: 'RESET',
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

const makeNumberUsingComma = number => {
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

  return strbuf + dotstr
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

const calculate = (oldstr, op, newstr) => {
  const oldnum = parseFloat(oldstr)
  const newnum = parseFloat(newstr)

  if (!op) return newstr
   
  const operations = {
    ['+'](a, b) { return a + b },
    ['-'](a, b) { return a - b },
    ['*'](a, b) { return a*b },
    ['/'](a, b) { return a/b },
  }

  const calculated = operations[op](oldnum, newnum)
  return `${calculated}`
}

const onClickButton = {
  number(newnum) {
    const { number, wait, operator, buffers } = getState()

    let newState = {}

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
      calculated: '0',
      operator: null,
      number: '0', 
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

    let newCalculated = {}
    
    if (wait === 'OPERATOR') {
      newCalculated = calculated      

    } else {
      newCalculated = calculate(calculated, operator, number)
    }
    
    setState({ 
      calculated: '0',
      operator: null,
      number: newCalculated, 
      wait: 'RESET', 
      buffers: [],
    })
  },
  ce() {
    const { wait, operator, buffers } = getState()

    const nextBuffers = (buffers, operator) => {
      if (wait !== 'OPERATOR') return buffers
      return updateArray(buffers, operator)
    }

    const newBuffers = nextBuffers(buffers, operator)

    setState({
      wait: 'NUMBER',
      number: '0',
      buffers: newBuffers,
    })
  },
  dot() {


    
    const { number, wait } = getState()
    
    let state;
    //  상태를 확인
    if (wait === 'NUMBER') {
      //      숫자와 점을 합친 새로운 number로 변경
      state = { number: concatNumber(number, '.') }
    } else if (wait === 'RESET') {
      state = { 
        number: concatNumber('0', '.'),
        wait: 'NUMBER',
      }
    } else if (wait === 'OPERATOR') {
      //    OPERATOR이면
      //      아무것도 하지 않음
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

operationBtns.forEach(el => el.addEventListener('click', e => {
  console.log(state)
  const op = e.target.textContent
  onClickButton.operator(op)
  render(state)
}))

numberBtns.forEach(el => el.addEventListener('click', e => {
  console.log(state)
  const number = e.target.textContent
  onClickButton.number(number)
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

dotBtn.addEventListener('click', e => {
  onClickButton.dot()
  render(state)
})

ceBtn.addEventListener('click', e => {
  onClickButton.ce()
  render(state)
})



/*
  할 일 목록
    소수점 연산 오류 수정
    마이너스 추가되는 문제 수정
    숫자 길이 제한
    메모리 길이 제한
    리팩토링
*/
