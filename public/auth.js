const API_URL = '/signup';
const LOGIN_URL = '/login';

async function signup() {
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();
  const message = document.getElementById('message');

  if (!username || !password) {
    message.textContent = 'Please enter a username and password';
    return;
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    message.textContent = data.error;
    return;
  }

  message.textContent = 'Account created! Redirecting to login...';
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

async function login() {
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();
  const message = document.getElementById('message');

  if (!username || !password) {
    message.textContent = 'Please enter a username and password';
    return;
  }

  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    message.textContent = data.error;
    return;
  }

  localStorage.setItem('token', data.token);
  window.location.href = 'index.html';
}