const secrets = require('../../secrets');
const fs = require('fs');
const readline = require('node:readline');

function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

(async () => {
  try {
    const headers = {
      Authorization: `Bearer ${secrets.TOKEN}`,
    };
    console.log('headers: ', headers);
    const url = new URL('http://localhost:3000/api/admin/get-all-raw-users');

    url.searchParams.set('dbType', 'production');

    const res = await fetch(url.href, {
      headers,
    });
    const data = await res.json();

    if (!data.users.length) {
      throw new Error("Can't get the target users from the db.");
    }

    console.log('data: ', data.users.length);

    const usersString = JSON.stringify(data.users, null, 2);

    fs.writeFileSync('../../users.json', usersString);

    console.log('Wrote users to users.json');

    const insertUsersIntoDev = new URL(
      'http://localhost:3000/api/admin/insert-users'
    );
    const dbType = 'dev';

    const answer = await ask(
      `Your are about to execute a write operation. The targeted database is ${dbType}. Type 'y' to confirm and continue? (y/n)\n`
    );

    if (answer !== 'y') {
      console.log('Insertion cancelled.');
      return;
    }

    insertUsersIntoDev.searchParams.set('dbType', dbType);

    const insertUsersIntoDevRes = await fetch(insertUsersIntoDev.href, {
      method: 'POST',
      body: JSON.stringify({ users: data.users, dbType: dbType }),
      headers,
    });
    const insertUsersIntoDevData = await insertUsersIntoDevRes.json();
    console.log('Test users insertion results: ');

    console.log(insertUsersIntoDevData);

  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
