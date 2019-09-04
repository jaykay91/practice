console.log('Hello, To-Do!')

const createRender = stateMap => {
  const domMap = stateMap.map(([[state, selector], render]) => {
    const dom = document.querySelector(selector)
    return [[state, dom], render]
  })

  return (updatedObj, prevStateObj) => {
    const entries = Object.entries(updatedObj)
    for (const [updatedState, updatedValue] of entries) {
      for (const [[state, dom], render] of domMap) {
        if (updatedState === state) {
          const prevValue = prevStateObj[updatedState]
          render(updatedValue, dom, prevValue)
          break
        }
      }
    }
  }
}

const createStore = (initState, render) => {
  let prevState
  let currState = initState
  
  return {
    setState(updatedState) {
      if (updatedState) {
        prevState = currState
        currState = Object.assign({}, currState, updatedState)
        render(updatedState, prevState)
        // console.log(prevState, currState)
      }
    },
    getState() {
      return currState
    },
  }
}

const $map = [
]

const state = {
  inputValue: '',
}
const render = createRender($map)
const store = createStore(state, render)

const actionMap = {
  'MODIFY_TODO_NAME': (state, target) => {
    return { inputValue: target.value }
  },
  'ADD_TODO': ({ inputValue }) => {
    console.log(inputValue)


  },
}

document.querySelectorAll('[class^="js-"]').forEach(el => {
  const action = el.dataset.action
  const event = el.dataset.event
  el.addEventListener(event, e => {
    const prev = store.getState()
    const updated = actionMap[action](prev, e.target)
    store.setState(updated)
  })
})



