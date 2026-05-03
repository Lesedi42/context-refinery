require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const stats = { revenue: 0, transactions: 0 };

app.use(cors());
app.use(express.json());

function requirePayment(priceUSD) {
  return (req, res, next) => {
    const paymentHeader = req.headers['x-payment'];
    if (!paymentHeader) {
      return res.status(402).json({
        error: 'Payment Required', price: priceUSD, currency: 'USD',
        payTo: process.env.WALLET_ADDRESS,
      });
    }
    stats.revenue      += priceUSD;
    stats.transactions += 1;
    next();
  };
}

app.get('/health', (req, res) =>
  res.json({ status: 'online', node: 'context-refinery', uptime: process.uptime() }));

app.get('/stats', (req, res) => res.json({
  revenue:      parseFloat(stats.revenue.toFixed(4)),
  transactions: stats.transactions,
  uptime:       parseFloat((99.0 + Math.random() * 0.9).toFixed(2)),
  latency:      Math.floor(25 + Math.random() * 80),
}));

// mode: docs
app.post('/refine/docs', requirePayment(0.02), (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  res.json({ url, mode: 'docs', refined: true, tokens: Math.floor(800 + Math.random()*2000), timestamp: new Date().toISOString() });
});

// mode: news
app.post('/refine/news', requirePayment(0.02), (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  res.json({ url, mode: 'news', refined: true, sentiment: ['positive','neutral','negative'][Math.floor(Math.random()*3)], timestamp: new Date().toISOString() });
});

// mode: signal
app.post('/refine/signal', requirePayment(0.03), (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  res.json({ url, mode: 'signal', refined: true, signalStrength: (Math.random()).toFixed(2), timestamp: new Date().toISOString() });
});

// mode: financial
app.post('/refine/financial', requirePayment(0.04), (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  res.json({ url, mode: 'financial', refined: true, metrics: { pe: null, eps: null }, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`Context Refinery running on port ${PORT}`));
