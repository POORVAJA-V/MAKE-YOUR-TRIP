const { execSync } = require('child_process');
try {
    console.log("Starting test script...");
    const out = execSync("node server.js", { encoding: "utf8", stdio: "pipe" });
    console.log("APP OUT:", out);
} catch (e) {
    console.log("APP FAILED");
    console.log("STATUS:", e.status);
    console.log("STDOUT:", e.stdout);
    console.log("STDERR:", e.stderr);
}
