How to setup the backend:

1. `npm install mongoose` if `mongoose` is not installed.

2. If the `dotenv` package is not installed, then run the following command: `npm install dotenv`.

3. Create .env.local file.

4. Add the .env.local file to your .gitignore.

5. Create the following variables in the above file:
- MONGODB_USER
- MONGODB_PASSWORD
- MONGODB_DB_NAME

Contact Matt or Gabe for the values.


Running the backend test for insertions or any backend-related tests: 

1. Install `Jest runner` from the VS code extensions.

2. If the `dotenv` package is not installed, then run the following command: `npm install dotenv`. 

2. Go to lessonInsertion.test.js (or the target file), and click on 'run' to execute the test. 