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
    const dbType = 'dev';
    const answer = await ask(
      `The targeted database is ->'${dbType.toUpperCase()}'<-. Type 'y' to confirm and continue with users deletion? (y/n)\n`
    );

    if (answer !== 'y') {
      console.log('Users deletion cancelled.');
      return;
    }

    // read from the users.json file
    const users = JSON.parse(fs.readFileSync('../../users.json', 'utf-8'));
    const url = new URL('http://localhost:3000/api/admin/delete-users');
    const headers = {
      Authorization: `Bearer ${secrets.TOKEN}`,
    };

    console.log('headers: ', headers);

    for (const user of users) {
      url.searchParams.append('userIds', encodeURIComponent(user._id));
    }

    url.searchParams.set('dbType', dbType);

    const usersDeletionResultRes = await fetch(url.href, {
      method: 'DELETE',
      headers,
    });

    if (usersDeletionResultRes.status !== 200) {
      throw new Error(
        `An error has occurred during users deletion. Status code: ${usersDeletionResultRes.status}`
      );
    }

    console.log('Users deletion successful. Status code: ', usersDeletionResultRes.status);

  } catch (error) {
    console.error('An error has occurred during users deletion: ', error);
  }
})();
