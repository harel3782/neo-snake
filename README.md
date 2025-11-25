# 🐍 Neo-Snake Portfolio Edition

A modern, cyberpunk-themed Snake game built with **React** and **Tailwind CSS**. This project demonstrates state management, side-effects handling (`useEffect`), and responsive design patterns in a functional React component architecture.

## 🌟 Features

- **React Hooks:** Uses `useState`, `useEffect`, `useRef`, and `useCallback` for game loop logic.
- **Input Buffering:** Implements a move queue system to prevent "suicide turns" (a common bug in simple snake games).
- **Persistence:** Saves High Scores to `localStorage`.
- **Responsive Design:** Includes touch controls (D-Pad) for mobile devices and keyboard support (WASD/Arrows) for desktop.
- **Dynamic Themes:** Switch between Matrix Green, Cyber Blue, Synth Purple, and Magma Orange.
- **Polished UI:** Neon glow effects and smooth transitions using Tailwind CSS.

## 🚀 How to Run Locally

Follow these steps to get the game running on your local machine.

### Prerequisites

Make sure you have **Node.js** installed. You can check by running:
```bash
node -v
```

(If you don't have it, download it from nodejs.org)

## 1. Download the Project

You can get the code in one of two ways:

Option A: Download ZIP (No Git required)

Click the green Code button at the top of this page.

Select Download ZIP.

Extract the ZIP file to a folder on your computer.

Open that folder in VS Code (or your terminal).

Option B: Using Git
Open your terminal and run:
```bash

git clone https://github.com/harel3782/neo-snake.git
cd neo-snake-portfolio
```
## 2. Install Dependencies

Important: You must run this command even if you downloaded the ZIP, as the game tools are not included in the download to save space.
```bash
npm install
```


## 3. Start the Development Server

Run the local server:
```bash

npm run dev
```


## 4. Play!

Click the link shown in your terminal (usually http://localhost:5173) to open the game in your browser.

## 5. Stopping the App

To stop the server and close the game:

Click inside the terminal window where the game is running.

Press Ctrl + C on your keyboard.

## 🛠️ Tech Stack

Framework: React (Vite)

Styling: Tailwind CSS

Icons: Lucide React

Language: JavaScript (ES6+)
