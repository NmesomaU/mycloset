import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Sparkles, Trash2, RefreshCcw } from 'lucide-react';

const API_BASE = "https://mycloset-91se.onrender.com";
const supabase = createClient("https://opluichiyjjehdllmvjv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbHVpY2hpeWpqZWhkbGxtdmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjU1MTMsImV4cCI6MjA5MTQ0MTUxM30.lCfgcjfp6sqNunNwGvI3Gep4S1CYw8O-qXTS4UIlYrE");

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    
    if (error) alert(error.message);
    else isLogin ? navigate('/closet') : alert("Signup successful! Check email.");
  };

  return (
    <div style={s.authContainer}>
      <div style={s.authCard}>
        <h1 style={s.logo}>{isLogin ? "LOGIN" : "SIGN UP"}</h1>
        <form onSubmit={handleAuth} style={s.form}>
          <input type="email" placeholder="Email" style={s.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" style={s.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={s.shuffleBtn}>
            <span style={{margin:'0 auto'}}>{isLogin ? "ENTER" : "CREATE"}</span>
          </button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} style={s.toggleText}>
          {isLogin ? "Need an account? Sign up" : "Have an account? Login"}
        </p>
      </div>
    </div>
  );
}

function Closet() {
  const [outfit, setOutfit] = useState({});
  const [inventory, setInventory] = useState([]);
  const [imgUrl, setImgUrl] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("top");
  const navigate = useNavigate();
  const categories = ['coat', 'top', 'bottom', 'shoes', 'bag', 'accessory'];

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_BASE}/all-items`);
      const data = await res.json();
      setInventory(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchInventory(); }, []);

  const addItem = async () => {
    const fd = new FormData();
    fd.append('category', category);
    if (file) fd.append('image', file);
    else fd.append('image', imgUrl);
    
    await fetch(`${API_BASE}/add-item`, { method: 'POST', body: fd });
    fetchInventory();
    setImgUrl(""); setFile(null);
  };

  const randomizeCat = async (cat) => {
    const res = await fetch(`${API_BASE}/random/${cat}`);
    const data = await res.json();
    setOutfit(p => ({ ...p, [cat]: data }));
  };

  const shuffleAll = async () => {
    const res = await fetch(`${API_BASE}/shuffle`);
    const data = await res.json();
    setOutfit(data);
  };

  return (
    <div style={s.container}>
      <nav style={s.nav}>
        <h1 style={s.logoSmall}>MY CLOSET</h1>
        <button onClick={() => navigate('/')} style={s.logoutBtn}>Logout</button>
      </nav>

      <div style={s.uploadBox}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} id="up" hidden />
        <label htmlFor="up" style={s.customUploadBtn}>{file ? "Attached" : "Upload"}</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.select}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addItem} style={s.addBtn}>Add</button>
      </div>

      <main style={s.main}>
        <div style={s.grid}>
          {categories.map(type => (
            <div key={type} style={s.card}>
              <div style={s.label}>{type.toUpperCase()}</div>
              <button onClick={() => randomizeCat(type)} style={s.miniRefresh}><RefreshCcw size={14}/></button>
              {outfit[type] ? <img src={outfit[type].image} style={s.img} alt="" /> : <div style={s.empty}>+</div>}
            </div>
          ))}
        </div>

        <button onClick={shuffleAll} style={s.shuffleBtn}><Sparkles /> SHUFFLE OUTFIT</button>

        <div style={s.inventorySection}>
          {categories.map(cat => (
            <div key={cat} style={s.catGroup}>
              <h3 style={s.catTitle}>{cat.toUpperCase()}</h3>
              <div style={s.gallery}>
                {inventory.filter(i => i.category === cat).map(item => (
                  <div key={item.id} style={s.galleryCard} onClick={() => setOutfit(p => ({...p, [cat]: item}))}>
                    <img src={item.image} style={s.galleryImg} alt="" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/closet" element={<Closet />} />
      </Routes>
    </Router>
  );
}

// RESPONSIVE STYLES
const s = {
  container: { minHeight: '100vh', backgroundColor: '#e2a89b', fontFamily: 'sans-serif', paddingBottom: '40px' },
  authContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2a89b' },
  authCard: { background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', width: '85%', maxWidth: '350px' },
  logo: { color: '#811c70', fontSize: '32px', marginBottom: '20px' },
  logoSmall: { color: '#811c70', fontSize: '24px', margin: 0 },
  nav: { padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.2)' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' },
  toggleText: { fontSize: '14px', cursor: 'pointer', color: '#6366f1', marginTop: '15px' },
  uploadBox: { display: 'flex', justifyContent: 'center', gap: '8px', padding: '15px', flexWrap: 'nowrap' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 },
  addBtn: { background: '#6366f1', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px' },
  main: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '10px', width: '95%' },
  card: { aspectRatio: '1/1', background: 'white', borderRadius: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '90%', height: '90%', objectFit: 'contain' },
  miniRefresh: { position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: '4px' },
  label: { position: 'absolute', top: 5, left: 5, fontSize: '9px', color: '#888', fontWeight: 'bold' },
  empty: { color: '#ddd', fontSize: '24px' },
  inventorySection: { width: '100%', marginTop: '30px' },
  catGroup: { paddingLeft: '15px' },
  catTitle: { fontSize: '12px', color: '#811c70', marginBottom: '8px' },
  gallery: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px' },
  galleryCard: { width: '70px', height: '70px', background: 'white', borderRadius: '8px', flexShrink: 0 },
  galleryImg: { width: '100%', height: '100%', objectFit: 'contain' },
  shuffleBtn: { background: '#d946ef', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' },
  logoutBtn: { background: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px' },
  customUploadBtn: { padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }
};
