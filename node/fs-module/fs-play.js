const fs = require('fs').promises
const p = require('path')

const readdirR = async path => {
  const files = await fs.readdir(path)
  const newFiles = []

  for (const file of files) {
    const newPath = p.join(path, file)
    const stat = await fs.stat(newPath)
    if (stat.isDirectory()) {
      const dirFiles = await readdirR(newPath)
      newFiles.push(dirFiles)
      continue
    }
    newFiles.push(file)
  }

  return newFiles
}

;(async () => {
  try {
    const files = await readdirR('./')
    console.dir(files, { depth: 4 })
    

  } catch (err) {
    console.error(err)
  }
})()