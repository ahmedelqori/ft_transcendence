const express = require("express");
const app = express();
const PORT = 3000;

const cors = require("cors");

const quotes = [
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Life is what happens when you're busy making other plans. – John Lennon",
  "If you want to lift yourself up, lift up someone else. – Booker T. Washington",
  "Stay hungry, stay foolish. – Steve Jobs",
  "The best time to plant a tree was 20 years ago. The second best time is now. – Chinese Proverb",
];

app.use(cors());

app.get("/quote", (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  res.json({ quote: quotes[randomIndex] });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
