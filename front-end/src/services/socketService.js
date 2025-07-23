import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.user = null;
    this.connectionCallbacks = [];
    this.disconnectionCallbacks = [];
  }

  connect(user) {
    this.user = user;

    if (!this.socket) {
      this.socket = io("http://localhost:9999", {
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        maxHttpBufferSize: 1e8,
        timeout: 20000,
      });

      this.setupEventListeners();
    }
    return this.socket;
  }

  setupEventListeners() {
    this.socket.on("connect", () => {
      console.log("✅ Connected to server");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay

      // Join user-specific rooms
      if (this.user) {
        this.socket.emit("join", {
          userId: this.user.id,
          role: this.user.role,
          branchId: this.user.branchId,
        });
        console.log(`👤 Joined rooms for user ${this.user.id}`);
      }

      // Notify connection callbacks
      this.connectionCallbacks.forEach((callback) => callback());
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      this.isConnected = false;

      // Notify disconnection callbacks
      this.disconnectionCallbacks.forEach((callback) => callback(reason));
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔥 Connection error:", error);
      this.isConnected = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("⚠️ Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("🔥 Reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("💀 Reconnection failed - all attempts exhausted");
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.user = null;
      console.log("🔌 Socket manually disconnected");
    }
  }

  // Listen for new notifications
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on("newNotification", (notification) => {
        console.log("📬 New notification received:", notification);
        callback(notification);
      });
    }
  }

  // Remove notification listener
  offNewNotification() {
    if (this.socket) {
      this.socket.off("newNotification");
    }
  }

  // Add connection status listeners
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  onDisconnection(callback) {
    this.disconnectionCallbacks.push(callback);
  }

  // Remove connection listeners
  offConnectionChange(callback) {
    this.connectionCallbacks = this.connectionCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  offDisconnection(callback) {
    this.disconnectionCallbacks = this.disconnectionCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  // Manual reconnection
  reconnect() {
    if (this.socket) {
      console.log("🔄 Manual reconnection attempt");
      this.socket.connect();
    }
  }

  // Emit events with error handling
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      return true;
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
      return false;
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Get connection info
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      hasSocket: !!this.socket,
      socketConnected: this.socket ? this.socket.connected : false,
      user: this.user,
    };
  }
}

export default new SocketService();
