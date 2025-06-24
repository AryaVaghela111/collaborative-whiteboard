# 🧑‍🎨 Collaborative Whiteboard

A real-time collaborative whiteboard web application that allows multiple users to draw, write, and interact simultaneously — replicating the experience of a physical whiteboard online.

---

## 🌐 Live Demo

🔗 [Try the Whiteboard](https://collaborative-whiteboard-gamma.vercel.app/room/demo123)

---

## 📌 Features

- ✏️ **Drawing Tools**: Pen, Eraser, Rectangle, Circle, Text, Color Picker
- 🔁 **Canvas Management**: Undo, Redo, Clear
- 🔄 **Real-Time Sync**: WebSocket-powered updates across users
- 👥 **Multi-User Collaboration**: Shareable room URLs for live editing
- 🔐 **Access Control**: Public or private rooms with view-only/edit permissions (`?mode=view`)
- 💾 **Save & Export**: Export canvas as PNG or PDF
- ✅ **Persistent Canvas**: Automatically saves canvas to the backend (MongoDB)

---

## 🧰 Tech Stack

### Frontend
- **Next.js** (React)
- **Fabric.js** (Canvas library)
- **Socket.IO-client**

### Backend
- **Fastify**
- **Socket.IO**
- **MongoDB** with **Mongoose**

### Hosting
- **Frontend**: [Vercel](https://vercel.com/)
- **Backend**: [Railway](https://railway.app/)

---

## 🚀 Getting Started

### 🔧 Local Setup

#### 1. Clone the Repository
git clone https://github.com/your-username/collaborative-whiteboard.git
cd collaborative-whiteboard

### Frontend Setup

npm install
npm run dev

Open http://localhost:3000/room/demo123 in your browser

### Backend Setup
cd backend
npm install
npm run dev


## Usage Guide

Open any URL like:
https://collaborative-whiteboard-gamma.vercel.app/room/myroom123

To make a view-only link, append ?mode=view:
https://collaborative-whiteboard-gamma.vercel.app/room/myroom123?mode=view

Tools:
Pen & Color Picker
Eraser
Shapes: Rectangle, Circle
Text Tool
Undo / Redo / Clear
Export as PNG or PDF

## Author
Arya Vaghela
aryavaghela111@gmail.com
IIT Roorkee

## License
MIT License — Feel free to use, modify, and contribute!


