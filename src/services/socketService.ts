/**
 * SocketIO Service Class
 * Encapsulates all WebSocket communication logic with Flask backend
 * Provides reactive state and typed event handlers for Vue components
 */
import { ref, type Ref } from "vue";
import { io, type Socket, type SocketOptions } from "socket.io-client";

// --------------------------
// Type Definitions (Shared with Component)
// --------------------------
export interface BaseMessage {
    msg: string;
    time: string; // '%H:%M:%S'
    type: "user" | "room" | "notification";
}

export interface UserMessage extends BaseMessage {
    user_id: string;
    type: "user";
}

export interface RoomMessage extends BaseMessage {
    room_id: string;
    type: "room";
}

export interface RoomNotification extends BaseMessage {
    room_id: string;
    type: "notification";
}

export type AppMessage = UserMessage | RoomMessage | RoomNotification;

interface AuthPayload {
    user_id: string;
}

interface RoomPayload {
    room_id: string;
}

// --------------------------
// Socket Service Class
// --------------------------
export class SocketService {
    // Reactive State (exposed for component binding)
    public isConnected: Ref<boolean> = ref(false);
    public authStatus: Ref<string> = ref("");
    public authError: Ref<string> = ref("");
    public roomStatus: Ref<string> = ref("");
    public roomError: Ref<string> = ref("");
    public messages: Ref<AppMessage[]> = ref([]);

    // Private State
    private socket: Socket | null = null;
    private baseUrl: string = "";
    private options: SocketOptions;
    private userId: Ref<string> = ref(""); // Reactive user ID (bound to component)

    /**
     * Initialize SocketIO service
     * @param baseUrl - Flask backend URL (e.g., 'http://127.0.0.1:5001')
     * @param userId - Reactive user ID ref from component
     * @param options - SocketIO client options (optional)
     */
    constructor(options: SocketOptions) {
        this.options = options;

        // Initialize socket connection
        // this.initSocket();
    }

    // --------------------------
    // Core Socket Methods
    // --------------------------
    /** Initialize SocketIO connection and event listeners */
    public initSocket(baseUrl: string): void {
        this.baseUrl = baseUrl;
        try {
            this.socket = io(this.baseUrl, this.options);
            this.setupEventListeners();
        } catch (error) {
            console.error("❌ Failed to initialize SocketIO:", error);
            this.authError.value = "Failed to connect to WebSocket server";
        }
    }

    /** Setup all SocketIO event listeners */
    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection Events
        this.socket.on("connect", this.handleConnect.bind(this));
        this.socket.on("disconnect", this.handleDisconnect.bind(this));
        this.socket.on("connect_error", this.handleConnectError.bind(this));

        // Authentication Events
        this.socket.on("connect_ack", this.handleConnectAck.bind(this));
        this.socket.on("auth_success", this.handleAuthSuccess.bind(this));
        this.socket.on("auth_error", this.handleAuthError.bind(this));

        // Room Events
        this.socket.on("room_success", this.handleRoomSuccess.bind(this));
        this.socket.on("room_error", this.handleRoomError.bind(this));
        this.socket.on(
            "room_notification",
            this.handleRoomNotification.bind(this),
        );

