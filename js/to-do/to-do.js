class Store {
  currState = {
    inputValue: '',
    todoList: [],
  }

  prevState = null

  setState(updatedState) {
    this.prevState = this.currState
    this.currState = Object.assign({}, this.currState, updatedState)
  }

  getState() {
    return this.currState
  }
}

class ActionMap {
  constructor (store) {
    this.store = store
  }

  domMap = {}
  functionMap = {}

  async useAction(action, ...args) {
    const functions = this.functionMap[action]
    for (const func of functions) {
      const state = this.store.getState()
      const result = await func.call(this.domMap, state)
      if (result) {
        if (typeof result === 'object') {
          this.store.setState(result)
        }
      } else {
        break
      }
    }
  }

  setAction(action, ...functions) {
    this.functionMap[action] = functions
  }
}

const store = new Store()
const actionMap = new ActionMap(store)

document.querySelectorAll('[class*="js-"]').forEach(el => {
  const hook = el.dataset.hook
  
  if (hook) {
    const [event, action] = hook.split(';')
    el.addEventListener(event, e => {
      actionMap.domMap.target = e.target
      actionMap.useAction(action)
    })
  }

  const className = el.className.split(' ').find(name => name.includes('js-'))
  const domName = className.replace('js-', '')
  actionMap.domMap[domName] = el
})






// actionMap.setAction('ADD_TODO', function ({ todoList, inputValue }) {
//   return { todoList: [...todoList, inputValue], inputValue: '' }
// }, function ({ todoList }) {
//   const { InputBox_input, TodoContainer } = this
//   InputBox_input.value = ''
//   const lastTodo = todoList.slice(-1)[0]
//   const todo = document.createElement('div')
//   const content = ` 
//     <div><input type="checkbox"><span>${lastTodo}</span></div>
//     <div><button>수정</button><button>삭제</button></div>
//   `
//   todo.innerHTML = content
//   TodoContainer.append(todo)        
// })


actionMap.setAction('ADD_TODO', ({ todoList, inputValue }) => {
  if (!inputValue) return null
  return { todoList: [...todoList, inputValue], inputValue: '' }
}, function (state) {
  refreshTodo.call(this, state)
  updateValue.call(this, state)
})

actionMap.setAction('CONTROL_TODO', function (state) {
  console.log(this.target)
})


actionMap.setAction('CHANGE_VALUE', function () {
  return { inputValue: this.target.value }
})

function updateValue({ inputValue }) {
  const { InputBox_input } = this
  InputBox_input.value = inputValue
}

function refreshTodo({ todoList }) {
  const { TodoContainer } = this
  const TodoList = todoList.map(content => `
    <div>
      <div><input type="checkbox"><span>${content}</span></div>
      <div><button>수정</button><button>삭제</button></div>
    </div>
  `).join('')

  TodoContainer.innerHTML = TodoList
}