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
    setState(action) {
      if (action) {
        const [updatedState, actionType] = action

         
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

const actionMap = [
  // {
  //   action: 'CHANGE_TODO',
  //   selectors: {
  //     todoContainer: '.js-TodoContainer',
  //   },
  //   render: ({ todoList }, { todoContainer }) => {
  //     const lastTodo = todoList.slice(-1)[0]
  //     const todo = document.createElement('div')
  //     let content = 
  //                 `<div><input type="checkbox"><span>${lastTodo}</span></div>`
  //     content += `<div><button>수정</button><button>삭제</button></div>`
  //     todo.innerHTML = content
  //     todoContainer.append(todo)        
  //   }
  // },
  {
    action: 'CHANGE_VALUE',
    selectors: {

    }
  },
]

const state = {
  inputValue: '',
  todoList: [],
}
const render = createRender($map)
const store = createStore(state, render)

const hookMap = {
  changeValue: (state, target) => {
    return [{ inputValue: target.value }]
  },
  addTodo: ({ todoList, inputValue }) => {
    return [{ todoList: [...todoList, inputValue] }, 'CHANGE_TODO']    
  },
  deleteTodo: (state) => {

  },
  modifyTodo: (state) => {

  },
}

document.querySelectorAll('[class^="js-"]').forEach(el => {
  // const hook = el.dataset.hook
  const action = el.dataset.event

  (() => {
    const string = 'addTodo'
    let upperIdx
    for (const idx in string) {
      const char = string[idx]
      
      if (char === char.toUpperCase()) {
        upperIdx = idx
        break
          }
      }
    const lower = string.slice(0, upperIdx)
    const upper = string.slice(upperIdx)
    return [lower, upper]
  })()

  
  
  el.addEventListener(event, e => {
    const prev = store.getState()
    const action = hookMap[hook](prev, e.target)
    store.setState(action)
  })
})



