const API_URL = '/todos';

async function loadTodos() {
  const res = await fetch(API_URL);
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  input.value = '';
  loadTodos();
}

async function toggleTodo(id, completed) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });

  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  loadTodos();
}

loadTodos();