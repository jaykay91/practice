class Component {
  constructor(self) {
    this.self = self
    const selector = [...this.self.classList].find(name => name.startsWith('js-'))
    this.targets = [...document.querySelectorAll(`[data-targeted^="${selector}"]`)]
      .reduce((acc, el) => {
        const [_, name] = el.dataset.targeted.split(';')
        acc[name] = el
        return acc
      }, {})
  }
}

class Message extends Component {
  toggle(content) {
    if (content) {
      const { header, body } = this.targets
      header.textContent = content.title
      body.textContent = content.body
    }
    this.self.classList.toggle('is-active')
  }
}

class Modal extends Component {
  toggle() {
    this.self.classList.toggle('is-active')
  }
}

class Content extends Component {
  selectedPhone = null

  change(phone) {
    const { info } = this.targets
    info.innerHTML = `
      <strong>${phone.phoneNumber}</strong>
      <p>${phone.name}</p>
      <p>${phone.info}</p>
    `
    this.selectPhone = phone
  }  

}

class Menu extends Component {
  selected = null

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
    target.classList.add('is-active')
    this.selected = target
  }

  getSelectedPhone() {
    return this.selected && JSON.parse(this.selected.parentElement.dataset.phone)
  }
}

class ActionMap {
  constructor(components, store) {
    this.components = components
    this.store = store
  }

  setComponent(componentName) {
    const Comp = this.components[componentName]
    if (Comp) {
      const thisEl = document.querySelector(`.js-${componentName}`)
      delete this.components[componentName]
      this.components[componentName.toLowerCase()] = new Comp(thisEl)
    }
  }

  init() {
    const { menu } = this.components
    const { phoneList } = this.store
    for (const phone of phoneList) {
      menu.add(phone)
    }
  }

  registerPhone() {
    // const { modal } = this.components
    // modal.toggle()    
  }

  toggleModal() {
    const { modal } = this.components
    modal.toggle()
  }
  
  showMessage() {
    const { message } = this.components
    message.toggle({
      title: 'Hello, Modal!',
      body: 'Good!',
    })
  }

  closeMessage() {
    const { message } = this.components
    message.toggle()
  }

  selectPhone(target) {
    const { menu, content } = this.components
    menu.select(target)
    const phone = menu.getSelectedPhone()
    content.change(phone)
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
  phoneList: makeDummyData(10),
  
}

const actionMap = new ActionMap({
  Modal,
  Message,
  Menu,
  Content,
}, store)

document.querySelectorAll('[class*="js-"]').forEach(el => {
  const componentName = [...el.classList]
    .find(name => name.includes('js-'))
    .replace('js-', '')
  actionMap.setComponent(componentName)
})

document.querySelectorAll('[data-event]').forEach(el => {
  const [event, action] = el.dataset.event.split(';')
  el.addEventListener(event, e => {
    actionMap[action](e.target)
  })
})

actionMap.init()