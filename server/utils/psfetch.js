const { exec } = require("child_process");

function fetchWithPowerShell(url) {
  return new Promise((resolve, reject) => {
    const cmd = `powershell -Command "try { $r = Invoke-WebRequest -Uri '${url}' -UseBasicParsing; $r.Content } catch { exit 1 }"`;
    exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error("PowerShell fetch failed"));
      resolve(stdout.trim());
    });
  });
}

module.exports = { fetchWithPowerShell };
