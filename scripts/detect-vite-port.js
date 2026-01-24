#!/usr/bin/env node

/**
 * Helper script to detect which port Vite is using
 * Reads from Vite's output or checks common ports
 */

const { execSync } = require('child_process');
const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

async function findVitePort() {
  // Common Vite ports
  const ports = [5173, 5174, 5175, 5176, 3000];
  
  for (const port of ports) {
    try {
      // Try to connect to see if something is listening
      const isAvailable = await checkPort(port);
      if (!isAvailable) {
        // Port is in use, might be Vite
        console.log(port);
        return port;
      }
    } catch (error) {
      // Continue to next port
    }
  }
  
  // Default to 5173
  console.log(5173);
  return 5173;
}

findVitePort().catch(() => {
  console.log(5173); // Fallback
});
