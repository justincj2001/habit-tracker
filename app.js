const express = require('express');
const mysql = require('mysql2');
const app = express();

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'db4free.net',
  user: 'bobatusis',
  password: 'bobatusis',
  database: 'bobatusis',
  connectionLimit: 10
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse request body
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Home Page - List all habits
app.get('/', (req, res) => {
  pool.query('SELECT * FROM habits ORDER BY date DESC', (err, results) => {
    if (err) throw err;

    res.render('index', { habits: results });
  });
});

// Add a new habit
app.post('/habits', (req, res) => {
  const { name } = req.body;

  if (name) {
    const habit = {
      name,
      user_id: 1 // Replace with the desired user ID
    };

    pool.query('INSERT INTO habits SET ?', habit, (err) => {
      if (err) throw err;

      res.redirect('/');
    });
  }
});

// Update habit status
app.post('/habits/:id', (req, res) => {
  const habitId = req.params.id;
  const { status } = req.body;

  if (habitId && status) {
    pool.query('UPDATE habits SET status = ? WHERE id = ?', [status, habitId], (err) => {
      if (err) throw err;

      res.redirect('/');
    });
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
