import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Sparkles, Trash2, RefreshCcw } from 'lucide-react';

const API_BASE = "http://localhost:5000";
// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
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
    else isLogin ? navigate('/closet') : alert("Signup successful! Check email for confirmation.");
  };

  const forgotPassword = async () => {
    const email = prompt("Enter your email for reset link:");
    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      alert(error ? error.message : "Reset link sent to your email!");
    }
  };

  return (
    <div style={{...s.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div style={s.authCard}>
        <h1 style={s.logo}>{isLogin ? "LOGIN" : "SIGN UP"}</h1>
        <form onSubmit={handleAuth} style={s.form}>
          <input type="email" placeholder="Email" style={s.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" style={s.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={s.shuffleBtn}>{isLogin ? "ENTER" : "CREATE"}</button>
        </form>
        <p onClick={forgotPassword} style={s.toggleText}>Forgot password?</p>
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
  const fileInputRef = useRef(null);
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
    file ? fd.append('image', file) : fd.append('image', imgUrl);
    
    const res = await fetch(`${API_BASE}/add-item`, { method: 'POST', body: fd });
    const data = await res.json();
    setOutfit(p => ({ ...p, [category]: data }));
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

  const clearAll = async () => {
    if (window.confirm("Delete everything from your closet?")) {
      await fetch(`${API_BASE}/clear-all`, { method: 'DELETE' });
      fetchInventory();
      setOutfit({});
    }
  };

  return (
    <div style={s.container}>
      <nav style={s.nav}>
        <h1 style={s.logo}>MY CLOSET</h1>
        <div style={{display: 'flex', gap: '10px'}}>
            <button onClick={clearAll} style={s.clearBtn}>Clear Closet</button>
            <button onClick={() => navigate('/')} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={s.uploadBox}>
        <input ref={fileInputRef} type="file" onChange={(e) => setFile(e.target.files[0])} id="up" hidden />
        <label htmlFor="up" style={s.customUploadBtn}>{file ? "Image Attached" : "Upload File"}</label>
        <input placeholder="Or Paste URL..." value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} style={s.input} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.select}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addItem} style={s.addBtn}>Add to Closet</button>
      </div>

      <main style={s.main}>
        <div style={s.grid}>
          {categories.map(type => (
            <div key={type} style={s.card}>
              <div style={s.label}>{type.toUpperCase()}</div>
              <button onClick={() => randomizeCat(type)} style={s.miniRefresh}><RefreshCcw size={14}/></button>
              {outfit[type] ? <img src={outfit[type].image} style={s.img} alt="" /> : <div style={s.empty}>Empty</div>}
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
                    <button onClick={async (e) => {
                        e.stopPropagation();
                        await fetch(`${API_BASE}/delete-item/${item.id}`, { method: 'DELETE' });
                        fetchInventory();
                    }} style={s.miniDelete}>×</button>
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

const s = {
  container: { minHeight: '100vh', backgroundColor: '#e2a89b', fontFamily: 'sans-serif', paddingBottom: '50px' },
  nav: { padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' },
  authCard: { background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  logo: { textAlign: 'center', margin: '0 auto', color: '#811c70', fontWeight: 'bold', fontSize: '45px', fontFamily: 'Montserrat' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd' },
  toggleText: { fontSize: '12px', cursor: 'pointer', color: '#6366f1', marginTop: '15px' },
  uploadBox: { display: 'flex', justifyContent: 'center', fontFamily: 'Montserrat', gap: '10px', padding: '20px', flexWrap: 'wrap' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd' },
  addBtn: {  fontFamily: 'Montserrat', background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  main: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  card: { width: '200px', height: '250px', background: 'white', borderRadius: '15px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '85%', height: '85%', objectFit: 'contain' },
  miniRefresh: { position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#888' },
  label: {position: 'absolute', top: 8, left: 8, fontSize: '10px', color: '#aaa', fontWeight: 'bold' },
  empty: { color: '#ccc', fontSize: '12px' },
  inventorySection: { width: '100%', maxWidth: '800px', marginTop: '50px', padding: '0 20px' },
  catGroup: { marginBottom: '30px' },
  catTitle: { fontSize: '14px', color: '#4a306d', marginBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px' },
  gallery: { display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px' },
  galleryCard: { width: '80px', height: '80px', background: 'white', flexShrink: 0, borderRadius: '10px', position: 'relative', cursor: 'pointer' },
  galleryImg: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' },
  shuffleBtn: { marginTop: '30px', background: '#d946ef', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' },
  clearBtn: {  fontFamily: 'Montserrat', background: '#811c70', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  logoutBtn: {  fontFamily: 'Montserrat', background: 'white', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  miniDelete: { position: 'absolute', top: -5, right: -5, background: 'black', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' },
  customUploadBtn: { padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '14px' }
};