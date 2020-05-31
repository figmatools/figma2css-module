const assert = require('assert')
const fs = require('fs')
const transformCss = require('../figma2css-module')

const tests = {
  transformCss: async () => {
    let data = await fs.readFileSync('./test-data', 'utf-8')
    data = JSON.parse(data)
    let result = transformCss(data['1:15'].document)
    try {
      assert.ok(result.match(/\.button/), 'transform to css')
    }catch(err) { console.error(err) }
  }
}

const runTest = async () =>  {
  if(process.argv[2]) 
    tests[process.argv[2]]()
  else 
    Object.keys(tests).forEach((key) => tests[key]())
}

runTest()
