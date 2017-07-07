let script = require('./script.js')
let data = require('./test_data.js')
let constants = require("./const")

test('parseSalary() should work', () => {
  let string = 'Web Developer in HTML5 - 80.000 CZK/month'
  expect(script.parseSalary(string)).toBe(80000)

  string = 'Frontend Developer (1 000 CZK/month)'
  expect(script.parseSalary(string)).toBe(1000)

  string = 'HTML5/JavaScript Apps Developer (910.000 CZK/mesicne)'
  expect(script.parseSalary(string)).toBe(910000)

  string = 'Front-end Developer 1 000 EUR/mesacne'
  expect(script.parseSalary(string)).toBe(1000)
})

test('parseSalary() shouldnt fail', () => {
  let string = 'No numbers'
  expect(script.parseSalary(string)).toBe(false)
})

test('printResults() should work', () => {
  let output = ''
  let expected = "Based on 73 offers:2014Q2;10;723102014Q3;8;700252014Q4;9;895002015Q1;20;821852015Q2;26;75085"
  let printer = function(s) {
    output = output + s
  }
  script.printResults(data.quarters, printer)

  expect(output).toBe(expected)
})

test('formatDetails() should work', () => {
  let result = script.formatDetails(data.details)
  const expected = [
    {year: 2015, month: 1, salary: 50000, quarter: 1},
    {year: 2015, month: 6, salary: 140000, quarter: 2},
    {year: 2015, month: 8, salary: 100000, quarter: 3},
    {year: 2015, month: 12, salary: 2800*constants.EUR_CZK_RATIO, quarter: 4}]
  expect(result).toEqual(expected)
})

test('computeQuarters() should work', () => {
  let result = script.computeQuarters(data.data)
  const expected = {
    '2014Q1': { offers: 1, average: 100000 },
    '2014Q2': { offers: 2, average: 95000 },
    '2014Q3': { offers: 2, average: 80000 },
    '2014Q4': { offers: 1, average: 100000 }}
  expect(result).toEqual(expected)
})
