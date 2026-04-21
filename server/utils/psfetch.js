const { spawn } = require("child_process");

function fetchWithPowerShell(url) {
  return new Promise((resolve, reject) => {
    const ps = spawn("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `Invoke-WebRequest -Uri '${url}' -UseBasicParsing | Select-Object -ExpandProperty Content`,
    ]);

    let stdout = "";
    let stderr = "";

    ps.stdout.on("data", (data) => (stdout += data));
    ps.stderr.on("data", (data) => (stderr += data));

    const timer = setTimeout(() => {
      ps.kill();
      reject(new Error("PowerShell timeout"));
    }, 30000);

    ps.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        return reject(new Error(`PowerShell failed (code ${code}): ${stderr.trim()}`));
      }
      resolve(stdout.trim());
    });

    ps.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

module.exports = { fetchWithPowerShell };
