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

const actionMap = [
  {
    action: 'CHANGE_TODO',
    selectors: {
      todoContainer: '.js-TodoContainer',
    },
    render: ({ todoList }, { todoContainer }) => {
      const lastTodo = todoList.slice(-1)[0]
      const todo = document.createElement('div')
      let content = 
                  `<div><input type="checkbox"><span>${lastTodo}</span></div>`
      content += `<div><button>수정</button><button>삭제</button></div>`
      todo.innerHTML = content
      todoContainer.append(todo)        
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
    return { inputValue: target.value }
  },
  addTodo: ({ todoList, inputValue }) => {
    return { todoList: [...todoList, inputValue] }    
  },
  deleteTodo: (state) => {

  },
  modifyTodo: (state) => {

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



