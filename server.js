require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3000;



app.use(express.json());
app.use(express.static('public'));

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const Todo = mongoose.model('Todo', todoSchema);



app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});


app.get('/todos/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
  } else {
    res.json(todo);
  }
});


app.post('/todos', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const todo = new Todo({ title });
  await todo.save();
  res.status(201).json(todo);
});


app.put('/todos/:id', async (req, res) => {
  const { title, completed } = req.body;

  const todo = await Todo.findById(req.params.id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  if (title !== undefined) {
    todo.title = title;
  }
  if (completed !== undefined) {
    todo.completed = completed;
  }

  await todo.save();
  res.json(todo);
});


app.delete('/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});