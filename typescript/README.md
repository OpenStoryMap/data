# Setup

```
npm install
```

You can optionally use a Census API key if you are making over 500 requests per day. [Request API key here](https://api.census.gov/data/key_signup.html). You may have to wait a while to receive an email with your API key. After you get the email, copy `config.template.json` into a new file `config.json` in the same directory and add your API key.

# Running

```
npx ts-node nyc-heat-watch-2021
```

Respective data will be exported to the `export` directory.
