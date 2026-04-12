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

// --- GET ALL ITEMS ---
app.get('/all-items', async (req, res) => {
  const { data, error } = await supabase.from('items').select('*');
  if (error) return res.status(500).json(error);
  res.json(data);
});

// --- ADD NEW ITEM ---
app.post('/add-item', upload.single('image'), async (req, res) => {
  const imageUrl = req.file ? req.file.path : req.body.image;
  const { data, error } = await supabase.from('items').insert([{ 
    category: req.body.category, 
    image: imageUrl 
  }]).select();
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});

// --- DELETE SINGLE ITEM ---
app.delete('/delete-item/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json(error);
  res.json({ message: "Item deleted successfully" });
});

// --- CLEAR ENTIRE INVENTORY ---
app.delete('/delete-item/:id', async (req, res) => {
  const itemId = Number(req.params.id); // Convert "13" to 13

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error(error);
    return res.status(500).json(error);
  }

  res.json({ message: "Deleted" });
});
  

// --- SHUFFLE OUTFIT ---
app.get('/shuffle', async (req, res) => {
  const categories = ['coat', 'top', 'bottom', 'shoes', 'bag', 'accessory'];
  const outfit = {};
  for (const cat of categories) {
    const { data } = await supabase.from('items').select('*').eq('category', cat);
    outfit[cat] = data?.length > 0 ? data[Math.floor(Math.random() * data.length)] : null;
  }
  res.json(outfit);
});

// --- RANDOM BY CATEGORY ---
app.get('/random/:category', async (req, res) => {
  const { data } = await supabase.from('items').select('*').eq('category', req.params.category);
  res.json(data?.length > 0 ? data[Math.floor(Math.random() * data.length)] : null);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