        // Message Events
        // this.socket.on("private_message", this.handleUserMessage.bind(this));
        this.socket.on("private_message", (data: UserMessage) => {
            console.log("Received private message:", data);
            // Emit a custom Vue event to pass data to components
            window.dispatchEvent(
                new CustomEvent("private-message-received", { detail: data }),
            );
            this.handleUserMessage(data);
        });
        this.socket.on("room_message", this.handleRoomMessage.bind(this));
    }

    /** Clean up SocketIO connection and event listeners */
    public destroy(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket.off("connect", this.handleConnect.bind(this));
            this.socket.off("disconnect", this.handleDisconnect.bind(this));
            this.socket = null;
        }
        // Reset reactive state
        this.isConnected.value = false;
        this.authStatus.value = "";
        this.authError.value = "";
        this.roomStatus.value = "";
        this.roomError.value = "";
        console.log("🔌 SocketIO service cleaned up");
    }

    // --------------------------
    // Event Handlers (Private)
    // --------------------------
    private handleConnect(): void {
        console.log("✅ SocketIO connection established");
        this.isConnected.value = true;
        this.authError.value = "";
        this.roomError.value = "";
        // Auto-authenticate if user ID is set
        if (this.userId.value.trim()) {
            this.authenticateUser(this.userId);
        }
    }

    private handleDisconnect(reason: string): void {
        console.log("❌ SocketIO disconnected:", reason);
        this.isConnected.value = false;
        this.authStatus.value = "";
        this.roomStatus.value = "";
        // Auto-reconnect if disconnected by server
        if (reason === "io server disconnect" && this.socket) {
            this.socket.connect();
        }
    }

    private handleConnectError(error: Error): void {
        console.error("❌ SocketIO connection error:", error.message);
        this.authError.value = `Connection failed: ${error.message}`;
    }

    private handleConnectAck(data: { msg: string; sid: string }): void {
        console.log("📩 Connection acknowledgment:", data);
    }

    private handleAuthSuccess(data: { msg: string }): void {
        console.log("✅ Authentication successful:", data);
        this.authStatus.value = data.msg;
        this.authError.value = "";
    }

    private handleAuthError(data: { msg: string }): void {
        console.error("❌ Authentication failed:", data);
        this.authStatus.value = "";
        this.authError.value = data.msg;
    }

    private handleRoomSuccess(data: { msg: string }): void {
        console.log("🏠 Room operation successful:", data);
        this.roomStatus.value = data.msg;
        this.roomError.value = "";
    }

    private handleRoomError(data: { msg: string }): void {
        console.error("❌ Room operation failed:", data);
        this.roomStatus.value = "";
        this.roomError.value = data.msg;
    }

    private handleRoomNotification(data: Omit<RoomNotification, "type">): void {
        console.log("🔔 Room notification:", data);
        this.messages.value.push({
            ...data,
            type: "notification" as const,
        });
        // Force reactivity refresh
        this.messages.value = [...this.messages.value];
    }

    private handleUserMessage(data: UserMessage): void {
        console.log("📥 Received user-specific message:", data);
        this.messages.value.push(data);
        this.messages.value = [...this.messages.value];
    }

    private handleRoomMessage(data: RoomMessage): void {
        console.log("📥 Received room-specific message:", data);
        this.messages.value.push(data);
        this.messages.value = [...this.messages.value];
    }

    // --------------------------
    // Public API (Called by Component)
    // --------------------------
    /**
     * Authenticate user with backend
     * @param userId - user ID
     */
    public authenticateUser(userId: Ref<string>): void {
        this.userId = userId;
        if (!this.socket) {
            this.authError.value =
                "Please wait for socket connection to complete";
            return;
        }

        const userToAuth = userId.value.trim() || this.userId.value.trim();
        if (!userToAuth) {
            this.authError.value = "Please enter a valid user ID";
            return;
        }

        const authPayload: AuthPayload = { user_id: userToAuth };
        this.socket.emit("user_auth", authPayload);
        this.authStatus.value = "Authenticating...";
    }

    /**
     * Join a room
     * @param roomId - Room ID to join
     */
    public joinRoom(roomId: string): void {
        if (!this.socket) {
            this.roomError.value =
                "Please wait for socket connection to complete";
            return;
        }

        if (!this.authStatus.value) {
            this.roomError.value = "Please authenticate before joining a room";
            return;
        }

        const roomToJoin = roomId.trim();
        if (!roomToJoin) {
            this.roomError.value = "Please enter a valid room ID";
            return;
        }

        const roomPayload: RoomPayload = { room_id: roomToJoin };
        this.socket.emit("join_room", roomPayload);
        this.roomStatus.value = `Joining room ${roomToJoin}...`;
    }

    /**
     * Leave a room
     * @param roomId - Room ID to leave
     */
    public leaveRoom(roomId: string): void {
        if (!this.socket) {
            this.roomError.value =
                "Please wait for socket connection to complete";
            return;
        }

        if (!this.authStatus.value) {
            this.roomError.value = "Please authenticate before leaving a room";
            return;
        }

        const roomToLeave = roomId.trim();
        if (!roomToLeave) {
            this.roomError.value = "Please enter a valid room ID";
            return;
        }

        const roomPayload: RoomPayload = { room_id: roomToLeave };
        this.socket.emit("leave_room", roomPayload);
        this.roomStatus.value = `Leaving room ${roomToLeave}...`;
    }
}

// --------------------------
// Factory Function (Optional - For Easy Instantiation)
// --------------------------
/**
 * Create a SocketService instance (helper function)
 * @param userId - Reactive user ID ref from component
 * @returns SocketService instance
 */
export function createSocketService(
    options: SocketOptions = {
        retries: Infinity,
        ackTimeout: 5000,
    },
): SocketService {
    return new SocketService(options);
}
