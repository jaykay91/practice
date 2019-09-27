class Component {
  constructor(self) {
    this.self = self
    this.targets = [...self.querySelectorAll(`[data-target]`)]
      .reduce((acc, el) => {
        const name = el.dataset.target
        acc[name] = el
        return acc
      }, {})
  }
}

class Form extends Component {
  init() {
    this.self.username.value = ''
    this.self.phoneNumber.value = ''
    this.self.describe.value = ''
  }

  set({ name, info, phoneNumber }) {
    this.self.username.value = name
    this.self.phoneNumber.value = phoneNumber
    this.self.describe.value = info
  }

  validate() {
    const { username, phoneNumber, describe } = this.self
    console.log(username.value, phoneNumber.value, describe.value)

    if (!username.value) return false
    if (!phoneNumber.value) return false
    if (!describe.value) return false
    return true
  }

  submit() {
    const { username, phoneNumber, describe } = this.self
    return {
      name: username.value,
      phoneNumber: phoneNumber.value,
      info: describe.value,
    }
  }
}

class Modal extends Component {
  show({ type, content }) {
    const { message, card, notification, body } = this.targets
    body.innerHTML = ''
    if (type === 'message') {
      const messageBody = message.querySelector('.message-body')
      messageBody.textContent = content
      body.append(message)
    } else if (type === 'RegCard') {
      const cardTitle = card.querySelector('.modal-card-title')
      const regBtn = card.querySelector('[data-event$="registerPhone"]')
      const modBtn = card.querySelector('[data-event$="modifyPhone"]')
      cardTitle.textContent = content.header
      regBtn.classList.remove('is-hidden')
      modBtn.classList.add('is-hidden')
      body.append(card)
      card.querySelector('input[name="phoneNumber"]').disabled = false
    } else if (type === 'ModCard') {
      const cardTitle = card.querySelector('.modal-card-title')
      const regBtn = card.querySelector('[data-event$="registerPhone"]')
      const modBtn = card.querySelector('[data-event$="modifyPhone"]')
      cardTitle.textContent = content.header
      regBtn.classList.add('is-hidden')
      modBtn.classList.remove('is-hidden')
      body.append(card)
      card.querySelector('input[name="phoneNumber"]').disabled = true
    } else {
      body.append(notification)
    }
    this.self.classList.add('is-active')
  }

  close() {
    this.self.classList.remove('is-active')
  }
}

class PhoneView extends Component {
  change(phone) {
    const { content, body, message } = this.targets
    if (phone) {
      message.classList.add('is-hidden')
      body.classList.remove('is-hidden')
      content.innerHTML = `
        <strong>${phone.phoneNumber}</strong> (${phone.name})
        <p>${phone.info}</p>
      `
    } else {
      message.classList.remove('is-hidden')
      body.classList.add('is-hidden')
    }
  }  
}

class Menu extends Component {
  selected = null

  init(phoneList) {
    this.targets.list.innerHTML = ''
    for (const phone of phoneList) {
      this.add(phone)
    }
  }

  add(data) {
    const { phoneNumber } = data
    const { list } = this.targets
    const dataStr = JSON.stringify(data)
    const liEl = document.createElement('li')
    liEl.innerHTML = `<a>${phoneNumber}</a>`
    liEl.dataset.phone = dataStr
    list.append(liEl)
  }

  select(target) {
    if (this.selected) this.selected.classList.remove('is-active')
    if (target === this.selected || target === this.self || target.tagName === 'P') return this.selected = null
    target.classList.add('is-active')
    this.selected = target
  }

  getSelectedPhone() {
    return this.selected && JSON.parse(this.selected.parentElement.dataset.phone)
  }
}

class App {
  constructor(components, store) {
    this.components = components
    this.store = store
  }

  setComponent(componentName) {
    const Comp = this.components[componentName]
    if (Comp) {
      const thisEl = document.querySelector(`.js-${componentName}`)
      delete this.components[componentName]
      this.components[`${componentName[0].toLowerCase()}${componentName.slice(1)}`] = new Comp(thisEl)
    }
  }

  init() {
    const { menu, phoneView } = this.components
    const { phoneList } = this.store
    menu.init(phoneList)
    phoneView.change(null)
  }

  registerPhone() {
    const { form, modal } = this.components
    const { phoneList } = this.store
    if (!form.validate()) return
    const newPhone = form.submit()
    phoneList.push(newPhone)
    this.init()
    modal.close()
  }

  modifyPhone() {
    const { form, modal } = this.components
    if (!form.validate()) return
    const newPhone = form.submit()
    const { phoneList } = this.store
    const index = phoneList.findIndex(phone => phone.phoneNumber === newPhone.phoneNumber)
    phoneList.splice(index, 1, newPhone)
    this.init()
    modal.close()
  }

  deletePhone() {
    const { selectedPhone, phoneList } = this.store
    const idx = phoneList.findIndex(phone => phone.phoneNumber === selectedPhone.phoneNumber)
    phoneList.splice(idx, 1)
    this.init()
    this.store.selectedPhone = null
  }

  showRegCard() {
    const { modal, form } = this.components
    form.init()
    modal.show({ 
      type: 'RegCard', 
      content: {
        header: '등록하기1',
      }
    })
  }

  showModifyCard() {
    const { modal, form } = this.components
    form.set(this.store.selectedPhone)
    modal.show({ 
      type: 'ModCard', 
      content: {
        header: '수정하기',
      }
    })
  }
  
  closeModal() {
    const { modal } = this.components
    modal.close()
  }
  
  selectPhone(target) {
    const { menu, phoneView } = this.components
    menu.select(target)
    const phone = menu.getSelectedPhone()
    phoneView.change(phone)
    this.store.selectedPhone = phone
  }
}



const makeDummyData = (n) => {
  const text = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique.`
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const firstNumbers = ['010', '017', '018', '016']
  const phoneList = []
  for (let i = 1; i <= n; i++) {
      const first = firstNumbers[Math.floor(Math.random()*10/2.5)]
      const middle = `${Math.random()}`.slice(2, 6)
      const last = `${Math.random()}`.slice(2, 6)
      const phoneNumber = `${first}-${middle}-${last}`

      let name = ''
      for (let i = 1; i <= 5; i++) {
        name += chars[Math.floor(Math.random()*100/3.85)]
      }	

      const idx = Math.floor(Math.random()*100)
      const info = text.slice(idx, idx + 100).trim()
      const user = { name, info, phoneNumber }
      phoneList.push(user)
  }
  return phoneList
}

const store = {
  phoneList: makeDummyData(5),
  selectedPhone: null,
}

const app = new App({
  Form,
  Modal,
  Menu,
  PhoneView,
}, store)

document.querySelectorAll('[class*="js-"]').forEach(el => {
  const componentName = [...el.classList]
    .find(name => name.includes('js-'))
    .replace('js-', '')
  app.setComponent(componentName)
})

document.querySelectorAll('[data-event]').forEach(el => {
  const [event, action] = el.dataset.event.split(';')
  el.addEventListener(event, e => {
    app[action](e.target)
  })
})

app.init()