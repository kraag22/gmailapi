This node app connects to gmail account and downloads all messages with given string
in subject. After that it analyzes CZK/EUR salaries from it and groups them it to the quarters
with average salaries.

    node run app
    node run test
    node run watch

App needs credentials file created (client_secret.json). It can be created in google
API console (https://console.developers.google.com/apis/dashboard)
