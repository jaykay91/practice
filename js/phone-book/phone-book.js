class Component {
  constructor(self) {
    this.self = self
    this.targets = [...self.querySelectorAll('[data-targeted]')]
      .reduce((acc, el) => {
        acc[el.dataset.targeted] = el
        return acc
      }, {})
  }
}

class ActionMap {
  constructor(components) {
    this.components = components
  }

  setComponent(componentName) {
    const Comp = this.components[componentName]
    if (Comp) {
      const thisEl = document.querySelector(`.js-${componentName}`)
      this.components[componentName] = new Comp(thisEl)
    }
  }

  
}

const actionMap = new ActionMap({
})

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
