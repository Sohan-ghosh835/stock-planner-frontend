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

async function getStockData() {
  const ticker = document.getElementById('ticker').value;
  const res = await fetch(`https://stock-backend-da89.onrender.com/stock/${ticker}/${userId}`);
  const stock = await res.json();
  const labels = Object.keys(stock.history);
  const prices = Object.values(stock.history);

  details.innerHTML = `<p><strong>Symbol:</strong> ${ticker}</p><p><strong>Latest Price:</strong> ₹${stock.latest_price}</p>`;

  const ctx = document.getElementById('stockChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: ticker, data: prices, borderColor: 'blue', fill: false }]
    },
    options: { responsive: true }
  });

  predictedData.innerHTML = stock.predicted.map((p, i) => `<p>Day ${i+1}: ₹${p.toFixed(2)}</p>`).join('');

  const analysisRes = await fetch(`https://stock-backend-da89.onrender.com/analyze/${ticker}`);
  const a = await analysisRes.json();
  analysisResults.innerHTML = `<p>SMA(10): ₹${a.sma10.toFixed(2)}</p><p>RSI: ${a.rsi.toFixed(2)}</p><p>Volatility: ${a.volatility.toFixed(2)}</p>`;

  const aiRes = await fetch(`https://stock-backend-da89.onrender.com/ai-guide/${ticker}`);
  const ai = await aiRes.json();
  aiAdvice.textContent = ai.message;
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
