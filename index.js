// Import the ws library
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const usersController = require("./server/controller/users-controller");
const rolesController = require("./server/controller/roles-controller");
const authController = require("./server/controller/auth-controller");
const timetablesController = require("./server/controller/timetables-controller");
const departmentsController = require("./server/controller/deprtments-controller");
const shiftController = require("./server/controller/shift-controller");

const controllers = {
  auth: authController,
  users: usersController,
  roles: rolesController,
  timetables: timetablesController,
  departments: departmentsController,
  shifts: shiftController,
};

const port = 1000;

// Create a new WebSocket server instance
const wss = new WebSocket.Server({ port });

// Event handler for new WebSocket connections
wss.on("connection", (ws) => {
  console.log("New client connected");

  // Event handler for incoming messages
  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data);

    if (parsedData.type === "html") {
      const filePath = path.join(__dirname, `../frontend/pages/${parsedData.name}.html`);

      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        // Send the HTML file content to the client
        ws.send(JSON.stringify({ type: "html", data }));
      });
    }

    // HANDLING INCOMING QUERY
    if (parsedData.type === "query") {
      const data = await controllers[parsedData.name][parsedData.method](
        parsedData.req
      );

      ws.send(
        JSON.stringify({
          type: `${parsedData.name}-query-response`,
          data,
        })
      );
    }

    // Send a response back to the client
    // ws.send(`Server received: ${data}`);
  });

  // Event handler for WebSocket connection close
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on port " + port);
