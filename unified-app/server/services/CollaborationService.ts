import { EventEmitter } from 'events';
import { Server as SocketIOServer, Socket } from 'socket.io';
import * as Y from 'yjs';
import { WebSocket } from 'ws';

interface CollaborationRoom {
  id: string;
  projectId: string;
  participants: Map<string, Participant>;
  ydoc: Y.Doc;
  createdAt: Date;
  lastActivity: Date;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  cursor?: {
    line: number;
    column: number;
    file?: string;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
    file?: string;
  };
  color: string;
  socket: Socket;
  joinedAt: Date;
}

interface CodeChange {
  type: 'insert' | 'delete' | 'replace';
  position: { line: number; column: number };
  content: string;
  file: string;
  userId: string;
  timestamp: Date;
}

export class CollaborationService extends EventEmitter {
  private io: SocketIOServer;
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ];
  private colorIndex = 0;

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    this.initialize();
  }

  private initialize() {
    console.log('🤝 Collaboration Service initialized');

    // Clean up inactive rooms every 10 minutes
    setInterval(() => {
      this.cleanupInactiveRooms();
    }, 10 * 60 * 1000);
  }

  handleConnection(socket: Socket, projectId: string) {
    const roomId = `project-${projectId}`;
    const userId = socket.id;
    const userName = this.extractUserName(socket);

    console.log(`👤 User ${userName} joining project ${projectId}`);

    // Get or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId, projectId);
    }

    // Create participant
    const participant: Participant = {
      id: userId,
      name: userName,
      avatar: this.generateAvatar(userName),
      color: this.getNextColor(),
      socket,
      joinedAt: new Date()
    };

    // Add participant to room
    room.participants.set(userId, participant);
    room.lastActivity = new Date();

    // Join Socket.IO room
    socket.join(roomId);

    // Send initial state to new participant
    socket.emit('collaboration:joined', {
      roomId,
      projectId,
      participantId: userId,
      participants: Array.from(room.participants.values()).map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        color: p.color,
        cursor: p.cursor,
        selection: p.selection
      }))
    });

    // Notify other participants
    socket.to(roomId).emit('collaboration:participant-joined', {
      participant: {
        id: participant.id,
        name: participant.name,
        avatar: participant.avatar,
        color: participant.color
      }
    });

    // Handle code changes
    socket.on('code:change', (data: CodeChange) => {
      this.handleCodeChange(socket, roomId, data);
    });

    // Handle cursor movement
    socket.on('cursor:move', (data) => {
      this.handleCursorMove(socket, roomId, data);
    });

    // Handle text selection
    socket.on('selection:change', (data) => {
      this.handleSelectionChange(socket, roomId, data);
    });

    // Handle file operations
    socket.on('file:create', (data) => {
      this.handleFileCreate(socket, roomId, data);
    });

    socket.on('file:delete', (data) => {
      this.handleFileDelete(socket, roomId, data);
    });

    socket.on('file:rename', (data) => {
      this.handleFileRename(socket, roomId, data);
    });

    // Handle chat messages
    socket.on('chat:message', (data) => {
      this.handleChatMessage(socket, roomId, data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnect(socket, roomId, userId);
    });

    this.emit('participant-joined', { roomId, participant });
  }

  private createRoom(roomId: string, projectId: string): CollaborationRoom {
    const ydoc = new Y.Doc();

    const room: CollaborationRoom = {
      id: roomId,
      projectId,
      participants: new Map(),
      ydoc,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set(roomId, room);
    console.log(`🏠 Created collaboration room: ${roomId}`);
    return room;
  }

  private handleCodeChange(socket: Socket, roomId: string, change: CodeChange) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    // Update room activity
    room.lastActivity = new Date();

    // Apply change to Yjs document
    const ytext = room.ydoc.getText(change.file);

    try {
      // Calculate position in text
      const lines = ytext.toString().split('\n');
      let position = 0;
      for (let i = 0; i < change.position.line; i++) {
        position += lines[i]?.length || 0;
        position += 1; // for newline
      }
      position += change.position.column;

      // Apply the change
      switch (change.type) {
        case 'insert':
          ytext.insert(position, change.content);
          break;
        case 'delete':
          ytext.delete(position, change.content.length);
          break;
        case 'replace':
          ytext.delete(position, change.content.length);
          ytext.insert(position, change.content);
          break;
      }
    } catch (error) {
      console.error('Error applying code change:', error);
    }

    // Broadcast to other participants
    socket.to(roomId).emit('code:change-received', {
      ...change,
      userId: socket.id,
      userName: participant.name,
      userColor: participant.color
    });

    this.emit('code-changed', { roomId, change, participant });
  }

  private handleCursorMove(socket: Socket, roomId: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    participant.cursor = data.cursor;
    room.lastActivity = new Date();

    // Broadcast cursor position to other participants
    socket.to(roomId).emit('cursor:move-received', {
      userId: socket.id,
      userName: participant.name,
      userColor: participant.color,
      cursor: data.cursor
    });
  }

  private handleSelectionChange(socket: Socket, roomId: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    participant.selection = data.selection;
    room.lastActivity = new Date();

    // Broadcast selection to other participants
    socket.to(roomId).emit('selection:change-received', {
      userId: socket.id,
      userName: participant.name,
      userColor: participant.color,
      selection: data.selection
    });
  }

  private handleFileCreate(socket: Socket, roomId: string, data: any) {
    socket.to(roomId).emit('file:created', data);
    this.logActivity(roomId, `${this.getParticipantName(socket.id, roomId)} created ${data.fileName}`);
  }

  private handleFileDelete(socket: Socket, roomId: string, data: any) {
    socket.to(roomId).emit('file:deleted', data);
    this.logActivity(roomId, `${this.getParticipantName(socket.id, roomId)} deleted ${data.fileName}`);
  }

  private handleFileRename(socket: Socket, roomId: string, data: any) {
    socket.to(roomId).emit('file:renamed', data);
    this.logActivity(roomId, `${this.getParticipantName(socket.id, roomId)} renamed ${data.oldName} to ${data.newName}`);
  }

  private handleChatMessage(socket: Socket, roomId: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    const message = {
      id: Date.now().toString(),
      userId: socket.id,
      userName: participant.name,
      userColor: participant.color,
      content: data.content,
      timestamp: new Date()
    };

    // Broadcast message to all participants
    this.io.to(roomId).emit('chat:message-received', message);
    this.emit('chat-message', { roomId, message });
  }

  private handleDisconnect(socket: Socket, roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(userId);
    if (!participant) return;

    console.log(`👤 User ${participant.name} left project ${room.projectId}`);

    // Remove participant from room
    room.participants.delete(userId);
    room.lastActivity = new Date();

    // Notify other participants
    socket.to(roomId).emit('collaboration:participant-left', {
      participantId: userId,
      participantName: participant.name
    });

    // Clean up room if empty
    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      console.log(`🏠 Deleted empty collaboration room: ${roomId}`);
    }

    this.emit('participant-left', { roomId, participant });
  }

  private cleanupInactiveRooms() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    for (const [roomId, room] of this.rooms) {
      if (room.lastActivity < cutoff && room.participants.size === 0) {
        this.rooms.delete(roomId);
        console.log(`🧹 Cleaned up inactive room: ${roomId}`);
      }
    }
  }

  private extractUserName(socket: Socket): string {
    // Extract username from socket handshake or generate one
    const auth = socket.handshake.auth;
    return auth?.username || auth?.name || `User${socket.id.substring(0, 6)}`;
  }

  private generateAvatar(username: string): string {
    // Generate a simple avatar URL based on username
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
  }

  private getNextColor(): string {
    const color = this.userColors[this.colorIndex % this.userColors.length];
    this.colorIndex++;
    return color;
  }

  private getParticipantName(userId: string, roomId: string): string {
    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(userId);
    return participant?.name || 'Unknown';
  }

  private logActivity(roomId: string, activity: string) {
    console.log(`📝 [${roomId}] ${activity}`);
    this.emit('activity', { roomId, activity, timestamp: new Date() });
  }

  // Public methods for external access
  getRoomInfo(roomId: string) {
    return this.rooms.get(roomId);
  }

  getRoomParticipants(roomId: string) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.participants.values()) : [];
  }

  getActiveRooms() {
    return Array.from(this.rooms.values());
  }

  kickParticipant(roomId: string, participantId: string) {
    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(participantId);

    if (participant) {
      participant.socket.emit('collaboration:kicked');
      participant.socket.disconnect();
    }
  }
}