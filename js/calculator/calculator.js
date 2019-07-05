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
  calculated: 0,
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
  
  const [strnum, dotnum] = number.split('.')
  
  // dotnum 값 확인해서 있으면 합치고 아니면 말기
  
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
      return makeNumberUsingComma(number)
    },
  ],
  [
    '.js-subscreen',
    ({ buffers }) => buffers.reduce((prev, curr) => `${prev} ${curr}`, ''),
  ],
])

render(state)

const updateArray = (oldarr, ...args) => [...oldarr, ...args]

const concatNumber = (oldnum, newnum) => {
  if (`${oldnum}` === '0') return `${newnum}`
  return `${oldnum}${newnum}`
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
      calculated: 0,
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
      calculated: 0,
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

  }, 
}


document.addEventListener('keyup', e => {
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
  // 콤마 만들떄 점 있으면 점 없는 부분만 콤마 만들게 하기
  //   usingComma 함수에서 점 앞에 부분만 만들고 나중에 합치기

  // 소수점 추가 할때 두번 추가 안하고 한번만 추가하게 하기
  // 점있는 상태에서의 숫자 입력


  // 연산할때 문자열 숫자로 바꾸기
  // 연산할때 점 처리하기


})

ceBtn.addEventListener('click', e => {
  onClickButton.ce()
  render(state)
})



/*
  할 일 목록
    소수점 연산 추가
    숫자 길이 제한
    메모리 길이 제한
    리팩토링
*/
