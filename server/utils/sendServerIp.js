const { start } = require("repl");

// Function to get local IP address
function getLocalIP() {
  const interfaces = require("os").networkInterfaces();
  for (const interfaceName in interfaces) {
    const interface = interfaces[interfaceName];
    for (const iface of interface) {
      if (!iface.internal && iface.family === "IPv4") {
        return iface.address;
      }
    }
  }
  return "127.0.0.1"; // fallback to localhost if no IP found
}

// Function to send beacon signal
async function sendBeaconSignal() {
  try {
    const localIP = getLocalIP();
    const response = await axios.post("https://beacon.korpsin.in/beacon", {
      device_id: "server",
      local_ip: localIP,
    });
    console.log(
      `Beacon signal sent successfully at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error("Failed to send beacon signal:", error.message);
  }
}

// Start periodic beacon signaling
function startBeaconSignaling() {
  // Send initial beacon signal
  sendBeaconSignal();

  // Set up interval for every 15 minutes (900,000 milliseconds)
  setInterval(sendBeaconSignal, 15 * 60 * 1000);
}

module.exports = startBeaconSignaling;