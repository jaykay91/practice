const screen = document.querySelector('.js-screen')
const operationBtns = document.querySelectorAll('.js-oper-btn')
const numberBtns = document.querySelectorAll('.js-num-btn')
const backBtn = document.querySelector('.js-back-btn')
const cBtn = document.querySelector('.js-c-btn')

const calculatorData = {
  number: '0',
  operation: () => {}, 
}

const operations = {
  ['+'](a, b) { return a + b },
  ['-'](a, b) { return a - b },
  ['*'](a, b) { return a*b },
  ['/'](a, b) { return a/b },
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

const eraseLastNumber = num => {
  const stringNum = `${num}`
  const slicedStr = stringNum.slice(0, stringNum.length - 1)
  const erasedNum = parseInt(slicedStr)

  return erasedNum
}

/* 
  1. 숫자 계속 추가하기
  2. 지우기 버튼 
 */
const onClickButton = {
  number(newnum) {
    const oldnum = calculatorData.number
    const normnum = normalizeNumber(oldnum)
    const connum = concatNumber(normnum, newnum)
    const commanum = makeNumberUsingComma(connum)

    calculatorData.number = commanum
    console.log(calculatorData.number)
  },
  operation(oper) {
    const operation = operations[oper]
    calculatorData.operation = operation
    console.log(calculatorData)
  },
  c() {

  },
  back() {

  },
}


operationBtns.forEach(el => el.addEventListener('click', e => {
  const op = e.target.textContent
  const state = onClickButton.operation(op)
}))

numberBtns.forEach(el => el.addEventListener('click', e => {
  const number = e.target.textContent
  const state = onClickButton.number(number)
}))
backBtn.addEventListener('click', e => {
  
})
cBtn.addEventListener('click', e => {
  
})



/*
  할 일 목록
    2. 숫자 지우기 버튼 만들기
    3. 연산자...
  
  공부 목록
    0. 축약 패턴
    1. 위임 패턴
    2. dataset 속성
    3. 버블링, 이벤트 전파
    4. 정규표현식으로 바꾸기
*/
