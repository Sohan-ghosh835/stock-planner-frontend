const email = document.getElementById('email');
const password = document.getElementById('password');
const authStatus = document.getElementById('authStatus');
let userId = "";

async function registerUser() {
  const res = await fetch("https://stock-backend-da89.onrender.com/register", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value })
  });
  const data = await res.json();
  authStatus.textContent = data.message || data.error;
}

async function loginUser() {
  const res = await fetch("https://stock-backend-da89.onrender.com/login", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value })
  });
  const data = await res.json();
  if (data.user_id) {
    userId = data.user_id;
    authStatus.textContent = `Logged in as ${data.email}`;
  } else {
    authStatus.textContent = data.error;
  }
}

const indexMap = {
  "NIFTY50": ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"],
  "SENSEX": ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ITC.NS"]
};

async function getStockData() {
  const ticker = document.getElementById('ticker').value.toUpperCase();
  const detailsEl = document.getElementById('details');
  const predictedEl = document.getElementById('predictedData');
  const analysisEl = document.getElementById('analysisResults');
  const aiAdviceEl = document.getElementById('aiAdvice');
  detailsEl.innerHTML = "";
  predictedEl.innerHTML = "";
  analysisEl.innerHTML = "";
  aiAdviceEl.innerHTML = "";
  const canvas = document.getElementById('stockChart');
  canvas.replaceWith(canvas.cloneNode(true));

  const tickers = indexMap[ticker] || [ticker];
  for (const tk of tickers) {
    const res = await fetch(`https://stock-backend-da89.onrender.com/stock/${tk}/${userId}`);
    const stock = await res.json();
    const labels = Object.keys(stock.history);
    const prices = Object.values(stock.history);
    detailsEl.innerHTML += `<div><p><strong>Symbol:</strong> ${tk}</p><p><strong>Latest Price:</strong> ₹${stock.latest_price}</p></div>`;
    const ctx = document.getElementById('stockChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{ label: tk, data: prices, borderColor: 'blue', fill: false }]
      },
      options: { responsive: true }
    });
    predictedEl.innerHTML += stock.predicted.map((p, i) => `<p>${tk} - Day ${i+1}: ₹${p.toFixed(2)}</p>`).join('');
    const analysisRes = await fetch(`https://stock-backend-da89.onrender.com/analyze/${tk}`);
    const a = await analysisRes.json();
    analysisEl.innerHTML += `<p><strong>${tk}</strong> - SMA(10): ₹${a.sma10.toFixed(2)}, RSI: ${a.rsi.toFixed(2)}, Volatility: ${a.volatility.toFixed(2)}</p>`;
    const aiRes = await fetch(`https://stock-backend-da89.onrender.com/ai-guide/${tk}`);
    const ai = await aiRes.json();
    aiAdviceEl.innerHTML += `<p><strong>${tk}</strong>: ${ai.message}</p>`;
  }
}

async function saveInvestment() {
  const ticker = document.getElementById("investTicker").value;
  const note = document.getElementById("note").value;
  const res = await fetch("https://stock-backend-da89.onrender.com/invest", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ticker, note })
  });
  const data = await res.json();
  alert(data.message);
}

async function loadUserData() {
  const res = await fetch(`https://stock-backend-da89.onrender.com/user/${userId}`);
  const user = await res.json();
  let html = `<h3>Email: ${user.email}</h3>`;
  html += `<h4>Search History:</h4><ul>${user.history.map(h => `<li>${h}</li>`).join('')}</ul>`;
  html += `<h4>Investments:</h4><ul>${user.investments.map(i => `<li><strong>${i.ticker}</strong>: ${i.note}</li>`).join('')}</ul>`;
  userData.innerHTML = html;
}
