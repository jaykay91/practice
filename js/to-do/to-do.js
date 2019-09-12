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

  async useAction(action, target) {
    const functions = this.functionMap[action]
    for (const func of functions) {
      const state = this.store.getState()
      const result = await func.call(this.domMap, state, target)
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
      actionMap.useAction(action, e.target)
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

actionMap.setAction('CHANGE_TODO', function ({ todoList }, target) {
  const todoDataStr = target.dataset.todo
  if (!todoDataStr) return

  const todoData = JSON.parse(todoDataStr)
  const { event, index } = todoData

  if (event === 'modifyReady' || event === 'modifyCancel') {
    console.log(`Modify: ${index}`)
    changeModifyView.call(this, index, event)
    return false
  }

  if (event === 'modify') {
    console.log(`Modify: ${index}`)

  }

  if (event === 'check') {
    const { content, checked } = todoList[index]
    const newTodoList = [
      ...todoList.slice(0, index),
      { content, checked: !checked },
      ...todoList.slice(index + 1)
    ]
    return { todoList: newTodoList }
  }

  if (event === 'delete') {
    const newTodoList = [
      ...todoList.slice(0, index),
      ...todoList.slice(index + 1)
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

actionMap.setAction('CHANGE_VALUE', (state, target) => {
  return { inputValue: target.value }
})

function changeModifyView(index, event) {
  const { TodoContainer } = this
  const TodoItem = TodoContainer.children[index]
  const contentEl = TodoItem.querySelector('.TodoItem_content')
  const content = contentEl.textContent
  if (event === 'modifyReady') {
    const modifyButton = TodoItem.querySelector('[data-todo*="modifyReady"]')
    const cancelButton = document.createElement('button')
    cancelButton.textContent = '취소'
    cancelButton.dataset.todo = makeTodoData('cancelModify', index)
    modifyButton.replaceWith(cancelButton)
    
    // const checkButton 
    
    const modifyView = `
      <input type="text" value="${content}">
    `
    contentEl.innerHTML = modifyView
  } else {




  }
} 

function updateValue({ inputValue }) {
  const { InputBox_input } = this
  InputBox_input.value = inputValue
}

function refreshTodo({ todoList }) {
  const { TodoContainer } = this
  const TodoList = todoList.map(({ content, checked }, i) => {
    const todo = `
      <div class="TodoItem">
        <div>
          <input type="checkbox" data-todo="${makeTodoData('check', i).replace(/"/g, '&quot;')}" ${checked ? 'checked' : ''}>
          <span class="TodoItem_content">${content}</span>
        </div>
        <div>
          <button data-todo="${makeTodoData('modifyReady', i).replace(/"/g, '&quot;')}">수정</button>
          <button data-todo="${makeTodoData('delete', i).replace(/"/g, '&quot;')}">삭제</button>
        </div>
      </div>
    `
    return todo
  }).join('')

  TodoContainer.innerHTML = TodoList
}

function makeTodoData(event, index) {
  return JSON.stringify({ event, index })
}

store.setState({ 
  todoList: [
    { content: 'play game', checked: true },
    { content: 'play music', checked: false },
    { content: 'coding', checked: true },
    { content: 'study', checked: false },
    { content: 'reading', checked: false },
  ] 
})

actionMap.useAction('INIT')
