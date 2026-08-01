require('dotenv').config();
const express = require('express');
const redis = require('./src/redisClient');
const app = express();

const hits = {};
const LIMIT = process.env.LIMIT || 5;
const WINDOW = process.env.WINDOW || 60;
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

app.get("/pingRedis", async(req, res) => {
  const ip = req.ip;
  const key = `rate_limit:${ip}`;
  const count = await redis.incr(key);

  if(count === 1){
    await redis.expire(key, WINDOW);
  }
  if(count > LIMIT){
    return res.status(429).json({
      message: "Too many Requests",
      yourIP: ip,
      totalRequests: count
    }) 
  }

  res.json({
    message: "pong!",
    yourIP: ip,
    requestCount: count,
    remaining: LIMIT - count
  })

})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})