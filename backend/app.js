const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

// Add request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Add proper MIME types
app.use(express.static('public', {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));

// Serve frontend assets
app.use('/frontend', express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));

const housesRoutes = require('./routes/houses');

// Serve images from the backend/img directory
app.use('/img', express.static(path.join(__dirname, 'img')));

// Use API routes
app.use('/api', housesRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
