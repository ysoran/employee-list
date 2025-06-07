# Project Setup and Testing Guide

## Running the Application

To start the application in development mode, run:

```bash
npm run dev
````

This will launch the app locally so you can view it in your browser.

---

## Running Tests

To execute all the tests and verify that everything is working correctly, run:

```bash
npx web-test-runner
```

This will run your test suite and show the results in the console.

---

## Checking Test Coverage

To see detailed test coverage reports that show how much of your code is tested, run:

```bash
npx web-test-runner --coverage
```

After running this command, you'll get a coverage summary in the console, and a detailed HTML report will be generated in the `coverage/lcov-report` directory.

---

