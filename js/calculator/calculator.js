const operationBtns = document.querySelectorAll('.js-oper-btn')
const numberBtns = document.querySelectorAll('.js-num-btn')
const backBtn = document.querySelector('.js-back-btn')
const cBtn = document.querySelector('.js-c-btn')

const createRender = ({ selector, stateName }) => {
  const element = document.querySelector(selector)
  const mapper = {
    [stateName]: element
  }
  
  return state => {
    const val = state[stateName]
    mapper[stateName].textContent = val
  }
}
const render = createRender({ 
  selector: '.js-screen', 
  stateName: 'screen', 
})

let state = {
  screen: '0',
  buffers: [],
  last: null,
  number: 0,
  operation: null,
}

const setState = newState => state = Object.assign({}, state, newState)
const getState = () => state

render(state);

const operations = {
  ['+'](a, b) { return a + b },
  ['-'](a, b) { return a - b },
  ['*'](a, b) { return a*b },
  ['/'](a, b) { return a/b },
}

const updateArray = (oldarr, ...args) => [...oldarr, ...args]
const changeLastBuffer = oldarr => {
  if (oldarr.length === 0) {

  }


  return newarr
}

const changeStrnumToNumber = strnum => parseInt(strnum)

const concatNumber = (oldnum, newnum) => {
  if (oldnum === '0') return newnum
  return `${oldnum}${newnum}`
}

const normalizeNumber = strnum => {
  const arr = strnum.split(',')
  return arr.join('')
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

const eraseLastNumber = strnum => 
  strnum.length === 1 ? strnum : strnum.slice(0, strnum.length - 1)

const onClickButton = {
  number(newnum) {
    const { screen: oldnum } = getState()

    
    const normnum = normalizeNumber(oldnum)
    const connum = concatNumber(normnum, newnum)
    const number = parseInt(connum)
    const commanum = makeNumberUsingComma(connum)
    setState({ screen: commanum, last: 'number', number })
  },
  operation(operation) {
    const { buffers, last, number } = getState()

    if (last === 'number') {
      const newbuffers = updateArray(buffers, number)
      setState({ 
        last: 'operation', 
        buffers: newbuffers,
        operation,
      })
      return
    } 

    if (last === 'operation') {
      setState({ 
        last: 'operation', 
        operation,
      })
      return
    }
  },
  c() {
    setState({ screen: '0', number: 0 })
  },
  back() {
    const { screen: curnum } = getState()
    const nornum = normalizeNumber(curnum)
    const eranum = eraseLastNumber(nornum)
    const number = parseInt(eranum)
    const comnum = makeNumberUsingComma(eranum)
    setState({ screen: comnum, number })
  },
}


operationBtns.forEach(el => el.addEventListener('click', e => {
  const op = e.target.textContent
  onClickButton.operation(op)
  console.log(state)
}))

numberBtns.forEach(el => el.addEventListener('click', e => {
  const number = e.target.textContent
  onClickButton.number(number)
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
    2. 렌더링 기능 추가
  
  공부 목록
    0. 축약 패턴
    1. 위임 패턴
    2. dataset 속성
    3. 버블링, 이벤트 전파
    4. 정규표현식으로 바꾸기
*/
