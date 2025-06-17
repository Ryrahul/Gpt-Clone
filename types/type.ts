export interface MessageAttachment {
  id: string;
  url: string; // Cloudinary URL
  name: string;
  type: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  pages?: number;
  provider: string;
}

export interface ExtendedMessage {
  _id: string;
  chat: string;
  role: "user" | "assistant";
  content: string;
  attachments: MessageAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatDocument {
  _id: string;
  userId: string;
  title: string;
  messages: string[] | ExtendedMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatItem {
  _id: string;
  id: string;
  title: string;
  timestamp: Date;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    attachments: MessageAttachment[]; // Add this line
    createdAt: Date;
  }[];
}

export interface MessageDocument {
  _id: any;
  chat: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
