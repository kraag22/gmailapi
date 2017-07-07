let script = require("./script")
let api = require("./api")
let constants = require("./const")

async function run() {

  let auth = await api.main()

  let messages = await api.search(auth, constants.COMPANY_NAME)

  let details = await script.getAllMessages(auth, messages)

  let data = script.formatDetails(details)

  let quarters = script.computeQuarters(data)

  script.printResults(quarters, console.log)
}

run()
