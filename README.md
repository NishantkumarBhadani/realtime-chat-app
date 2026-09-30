# Real-Time One-to-One Chat Application

A responsive real-time one-to-one chat application built with **Next.js, TypeScript, Tailwind CSS, and Appwrite**.

The application supports secure authentication, user discovery, private conversations, message history, and real-time message delivery using Appwrite Realtime.

---

## Live Demo

**Live Application:**  
_Add your Vercel URL here after deployment._

Example:

`https://realtime-chat-app.vercel.app`

---

## Features

### Authentication
- User registration with name, email, and password
- Email/password login
- Logout functionality
- Protected chat route
- Current authenticated user detection

### User Management
- Displays all registered users
- Automatically excludes the currently logged-in user
- Users can select another registered user to start a conversation
- Selected conversation is clearly highlighted

### One-to-One Messaging
- Private conversations between two users
- Correct sender and recipient association
- Message history loaded when a conversation is selected
- Messages displayed in chronological order
- Sender name and timestamp displayed
- Prevents sending empty messages
- Prevents sending messages to yourself

### Real-Time Communication
- Appwrite Realtime integration
- New messages appear instantly without refreshing the page
- Realtime events are filtered to the currently selected conversation
- Conversation switching is supported
- Duplicate realtime messages are prevented

### Responsive UI
- Desktop layout with users list and chat window
- Mobile-friendly conversation interface
- Mobile back navigation from chat to users
- Responsive message input and chat layout

### Security
- Appwrite authentication
- User JWT used for authenticated server requests
- Appwrite API key kept server-side
- API key is never exposed to the browser
- Message read permissions are granted only to sender and recipient
- Environment variables used for configuration
- `.env.local` excluded from Git

---

# Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling and responsive UI |
| Appwrite | Authentication, database and realtime |
| Node.js | Runtime |
| Vercel | Deployment |
| Git & GitHub | Version control |

---

#  Architecture

The application follows a simple separation of concerns:

```text
Browser
   │
   ├── Next.js UI
   │
   ├── Appwrite Client SDK
   │      ├── Authentication
   │      ├── User data
   │      ├── Message history
   │      └── Realtime subscription
   │
   └── Next.js API Route
          │
          ├── Verify user JWT
          │
          └── Appwrite Server SDK
                 │
                 └── Create message