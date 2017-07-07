var exports = module.exports = {}

exports.details = [
  { date: new Date(2015, 0, 27), salary: 50000, currency: 'KC' },
  { date: new Date(2015, 5, 22), salary: 140000, currency: 'CZK' },
  { date: new Date(2015, 7, 23), salary: 100000, currency: 'CZK' },
  { date: new Date(2015, 11, 21), salary: 2800, currency: 'EUR' }]

exports.data = [
  { year: 2014, month: 2, quarter: 1, salary: 100000 },
  { year: 2014, month: 4, quarter: 2, salary: 100000 },
  { year: 2014, month: 4, quarter: 2, salary: 90000 },
  { year: 2014, month: 8, quarter: 3, salary: 110000 },
  { year: 2014, month: 9, quarter: 3, salary: 50000 },
  { year: 2014, month: 10, quarter: 4, salary: 100000 }]

exports.quarters = {
  '2014Q2': { offers: 10, average: 72310 },
  '2014Q3': { offers: 8, average: 70025 },
  '2014Q4': { offers: 9, average: 89500 },
  '2015Q1': { offers: 20, average: 82185 },
  '2015Q2': { offers: 26, average: 75085 }
}
