import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `profile_${timestamp}${ext}`);
    }
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));
app.use('/public', express.static(publicDir));

const dataFile = path.join(publicDir, 'profile.json');

function readProfilePath() {
    try {
        if (!fs.existsSync(dataFile)) return null;
        const raw = fs.readFileSync(dataFile, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed && parsed.profileImage ? parsed.profileImage : null;
    } catch (err) {
        return null;
    }
}

function writeProfilePath(relativePath) {
    const payload = { profileImage: relativePath };
    fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2), 'utf-8');
}

app.get('/api/profile-photo', (req, res) => {
    const current = readProfilePath();
    res.json({ profileImage: current });
});

app.post('/api/upload-profile', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const relative = `/public/uploads/${req.file.filename}`;
    writeProfilePath(relative);
    res.json({ profileImage: relative });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



