// server.js

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
// ...

// Add a new habit
app.post('/habits', (req, res) => {
  const { name } = req.body;

  if (name) {
    const habit = {
      name,
      user_id: 1, // Replace with the desired user ID
      day1_status: 'None',
      day2_status: 'None',
      day3_status: 'None',
      day4_status: 'None',
      day5_status: 'None',
      day6_status: 'None',
      day7_status: 'None',
      longest_streak: 0
    };

    pool.query('INSERT INTO habits SET ?', habit, (err, results) => {
      if (err) {
        console.error('Error inserting new habit:', err);
        res.status(500).send('Error inserting new habit');
        return;
      }

      console.log('New habit added:', results.insertId);
      res.redirect('/');
    });
  } else {
    res.status(400).send('Name is required for adding a new habit');
  }
});

// Update habit status
app.post('/habits/:id', (req, res) => {
  const habitId = req.params.id;
  const { status } = req.body;

  if (habitId && status) {
    const dayIndex = Number(req.body.dayIndex);

    let updateQuery = `UPDATE habits SET day${dayIndex}_status = ?`;

    // Check if updating today's status
    if (dayIndex === 1) {
      updateQuery += `, longest_streak = 
        CASE day1_status
          WHEN 'None' THEN longest_streak + 1
          WHEN 'Done' THEN longest_streak
          ELSE longest_streak - 1
        END`;
    }

    updateQuery += ` WHERE id = ?`;

    pool.query(updateQuery, [status, habitId], (err) => {
      if (err) {
        console.error('Error updating habit status:', err);
        res.status(500).send('Error updating habit status');
        return;
      }

      console.log('Habit status updated:', habitId);
      res.redirect('/');
    });
  } else {
    res.status(400).send('Habit ID and status are required for updating habit status');
  }
});


// Delete habit
app.post('/habits/:id/delete', (req, res) => {
  const habitId = req.params.id;

  if (habitId) {
    pool.query('DELETE FROM habits WHERE id = ?', habitId, (err, results) => {
      if (err) {
        console.error('Error deleting habit:', err);
        res.status(500).send('Error deleting habit');
        return;
      }

      console.log('Habit deleted:', habitId);
      res.redirect('/');
    });
  } else {
    res.status(400).send('Habit ID is required for deleting a habit');
  }
});

// ...

// Handle 404 - Page not found
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Handle other errors
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).send('Internal Server Error');
});

// ...

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
