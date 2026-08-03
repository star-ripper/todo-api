require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Todo = mongoose.model('Todo', todoSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);



function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    req.user = user;
    next();
  });
}

app.get('/todos', authenticateToken, async (req, res) => {
  const todos = await Todo.find({ userId: req.user.id });
  res.json(todos);
});

app.get('/todos/:id', authenticateToken, async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
  } else {
    res.json(todo);
  }
});

app.post('/todos', authenticateToken, async (req, res) => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const todo = new Todo({ title, userId: req.user.id });
  await todo.save();
  res.status(201).json(todo);
});

app.put('/todos/:id', authenticateToken, async (req, res) => {
  const { title, completed } = req.body;

  const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
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

app.delete('/todos/:id', authenticateToken, async (req, res) => {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  res.status(204).send();
});



app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(400).json({ error: 'Username already taken' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();

  res.status(201).json({ message: 'User created successfully' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});