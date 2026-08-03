const API_URL = '/todos';
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

async function loadTodos() {
  const res = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  const todos = await res.json();

  const list = document.getElementById('todoList');
  list.innerHTML = '';

  todos.forEach(todo => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = todo.title;
    if (todo.completed) {
      span.style.textDecoration = 'line-through';
    }
    span.onclick = () => toggleTodo(todo._id, !todo.completed);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteTodo(todo._id);

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

async function addTodo() {
  const input = document.getElementById('todoInput');
  const title = input.value.trim();
  if (!title) {
    return;
  }

  await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title })
  });

  input.value = '';
  loadTodos();
}

async function toggleTodo(id, completed) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ completed })
  });

  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  loadTodos();
}

loadTodos();