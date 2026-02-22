# 🌸 FlowDay – Aesthetic Productivity & Focus Management App

FlowDay is a modern, pastel-themed productivity web application designed to help users manage tasks and maintain focus through an integrated timer system.

It combines clean design, smooth interactions, and structured task management to create a calm and distraction-free productivity environment.

---

## ✨ Features

- 📝 Create, edit, and delete tasks
- 🎯 Assign priority levels (High / Medium / Low / None)
- ⏱ Built-in focus timer for deep work sessions
- 🌈 Pastel, playful, and minimal UI design
- 📱 Fully responsive layout
- ⚡ Fast performance powered by Vite
- 🔐 Supabase integration for backend services

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- Supabase (Database & Project Configuration)

---

## 🧠 Design Philosophy

FlowDay is built on three core principles:

1. **Clarity over clutter** – Minimal interface for maximum focus  
2. **Calm visual hierarchy** – Soft pastel tones to reduce cognitive load  
3. **Intentional productivity** – Tools that encourage structured deep work  

The UI is designed to feel light, motivating, and distraction-free.

---

## ⚙️ Environment Variables

This project uses Supabase configuration through environment variables.

Create a `.env` file in the root directory and add:

VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=https://your_project.supabase.co


⚠️ Do NOT commit `.env` to version control.  
Use deployment platform environment variable settings instead.

---

## 🚀 Local Development

### 1️⃣ Clone the repository

git clone https://github.com/your-username/flowday.git

cd flowday

### 2️⃣ Install dependencies

npm install

### 3️⃣ Start development server

npm run dev

The app will run at:

http://localhost:5173


---

## 🌐 Production Build

To create a production build:

npm run build


Output directory:

dist/


You can deploy this project easily on:

- Netlify
- Vercel
- Any static hosting platform

---

## 📁 Project Structure

src/
├── components/
├── pages/
├── hooks/
├── lib/
├── styles/
└── main.tsx


The structure is organized for scalability and maintainability.

---

## 📌 Future Improvements

- User authentication system
- Productivity analytics dashboard
- Streak tracking
- Dark mode support
- Calendar integration
- Mobile-first optimization

---

## 👩‍💻 Author

**Iqra Mahfooz**  
Frontend Developer focused on building clean, aesthetic, and user-centered web applications.

---

## 📄 License

This project is created for educational and portfolio purposes.