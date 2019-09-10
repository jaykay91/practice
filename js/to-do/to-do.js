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

actionMap.setAction('CONTROL_TODO', function ({ todoList }) {
  const todoDataStr = this.target.dataset.todo
  if (!todoDataStr) return

  const todoData = JSON.parse(todoDataStr)
  const { event, target } = todoData
  const targetDom = document.querySelector(`.Todo_item${target}`)

  if (event === 'modify') {

    return
  }

  if (event === 'check') {

    return
  }

  if (event === 'delete') {
    const newTodoList = [
      ...todoList.slice(0, target),
      ...todoList.slice(target + 1)
    ]
    return { todoList: newTodoList }
  }
}, function (state) {
  refreshTodo.call(this, state)
})

actionMap.setAction('DELETE_ALL_TODO', () => ({ todoList: [] })
, function (state) {
  refreshTodo.call(this, state)
})

actionMap.setAction('INIT', function (state) {
  refreshTodo.call(this, state)
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
  const TodoList = todoList.map((content, i) => {
    const makeTodoData = (event, target) => 
      JSON.stringify({ event, target }).replace(/"/g, '&quot;')
    const todo = `
      <div class="Todo_item${i}">
        <div><input type="checkbox" data-todo="${makeTodoData('check', i)}"><span>${content}</span></div>
        <div>
          <button data-todo="${makeTodoData('modify', i)}">수정</button>
          <button data-todo="${makeTodoData('delete', i)}">삭제</button>
        </div>
      </div>
    `
    return todo
  }).join('')

  TodoContainer.innerHTML = TodoList
}

store.setState({ 
  todoList: [
    'play game',
    'play music',
    'coding',
    'study',
    'reading',
  ] 
})

actionMap.useAction('INIT')
