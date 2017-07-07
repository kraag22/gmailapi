var api = require("./api")
let constants = require("./const")

var exports = module.exports = {}

exports.computeQuarters = function computeQuarters(data) {
  let quarters = {}

  data.forEach(item => {
    let label = item.year + 'Q' + item.quarter
    if (!quarters[label]) {
      quarters[label] = []
    }

    quarters[label].push(item.salary)
  })

  let labels = Object.keys(quarters)

  labels.forEach(label => {
    quarters[label] = {
      offers: quarters[label].length,
      average: Math.round(quarters[label].reduce((a, b) => a + b) / quarters[label].length)
    }
  })

  return quarters
}

exports.formatDetails = function formatDetails(details) {
  return details.map(detail => {
    return {
      year: detail.date.getFullYear(),
      month: (detail.date.getMonth() + 1),
      quarter: Math.floor(detail.date.getMonth() / 3) + 1,
      salary: detail.currency === 'EUR' ? Math.round(detail.salary * constants.EUR_CZK_RATIO) : detail.salary
    }
  })
}

exports.getAllMessages = async function getAllMessages(auth, messages) {
  let batchSize = 100
  let result = []

  while (messages.length > 0) {
    let batchIds = popIds(messages, batchSize)
    let batchResult = await getBatch(auth, batchIds)

    result = result.concat(batchResult)
    console.log('processed:', result.length)
  }

  return result
}

exports.printResults = function printResults(data, printer) {
  let keys = Object.keys(data)
  let toPrint = []
  let offers = 0

  keys.forEach(key => {
    offers += data[key].offers
    toPrint.push(key+';'+data[key].offers+';'+data[key].average)
  })

  printer('Based on ' + offers + ' offers:')
  toPrint.forEach(item => {
    printer(item)
  })
}

function popIds(messages, batchSize) {
  let batch = []
  for (let i=0; i < batchSize; i++) {
    let message = messages.pop()
    if (message) {
      batch.push(message)
    } else {
      break;
    }
  }
  return batch.map(item => {
    return item.id
  })
}

function getBatch(auth, ids) {
  promises = []
  ids.forEach(id => {
    promises.push(api.getMessage(auth, id))
  })

  return Promise.all(promises).then( values => parseBatch(values))
}

function parseSalary(string) {
  let res = string.match(/[0-9 .]{4,10}/)
  if (res && res.length > 0) {
    return parseInt(res[0].replace(/[^0-9]*/g, ''))
  } else {
    return false
  }
}

exports.parseSalary = parseSalary

function parseBatch(values) {
  let result = values.map( item => {
    let parsed = {}
    item.payload.headers.forEach(header => {
      if (header.name === 'Subject') {
        parsed.subject = header.value
      }

      if (header.name === 'Date') {
        parsed.date = header.value
      }
    })
    return parsed
  })

  result = result.map(res => {
    let date = new Date(res.date)
    let salary = parseSalary(res.subject)
    let currency = false
    let currencies = ['KČ', 'KC', 'CZK', 'EUR']
    currencies.forEach(curr => {
      if (res.subject.toLocaleUpperCase().includes(curr)) {
        currency = curr
      }
    })

    return {date, salary, currency}
  })

  result = result.filter(item => {
    return Number.isInteger(item.salary) && item.currency
  })

  return result
}
