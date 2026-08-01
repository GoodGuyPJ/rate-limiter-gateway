const express = require('express');
require('dotenv').config();
const app = express();

const hits = {};
const LIMIT = process.env.LIMIT || 5;

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get("/ping", (req, res) => {
  const ip = req.ip;
  if(!hits[ip]){
    hits[ip] = 0;
  }
  hits[ip]++;

  if(hits[ip] > LIMIT){
    return res.status(429).json({
      message: "Too many Requests",
      yourIP: ip,
      totalRequests: hits[ip]
    })
  }

  res.json({
    message: "pong!",
    yourIP: ip,
    requestCount: hits[ip],
    remaining: LIMIT - hits[ip]
  })
})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})