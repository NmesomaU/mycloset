require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'my_closet', allowed_formats: ['jpg', 'png', 'jpeg'] },
});
const upload = multer({ storage: storage });

app.get('/all-items', async (req, res) => {
  const { data, error } = await supabase.from('items').select('*');
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.post('/add-item', upload.single('image'), async (req, res) => {
  const imageUrl = req.file ? req.file.path : req.body.image;
  const { data, error } = await supabase.from('items').insert([{ 
    category: req.body.category, 
    image: imageUrl 
  }]).select();
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});

app.get('/shuffle', async (req, res) => {
  const categories = ['coat', 'top', 'bottom', 'shoes', 'bag', 'accessory'];
  const outfit = {};
  for (const cat of categories) {
    const { data } = await supabase.from('items').select('*').eq('category', cat);
    outfit[cat] = data?.length > 0 ? data[Math.floor(Math.random() * data.length)] : null;
  }
  res.json(outfit);
});

app.get('/random/:category', async (req, res) => {
  const { data } = await supabase.from('items').select('*').eq('category', req.params.category);
  res.json(data?.length > 0 ? data[Math.floor(Math.random() * data.length)] : null);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
