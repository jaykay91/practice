const operationBtns = document.querySelectorAll('.js-oper-btn')
const numberBtns = document.querySelectorAll('.js-num-btn')
const backBtn = document.querySelector('.js-back-btn')
const cBtn = document.querySelector('.js-c-btn')

const createRender = ({ selector, stateName, renderData }) => {
  const element = document.querySelector(selector)
  const mapper = { [stateName]: element }
  
  return state => {
    const val = renderData(state[stateName])
    mapper[stateName].textContent = val
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

const render = createRender({ 
  selector: '.js-screen', 
  stateName: 'number', 
  renderData(val) {
    return makeNumberUsingComma(val)
  }
})

let state = {
  buffers: [],
  number: 0,
  calculated: 0,
  operator: null,
  wait: 'NUMBER',
}

const setState = newState => state = Object.assign({}, state, newState)
const getState = () => state

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

const canCalculate = (buffers) => {
  if (buffers.length < 3) return false
  const last = buffers.length - 1
  if (typeof buffers[last] === 'string') throw new Error('Invalid Buffers')
  return true
}

const calculate = () => {

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
    }

    setState(newState)
  },
  operator(operator) {
    const { buffers, number, wait } = getState()

    let newState = {}
    if (wait === 'NUMBER') {
      // 결과값이 있는 경우 출력 아니면 과거값 그대로 표시

      const newBuffers = updateArray(buffers, number)
      const wait = 'OPERATOR'
      newState = { buffers: newBuffers, wait, operator }

    } else if (wait === 'OPERATOR') {
      newState = { operator }
    }

    setState(newState)
  },
  c() {
    setState({ number: 0, wait: 'NUMBER', buffers: [] })
  },
  back() {
    const { number, wait } = getState()

    if (wait === 'OPERATOR') return

    const eranum = eraseLastNumber(number)
    setState({ number: eranum })
  },
}




operationBtns.forEach(el => el.addEventListener('click', e => {
  const op = e.target.textContent
  onClickButton.operator(op)
  console.log(state)
}))

numberBtns.forEach(el => el.addEventListener('click', e => {
  const number = e.target.textContent
  onClickButton.number(parseInt(number))
  render(state)
  console.log(state)

}))
backBtn.addEventListener('click', e => {
  onClickButton.back()
  render(state)
})
cBtn.addEventListener('click', e => {
  onClickButton.c()
  render(state)
})

/*
  할 일 목록
    1. 연산 기능 추가
  
  공부 목록
    0. 축약 패턴
    1. 위임 패턴
    2. dataset 속성
    3. 버블링, 이벤트 전파
    4. 정규표현식으로 바꾸기
*/
