import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

/**
 * Create and configure SignalR connection to notifications hub
 * @param token JWT token for authentication
 * @returns HubConnection instance
 */
export function createSignalRConnection(token: string): signalR.HubConnection {
  connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5211/hubs/notifications", {
      accessTokenFactory: () => token,
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

/**
 * Get the current connection instance
 * @returns HubConnection or null if not initialized
 */
export function getConnection(): signalR.HubConnection | null {
  return connection;
}

/**
 * Start the SignalR connection
 * @returns Promise that resolves when connection is established
 */
export async function startConnection(): Promise<void> {
  if (!connection) {
    throw new Error(
      "Connection not initialized. Call createSignalRConnection first.",
    );
  }

  try {
    await connection.start();
    console.log("SignalR connected");
  } catch (err) {
    console.error("SignalR connection error:", err);
    throw err;
  }
}

/**
 * Stop the SignalR connection
 * @returns Promise that resolves when connection is stopped
 */
export async function stopConnection(): Promise<void> {
  if (connection) {
    try {
      await connection.stop();
      console.log("SignalR disconnected");
    } catch (err) {
      console.error("SignalR disconnect error:", err);
    }
    connection = null;
  }
}

/**
 * Register a listener for incoming notifications
 * @param callback Function to call when notification is received
 */
export function onReceiveNotification(
  callback: (notification: any) => void,
): void {
  if (connection) {
    connection.on("ReceiveNotification", callback);
  }
}

/**
 * Register a listener for connection established event
 * @param callback Function to call when connection is established
 */
export function onConnected(callback: () => void): void {
  if (connection) {
    connection.onreconnected = callback;
  }
}

/**
 * Register a listener for connection closed event
 * @param callback Function to call when connection is closed
 */
export function onDisconnected(callback: (error?: Error) => void): void {
  if (connection) {
    connection.onclose = callback;
  }
}
