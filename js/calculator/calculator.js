const screen = document.querySelector('.js-screen')
const operationBtns = document.querySelectorAll('.js-oper-btn')
const numberBtns = document.querySelectorAll('.js-num-btn')
let resultNumber = 0

const putNumberToScreen = num => screen.textContent = `${num}`
putNumberToScreen(resultNumber)

const operations = {
  '+'(a, b) { return a + b },
  '-'(a, b) { return a - b },
  '/'(a, b) { return a/b },
  '*'(a, b) { return a*b },
}

operationBtns.forEach(el => el.addEventListener('click', e => {
  const op = e.target.textContent
  console.log(operations[op]);

}))

numberBtns.forEach(el => el.addEventListener('click', e => {
  const number = e.target.textContent
  putNumberToScreen(number)
}))


/*
  할 일 목록
    1. 숫자를 계속 입력받게
    2. 연산자 동작하게
  
  공부 목록
    1. 위임 패턴
    2. dataset 속성
    3. 버블링, 이벤트 전파
*/
