const transformCss = require('./figma2css-module')
const fs = require('fs')

const run = async () => {
  let data = await fs.readFileSync('./test-data', 'utf-8')
  let result = transformCss(JSON.parse(data))
  console.log('result: ', result)
}

run()
