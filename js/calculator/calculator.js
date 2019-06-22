const screen = document.querySelector('.js-screen')
const operationBtns = document.querySelectorAll('.js-oper-btn')
const numberBtns = document.querySelectorAll('.js-num-btn')

const calculatorData = {
  number: 0,
  operation: () => {}, 
}

/* 
  내부 상태를 가지는 계산기 구조체
  모든 side effect 또는 side cause 는
  이벤트(입력), 상태 변경(출력), dom접근(입력)
  dom변경(출력)

  버튼을 누르면 -> 숫자 변경
  연산자를 누르면 연산 대기
 */

const calculator = {
  screenNumber: '0',
  setScreenNumber(num) {
    if (this.screenNumber === '0') {
      this.screenNumber = num
      return
    }

    const removeCommaFromNumber = strnum => {
      const arr = strnum.split(',')  
      return arr.join('')
    }

    const concatnum = removeCommaFromNumber(this.screenNumber) + num
    
    // const makeNumberWithComma = strnum => {
    //   const arr = strnum.split('')
    //   let strbuf = arr.splice(-3).join('')

    //   while (arr.length) {
    //     const slarr = arr.splice(-3)
    //     strbuf = `${slarr.join('')},${strbuf}`
    //   }

    //   return strbuf
    // }



    this.screenNumber = makeNumberWithComma(concatnum)
  },
}

const putNumberToScreen = num => screen.textContent = `${num}`
putNumberToScreen(calculator.screenNumber)

const makeNumberWithComma = num => {
  const strnum = `${num}`
  if (strnum.length < 4) return strnum
  
  // 뒤에서부터 문자열을 잘라서 새로운 문자열을 반환
  const spliceBack = (str, backIdx) => {
    const idx = str.length - backIdx
    const splstr = str.slice(idx)
    const reststr = str.slice(0, idx)
    return { splstr, reststr }
  }
  
  let { splstr, reststr } = spliceBack(strnum, 3)
  const arr = [splstr]
  while (reststr.length >= 4) {
    ({ splstr, reststr } = spliceBack(reststr, 3))
    arr.unshift(splstr)
  }
  arr.unshift(reststr)

  return arr.join(',')
}

const eraseLastNumber = num => {
  const stringNum = `${num}`
  const slicedStr = stringNum.slice(0, stringNum.length - 1)
  const erasedNum = parseInt(slicedStr)
  return erasedNum
}

const operations = {
  '+'(a, b) { return a + b },
  '-'(a, b) { return a - b },
  '/'(a, b) { return a/b },
  '*'(a, b) { return a*b },
  Back() {
    console.log('Back')
  },
  C() {
    console.log(C)
  },
}

operationBtns.forEach(el => el.addEventListener('click', e => {
  const op = e.target.textContent
  console.log(operations[op])

}))

numberBtns.forEach(el => el.addEventListener('click', e => {
  const number = e.target.textContent
  console.log(number)
  calculator.setScreenNumber(number)
  putNumberToScreen(calculator.screenNumber)
}))



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
