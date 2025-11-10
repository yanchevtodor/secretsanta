// server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PEOPLE_FILE = './people/people.json';
const COUPLED_FILE = './people/coupled.json';

app.get('/api/people', (req, res) => {
    const data = fs.readFileSync(PEOPLE_FILE, 'utf-8');
    res.json(JSON.parse(data));
});

app.get('/api/coupled', (req, res) => {
    fs.readFile('./data/coupled.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Грешка при четене на coupled.json' });
        res.json(JSON.parse(data || '[]'));
    });
});

app.post('/api/save-coupled', (req, res) => {
    const { pair } = req.body;
    if (!pair) {
        return res.status(400).json({ error: 'Missing pair data' });
    }

    const current = fs.existsSync(COUPLED_FILE)
        ? JSON.parse(fs.readFileSync(COUPLED_FILE, 'utf-8'))
        : [];

    current.push(pair);
    fs.writeFileSync(COUPLED_FILE, JSON.stringify(current, null, 2));

    res.json({ message: 'Pair saved successfully', data: pair });
});
app.post('/api/update-person', (req, res) => {
    const updatedUser = req.body;

    if (!updatedUser?.email) {
        return res.status(400).json({ error: 'Missing email' });
    }

    const people = JSON.parse(fs.readFileSync(PEOPLE_FILE, 'utf-8'));
    const index = people.findIndex(p => p.email === updatedUser.email);

    if (index !== -1) {
        people[index] = { ...people[index], ...updatedUser };
    } else {
        people.push(updatedUser); // ако не съществува, добавяме нов
    }

    fs.writeFileSync(PEOPLE_FILE, JSON.stringify(people, null, 2));
    res.json({ message: 'Person updated successfully', user: updatedUser });
});
app.get('/api/get-coupled/:email', (req, res) => {
    const email = req.params.email;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    if (!fs.existsSync(COUPLED_FILE)) return res.json({ found: false });

    const couples = JSON.parse(fs.readFileSync(COUPLED_FILE, 'utf-8'));

    // намираме дали този имейл е giver
    const found = couples.find(c => c.giver?.email === email);

    if (found) {
        res.json({ found: true, receiver: found.receiver });
    } else {
        res.json({ found: false });
    }
});


app.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));
