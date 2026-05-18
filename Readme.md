1. Set Up Backend (Node.js + Express)

mkdir my-fullstack-app
cd my-fullstack-app
mkdir server
cd server
npm init -y
npm install express cors


Create server/index.js

<!-- 
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from Node.js backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 -->

2. Set Up Frontend (React)

npx create-react-app pinkistyle
cd pinkistyle

Add proxy to pinkistyle/package.json

"proxy": "http://localhost:5000"

Edit pinkistyle/src/App.js

<!-- 
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/message')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div className="App">
      <h1>{message || "Loading..."}</h1>
    </div>
  );
}

export default App;
 -->

3. Run Both Frontend and Backend
Option 1: Open two terminals
Terminal 1: Run the backend

cd server
node index.js
or 
node server.js


Terminal 2: Run the frontend    

cd pinkistyle
npm start

Option 2: Use concurrently (optional)

npm install concurrently --save-dev

Create a package.json in the root if not exists, and add:

<!--
 "scripts": {
  "start": "concurrently \"npm run server\" \"npm run client\"",
  "server": "cd server && node index.js",
  "client": "cd client && npm start"
} 
-->

Then run:

npm start



To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.


