import React, { useState, useEffect } from 'react';
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
          <button type="submit" style={s.shuffleBtnMain}>
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
    if (!file) return alert("Please select an image first");
    const fd = new FormData();
    fd.append('category', category);
    fd.append('image', file);
    await fetch(`${API_BASE}/add-item`, { method: 'POST', body: fd });
    fetchInventory();
    setFile(null);
  };

 const deleteItem = async (id, e) => {
  e.stopPropagation();
  if (window.confirm("Delete this?")) {
    const res = await fetch(`${API_BASE}/delete-item/${id}`, { method: 'DELETE' });
    if (res.ok) {
      // Use 'id' here to match your Supabase column
      setInventory(inventory.filter(item => item.id !== id));
    } else {
      alert("Check Render logs - Delete failed.");
    }
  }
};

      if (res.ok) {
        // SUCCESS: Remove the item from the UI immediately
        setInventory(prev => prev.filter(item => item.id !== id));
        
        // Remove from current outfit if it's currently showing
        setOutfit(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (updated[key]?.id === id) updated[key] = null;
          });
          return updated;
        });
      } else {
        alert("Server refused to delete. Check Render logs.");
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  }
};

  const clearInventory = async () => {
    if (window.confirm("Delete everything in your closet?")) {
      await fetch(`${API_BASE}/clear-inventory`, { method: 'DELETE' });
      setInventory([]);
      setOutfit({});
    }
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
        <div style={{display:'flex', gap:'8px'}}>
           <button onClick={clearInventory} style={{...s.logoutBtn, color: '#ff4444'}}>Clear</button>
           <button onClick={() => navigate('/')} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={s.uploadBox}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} id="up" hidden />
        <label htmlFor="up" style={s.customUploadBtn}>{file ? "Image Selected" : "Upload Image"}</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.select}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addItem} style={s.addBtn}>Add</button>
      </div>

      <main style={s.main}>
        {/* FIXED 3x2 GRID */}
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
                    <div onClick={(e) => deleteItem(item.id, e)} style={s.deleteBtn}>
                       <Trash2 size={12} color="white" />
                    </div>
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
  container: { minHeight: '100vh', backgroundColor: '#e2a89b', fontFamily: '-apple-system, sans-serif', paddingBottom: '40px' },
  authContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2a89b' },
  authCard: { background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', width: '90%', maxWidth: '400px' },
  logo: { color: '#811c70', fontSize: '32px', marginBottom: '20px' },
  logoSmall: { color: '#811c70', fontSize: '24px', margin: 0 },
  nav: { padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.2)' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' },
  toggleText: { fontSize: '14px', cursor: 'pointer', color: '#6366f1', marginTop: '15px' },
  uploadBox: { display: 'flex', justifyContent: 'center', gap: '8px', padding: '15px', flexWrap: 'nowrap', width: '100%', boxSizing: 'border-box' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 },
  addBtn: { background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' },
  main: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  
  // FORCE 2 COLUMNS (3x2)
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: '10px', 
    padding: '10px', 
    width: '100%', 
    maxWidth: '500px', // Prevents it from getting too wide on desktop
    boxSizing: 'border-box' 
  },
  
  card: { aspectRatio: '1/1', background: 'white', borderRadius: '15px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '85%', height: '85%', objectFit: 'contain' },
  miniRefresh: { position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', padding: '6px' },
  label: { position: 'absolute', top: 8, left: 8, fontSize: '10px', color: '#aaa', fontWeight: 'bold' },
  empty: { color: '#eee', fontSize: '40px' },
  inventorySection: { width: '100%', marginTop: '30px' },
  catGroup: { padding: '0 0 20px 15px' },
  catTitle: { fontSize: '14px', color: '#811c70', marginBottom: '10px' },
  gallery: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' },
  galleryCard: { width: '80px', height: '80px', background: 'white', borderRadius: '10px', flexShrink: 0, position: 'relative' },
  galleryImg: { width: '100%', height: '100%', objectFit: 'contain' },
  deleteBtn: { position: 'absolute', top: 2, right: 2, background: 'rgba(255,0,0,0.7)', borderRadius: '50%', padding: '4px', display: 'flex' },
  shuffleBtn: { background: '#d946ef', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '40px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' },
  shuffleBtnMain: { background: '#d946ef', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold' },
  logoutBtn: { background: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px' },
  customUploadBtn: { padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', textAlign: 'center' }
};
