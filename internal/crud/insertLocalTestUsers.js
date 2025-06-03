const fs = require("fs");
const readline = require("node:readline");

(async () => {
    const users = JSON.parse(fs.readFileSync("../../users.json", "utf-8"));
    const insertUsersIntoDev = new URL(
        "http://localhost:3000/api/admin/insert-users"
    );
    const dbType = "dev";

    const answer = await ask(
        `Your are about to execute a write operation. The targeted database is ${dbType}. Type 'y' to confirm and continue? (y/n)\n`
    );

    if (answer !== "y") {
        console.log("Insertion cancelled.");
        return;
    }

    insertUsersIntoDev.searchParams.set("dbType", dbType);

    const insertUsersIntoDevRes = await fetch(insertUsersIntoDev.href, {
        method: "POST",
        body: JSON.stringify({ users: users, dbType: dbType }),
        headers,
    });
    const insertUsersIntoDevData = await insertUsersIntoDevRes.json();
    console.log("Test users insertion results: ");

    console.log(insertUsersIntoDevData);

    console.log("Users insertion successful.");
})();
