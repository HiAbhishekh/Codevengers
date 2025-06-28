# 🚀 BuildNow – AI DIY Project Generator

Transform your learning into hands-on projects with AI-powered suggestions! BuildNow helps students generate personalized, practical project ideas after learning any concept.

![BuildNow Demo](https://img.shields.io/badge/Status-Ready%20to%20Use-brightgreen)
![React](https://img.shields.io/badge/React-18+-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange)

## ✨ Features

- **AI-Powered Generation**: Uses OpenAI GPT-4o-mini to create personalized project ideas
- **Smart Input System**: Concept name, skill level (Beginner/Intermediate/Advanced), and domain selection
- **Beautiful UI**: Modern gradient design with dark/light mode support
- **Detailed Projects**: Each project includes description, tools, time estimates, steps, and starter code
- **Interactive Cards**: Expandable project cards with copy/save functionality
- **Fallback Support**: Works with mock data when OpenAI API is not available
- **Keyboard Shortcuts**: Efficient navigation with hotkeys
- **Local Storage**: Save favorite projects for later reference

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- TailwindCSS for styling
- Modern animations and interactions

**Backend:**
- Node.js with Express
- OpenAI API integration
- CORS enabled for frontend communication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key (optional for demo mode)

### 1. Clone & Install

```bash
# Both frontend and backend dependencies are already installed
cd Codevengers
```

### 2. Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

### 3. Start the Frontend

```bash
# In a new terminal
cd client  
npm run dev
```

The app will start on `http://localhost:5174`

### 4. Open Your Browser

Navigate to `http://localhost:5174` and start generating projects!

## 🔧 Configuration

### OpenAI API Setup (Optional)

1. **Get an OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com)
   - Sign up/Login and navigate to API Keys
   - Create a new API key
   - **Cost**: Very affordable! ~$0.01-0.05 per request, $5 free credits when signing up

2. **Configure the Server:**
   - Open `server/.env`
   - Replace `your-openai-api-key-here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart the Server:**
   ```bash
   cd server
   npm run dev
   ```

### Without OpenAI API Key

The app works perfectly in **demo mode** using the mock endpoint! You'll see realistic sample projects and can test all features.

## 📖 How to Use

1. **Enter a Concept**: Type what you just learned (e.g., "Recursion", "Machine Learning")
2. **Select Skill Level**: Choose Beginner, Intermediate, or Advanced
3. **Pick a Domain**: Coding, Hardware, Research, or Design
4. **Generate**: Click the button or press Enter
5. **Explore Projects**: View detailed project cards with:
   - Step-by-step implementation guides
   - Starter code and examples
   - Tool recommendations
   - Time estimates
   - Motivational tips

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus search input
- **Ctrl/Cmd + D**: Toggle dark/light mode  
- **Ctrl/Cmd + /**: Show keyboard shortcuts
- **Enter**: Generate projects (when form is valid)

## 🎯 API Endpoints

### Health Check
```
GET http://localhost:5000/
```

### Generate Projects (AI)
```
POST http://localhost:5000/api/generate-projects
Content-Type: application/json

{
  "concept": "Recursion",
  "skillLevel": "Intermediate", 
  "domain": "Coding"
}
```

### Generate Projects (Demo)
```
POST http://localhost:5000/api/generate-projects/mock
Content-Type: application/json

{
  "concept": "Any concept",
  "skillLevel": "Beginner|Intermediate|Advanced",
  "domain": "Coding|Hardware|Research|Design"  
}
```

## 🎨 UI Features

- **Full-screen gradient backgrounds** with floating animations
- **Glassmorphism effects** for modern card design
- **Mouse-following gradients** for interactive experience
- **Confetti celebrations** when projects are generated
- **Smooth animations** throughout the interface
- **Dark/Light mode** with system preference detection
- **Toast notifications** for user feedback
- **Responsive design** for all screen sizes

## 📁 Project Structure

```
Codevengers/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main app pages
│   │   └── assets/         # Images and icons
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend
│   ├── index.js            # Main server file
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
└── README.md               # This file
```

## 🔍 Troubleshooting

### Frontend Issues
- **Styles not loading**: Restart the dev server (`npm run dev` in client/)
- **API connection failed**: Make sure backend is running on port 5000

### Backend Issues  
- **OpenAI errors**: Check your API key in `server/.env`
- **Port conflicts**: Change PORT in `.env` if 5000 is taken
- **Dependencies**: Run `npm install` in server directory

### Common Solutions
- Clear browser cache and restart both servers
- Check console for detailed error messages
- Use the mock endpoint for testing without OpenAI API

## 🚧 Development

### Adding New Features
- Frontend components go in `client/src/components/`
- New pages go in `client/src/pages/`
- Backend routes go in `server/index.js`

### Environment Variables
```bash
# Server (.env)
OPENAI_API_KEY=your-api-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve BuildNow!

---

**Happy Building! 🔨✨**

Transform your learning into practical projects and build amazing things! 