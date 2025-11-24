import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Calendar as CalIcon, 
  ListTodo, 
  Timer, 
  BarChart3, 
  Settings, 
  Plus, 
  Trash2, 
  Lightbulb, 
  Play, 
  Square, 
  CheckSquare, 
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAscXU-OzIudkHNMSS701XmHtVMsehutSI",
  authDomain: "studymaster-20233.firebaseapp.com",
  projectId: "studymaster-20233",
  storageBucket: "studymaster-20233.firebasestorage.app",
  messagingSenderId: "123202181282",
  appId: "1:123202181282:web:dd519d692dc65552539ffb",
  measurementId: "G-7K467EK825"
};

// Inicializar (Singleton)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- ESTILOS ---
const COLORS = {
  bg: "bg-slate-50",
  primary: "bg-blue-600",
};

// --- COMPONENTES UI ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
  const variants = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white`,
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    google: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
  };
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

// --- APP PRINCIPAL ---
export default function StudyMasterWeb() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Datos
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [todos, setTodos] = useState([]);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  // Carga de Datos
  useEffect(() => {
    if (!user) {
      setSubjects([]); setExams([]); setHistory([]); setTodos([]);
      return;
    }
    const unsubSub = onSnapshot(collection(db, 'users', user.uid, 'subjects'), s => setSubjects(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExams = onSnapshot(collection(db, 'users', user.uid, 'exams'), s => setExams(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubHist = onSnapshot(collection(db, 'users', user.uid, 'history'), s => setHistory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTodos = onSnapshot(collection(db, 'users', user.uid, 'todos'), s => setTodos(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubSub(); unsubExams(); unsubHist(); unsubTodos(); };
  }, [user]);

  // Login Google
  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { alert(e.message); }
  };

  // Render de Carga
  if (loadingAuth) return <div className="flex h-screen items-center justify-center text-slate-500">Cargando StudyMaster...</div>;

  // Render de Login
  if (!user) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">StudyMaster</h1>
        <p className="text-slate-500 mb-8">Tu planificador inteligente.</p>
        <Button onClick={handleLogin} variant="google" className="w-full flex items-center justify-center gap-3 py-3">
          Continuar con Google
        </Button>
        <div className="mt-4 pt-4 border-t">
           <button onClick={() => signInAnonymously(auth)} className="text-sm text-slate-400 hover:underline">Entrar como Invitado</button>
        </div>
      </div>
    </div>
  );

  // Render Principal (Protegido)
  return (
    <div className={`h-screen ${COLORS.bg} flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden`}>
      {/* Sidebar */}
      <nav className="md:w-64 bg-slate-900 text-slate-300 flex md:flex-col justify-between md:h-screen z-50 order-2 md:order-1 shrink-0 shadow-xl">
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-white tracking-wider">StudyMaster</h1>
          <div className="flex items-center gap-2 mt-3 p-2 bg-slate-800 rounded-lg">
            {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
            ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.displayName?.[0] || 'A'}
                </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{user?.displayName || 'Invitado'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex md:flex-col flex-1 md:px-3 md:gap-1 overflow-x-auto no-scrollbar justify-around md:justify-start">
          <NavBtn id="dashboard" icon={LayoutDashboard} label="Dashboard" active={activeTab} set={setActiveTab} />
          <NavBtn id="todo" icon={ListTodo} label="Planificador" active={activeTab} set={setActiveTab} />
          <NavBtn id="calendar" icon={CalIcon} label="Calendario" active={activeTab} set={setActiveTab} />
          <NavBtn id="timer" icon={Timer} label="Sala Estudio" active={activeTab} set={setActiveTab} />
          <NavBtn id="stats" icon={BarChart3} label="Estadísticas" active={activeTab} set={setActiveTab} />
          <NavBtn id="config" icon={Settings} label="Configuración" active={activeTab} set={setActiveTab} />
        </div>

        <div className="hidden md:block p-4">
            <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm w-full p-2 rounded hover:bg-slate-800">
                <LogOut size={16} /> Salir
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto h-full order-1 md:order-2 relative scroll-smooth">
        <div className="md:hidden absolute top-4 right-4 z-30">
             <button onClick={() => signOut(auth)} className="p-2 bg-white rounded-full shadow text-slate-600"><LogOut size={20}/></button>
        </div>

        {activeTab === 'dashboard' && <DashboardView subjects={subjects} exams={exams} />}
        {activeTab === 'todo' && <TodoView subjects={subjects} exams={exams} todos={todos} userId={user.uid} />}
        {activeTab === 'calendar' && <CalendarView subjects={subjects} exams={exams} userId={user.uid} />}
        {activeTab === 'timer' && <TimerView subjects={subjects} exams={exams} userId={user.uid} />}
        {activeTab === 'stats' && <StatsView subjects={subjects} history={history} />}
        {activeTab === 'config' && <ConfigView subjects={subjects} exams={exams} userId={user.uid} />}
      </main>
    </div>
  );
}

const NavBtn = ({ id, icon: Icon, label, active, set }) => (
  <button 
    onClick={() => set(id)} 
    className={`flex flex-col md:flex-row items-center md:px-4 md:py-3 p-3 rounded-lg transition-all duration-200 group
      ${active === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
  >
    <Icon size={20} className="md:mr-3 mb-1 md:mb-0" />
    <span className="text-[10px] md:text-sm font-medium">{label}</span>
  </button>
);

// --- VISTAS ---

const DashboardView = ({ subjects, exams }) => {
  const getStatus = (subjName) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const subExams = exams.filter(e => e.subject === subjName)
      .map(e => ({ ...e, d: new Date(e.date.split('/').reverse().join('-')) }))
      .filter(e => e.d >= today).sort((a,b) => a.d - b.d);
    
    if (!subExams.length) return { label: "⚠️ No al día", color: "text-amber-600 bg-amber-50 border-amber-200", days: 999 };
    const days = Math.ceil((subExams[0].d - today) / (86400000));
    if (days <= 3) return { label: "🚨 CRÍTICO", color: "text-red-600 bg-red-50 border-red-200", days };
    if (days <= 7) return { label: "🔥 Urgente", color: "text-orange-600 bg-orange-50 border-orange-200", days };
    return { label: "⚠️ No al día", color: "text-amber-600 bg-amber-50 border-amber-200", days };
  };

  return (
    <div className="space-y-6 animate-in fade-in pt-4">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <LayoutDashboard className="text-blue-600"/> Dashboard
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map(s => {
          const st = getStatus(s.name);
          return (
            <Card key={s.id} className="hover:shadow-lg border-l-4 border-l-blue-500">
              <div className="flex justify-between mb-3 items-start">
                <h3 className="font-bold text-lg text-slate-800">{s.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold border ${st.color}`}>{st.label}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between bg-slate-50 p-2 rounded">
                  <span>Dificultad:</span> <span className="font-bold">{s.difficulty}</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded">
                  <span>Días Restantes:</span> <span className="font-bold">{st.days === 999 ? '-' : st.days}</span>
                </div>
              </div>
            </Card>
          )
        })}
        {!subjects.length && <div className="col-span-full text-center py-12 text-slate-400 border-2 border-dashed rounded-xl">Añade asignaturas en Configuración</div>}
      </div>
    </div>
  );
};

const TodoView = ({ subjects, exams, todos, userId }) => {
  const [hours, setHours] = useState(() => localStorage.getItem('sm_hours') || 2);
  const [sel, setSel] = useState(() => JSON.parse(localStorage.getItem('sm_sel') || '{}'));
  
  useEffect(() => { localStorage.setItem('sm_hours', hours); }, [hours]);
  useEffect(() => { localStorage.setItem('sm_sel', JSON.stringify(sel)); }, [sel]);

  const gen = async () => {
    todos.forEach(t => deleteDoc(doc(db, 'users', userId, 'todos', t.id)));
    const targets = Object.keys(sel).filter(k => sel[k]);
    const finalList = targets.length > 0 ? targets : subjects.map(s => s.name);
    if (!finalList.length) return alert("No hay asignaturas.");
    
    const totalMins = hours * 60;
    let scores = {};
    const today = new Date(); today.setHours(0,0,0,0);
    
    finalList.forEach(name => {
      const s = subjects.find(sb => sb.name === name);
      if(!s) return;
      let base = (s.difficulty || 2) * 10;
      let minDays = 999;
      exams.filter(e => e.subject === name).forEach(e => {
         const parts = e.date.split('/');
         if (parts.length === 3) {
             const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
             const diff = Math.ceil((d - today)/86400000);
             if(diff >= 0) minDays = Math.min(minDays, diff);
         }
      });
      if (minDays <= 1) base *= 50; 
      else if (minDays <= 3) base *= 20;
      else if (minDays <= 7) base *= 5;
      scores[name] = base; 
    });
    
    const totalP = Object.values(scores).reduce((a,b)=>a+b, 0) || 1;
    for (const name of finalList) {
      if(!scores[name]) continue;
      const mins = Math.floor(totalMins * (scores[name] / totalP));
      if (mins < 15 && scores[name] < 100) continue;
      
      const s = subjects.find(sb => sb.name === name);
      const ratioT = s?.ratio || 0.5;
      const tasks = [];
      
      if (ratioT > 0.8) tasks.push({t:'Teoría', m: mins});
      else if (ratioT < 0.2) tasks.push({t:'Práctica', m: mins});
      else {
        const tT = Math.round(Math.floor(mins * ratioT) / 5) * 5;
        const tP = mins - tT;
        if(tT >= 15) tasks.push({t:'Teoría', m: tT});
        if(tP >= 15) tasks.push({t:'Práctica', m: tP});
      }
      for(let t of tasks) await addDoc(collection(db, 'users', userId, 'todos'), { subject: name, type: t.t, mins: t.m, done: false });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 pt-4 h-full">
      <div className="md:col-span-1 space-y-4">
        <Card>
          <h3 className="font-bold mb-4">Generador</h3>
          <input type="number" value={hours} onChange={e=>setHours(e.target.value)} className="w-full p-2 border rounded mb-4" placeholder="Horas" />
          <div className="max-h-60 overflow-y-auto border p-2 rounded bg-slate-50 mb-4">
            {subjects.map(s => (
              <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                <input type="checkbox" checked={!!sel[s.name]} onChange={()=>setSel(prev=>({...prev, [s.name]: !prev[s.name]}))} />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
          <Button onClick={gen} className="w-full">Generar Rutina</Button>
        </Card>
      </div>
      <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-3 bg-white p-4 rounded-xl shadow border custom-scrollbar">
          {!todos.length && <div className="text-center text-slate-400 mt-10">Lista vacía</div>}
          {todos.map(t => (
            <div key={t.id} onClick={()=>updateDoc(doc(db, 'users', userId, 'todos', t.id), {done: !t.done})} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 ${t.done ? 'bg-slate-50 opacity-60' : 'bg-white hover:shadow-md'}`}>
              <div className={`w-6 h-6 rounded border flex items-center justify-center ${t.done ? 'bg-green-500 border-green-500' : ''}`}>
                {t.done && <CheckSquare size={16} className="text-white"/>}
              </div>
              <div>
                <div className={`font-bold ${t.done && 'line-through'}`}>{t.subject}</div>
                <div className="text-xs text-slate-500">{t.type} - {t.mins} min</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CalendarView = ({ subjects, exams, userId }) => {
  const [date, setDate] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date().toLocaleDateString('es-ES'));
  const [sub, setSub] = useState("");

  const formatDate = (d) => `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const add = async () => {
    if(!sub) return alert("Elige asignatura");
    await addDoc(collection(db, 'users', userId, 'exams'), { subject: sub, date: selDate });
    setSub("");
  };

  const days = [];
  for(let i=0; i<offset; i++) days.push(<div key={`e-${i}`} className="bg-slate-50/50 border-r border-b"></div>);
  for(let d=1; d<=daysInMonth; d++) {
    const dStr = formatDate(new Date(date.getFullYear(), date.getMonth(), d));
    const todayExams = exams.filter(e => e.date === dStr);
    days.push(
      <div key={d} onClick={()=>setSelDate(dStr)} className={`min-h-[100px] border-r border-b p-2 cursor-pointer hover:bg-blue-50 ${selDate===dStr ? 'ring-2 ring-inset ring-blue-500' : ''}`}>
        <span className="font-bold text-lg text-slate-700">{d}</span>
        <div className="mt-1 space-y-1">
          {todayExams.map(e => (
            <div key={e.id} className="text-[10px] bg-red-100 text-red-800 px-1 rounded truncate font-medium flex justify-between group">
              <span>{e.subject}</span>
              <button onClick={(ev)=>{ev.stopPropagation(); deleteDoc(doc(db, 'users', userId, 'exams', e.id))}} className="hidden group-hover:block text-red-600 font-bold">×</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pt-2 pb-4">
      <div className="flex-1 bg-white rounded-xl shadow border flex flex-col overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="font-bold text-xl capitalize">{date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
          <div className="flex gap-2">
            <button onClick={()=>setDate(new Date(date.getFullYear(), date.getMonth()-1))} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft/></button>
            <button onClick={()=>setDate(new Date(date.getFullYear(), date.getMonth()+1))} className="p-1 hover:bg-slate-100 rounded"><ChevronRight/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-xs font-bold py-2 border-b bg-slate-50"><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div><div>DOM</div></div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">{days}</div>
      </div>
      <div className="lg:w-72 space-y-4">
        <Card>
          <h3 className="font-bold mb-4">Nuevo Examen</h3>
          <div className="mb-2 font-mono text-center bg-slate-100 p-2 rounded">{selDate}</div>
          <select value={sub} onChange={e=>setSub(e.target.value)} className="w-full p-2 border rounded mb-4">
            <option value="">Asignatura...</option>
            {subjects.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <Button onClick={add} className="w-full">Guardar</Button>
        </Card>
      </div>
    </div>
  );
};

const TimerView = ({ subjects, exams, userId }) => {
  const [sel, setSel] = useState("");
  const [time, setTime] = useState(0);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const bestSub = useMemo(() => {
    if(!subjects.length) return null;
    let best=null, max= -1, today=new Date(); today.setHours(0,0,0,0);
    subjects.forEach(s => {
      let sc = (s.difficulty||2)*10, minD = 999;
      exams.filter(e=>e.subject===s.name).forEach(e=>{
        const p=e.date.split('/'); if(p.length===3){
          const d=new Date(`${p[2]}-${p[1]}-${p[0]}`);
          const df=Math.ceil((d-today)/86400000); if(df>=0) minD=Math.min(minD, df);
        }
      });
      if(minD<=2) sc*=20; else if(minD<=7) sc*=5;
      if(sc>max) { max=sc; best=s; }
    });
    return best;
  }, [subjects, exams]);

  useEffect(() => {
    if(active && !paused) timerRef.current = setInterval(() => setTime(t=>t+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [active, paused]);

  const stop = async () => {
    setActive(false); setPaused(false);
    const mins = Math.floor(time/60);
    if(mins>0) {
      await addDoc(collection(db, 'users', userId, 'history'), { subject: sel, minutes: mins, date: new Date().toISOString() });
      alert(`Guardados ${mins} min`);
    }
    setTime(0);
  };

  const fmt = (s) => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
      {!active ? (
        <Card className="w-full p-8 space-y-6">
          <h2 className="text-2xl font-bold">Cronómetro</h2>
          {bestSub && (
            <div className="bg-amber-50 p-4 rounded-lg text-left border border-amber-200">
              <div className="text-xs font-bold text-amber-800 uppercase flex items-center gap-2"><Flame size={12}/> Recomendado</div>
              <div className="font-bold text-lg">{bestSub.name}</div>
              <button onClick={()=>setSel(bestSub.name)} className="text-xs text-blue-600 underline mt-1">Seleccionar</button>
            </div>
          )}
          <select value={sel} onChange={e=>setSel(e.target.value)} className="w-full p-3 border rounded-xl">
            <option value="">Elige asignatura...</option>
            {subjects.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <Button onClick={()=>{if(sel) setActive(true); else alert("Elige asignatura")}} className="w-full py-3 text-lg">INICIAR</Button>
        </Card>
      ) : (
        <div className="w-full">
          <div className="text-xl font-bold text-blue-600 mb-4 animate-pulse">{sel}</div>
          <div className="text-[5rem] font-mono font-bold leading-none mb-8">{fmt(time)}</div>
          <div className="flex justify-center gap-4">
            <button onClick={()=>setPaused(!paused)} className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow">
              {paused ? <Play fill="currentColor"/> : <Pause fill="currentColor"/>}
            </button>
            <button onClick={stop} className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow">
              <Square fill="currentColor"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsView = ({ subjects, history }) => {
  const data = {}; subjects.forEach(s=>data[s.name]=0);
  history.forEach(h=>{ if(data[h.subject]!==undefined) data[h.subject]+=h.minutes });
  const max = Math.max(...Object.values(data), 1);
  return (
    <Card className="pt-4">
      <h3 className="font-bold mb-6">Tiempo Total</h3>
      <div className="space-y-4">
        {Object.keys(data).map(k => (
          <div key={k}>
            <div className="flex justify-between text-sm mb-1"><span>{k}</span><span>{data[k]} min</span></div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{width: `${(data[k]/max)*100}%`}}></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const ConfigView = ({ subjects, exams, userId }) => {
  const [name, setName] = useState("");
  const [diff, setDiff] = useState(2);
  const [ratio, setRatio] = useState(50);

  const save = async () => {
    if(!name) return;
    const exist = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    const data = { name, difficulty: Number(diff), ratio: ratio/100 };
    if(exist) await updateDoc(doc(db, 'users', userId, 'subjects', exist.id), data);
    else await addDoc(collection(db, 'users', userId, 'subjects'), data);
    setName(""); alert("Guardado");
  };

  const del = async (id, n) => {
    if(confirm("¿Borrar?")) {
      await deleteDoc(doc(db, 'users', userId, 'subjects', id));
      exams.filter(e=>e.subject===n).forEach(e=>deleteDoc(doc(db, 'users', userId, 'exams', e.id)));
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 pt-4">
      <Card className="space-y-4">
        <h3 className="font-bold">Editar Asignaturas</h3>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" placeholder="Nombre" />
        <div>
          <label className="text-xs font-bold">Dificultad</label>
          <div className="flex gap-2 mt-1">{[1,2,3].map(d=><button key={d} onClick={()=>setDiff(d)} className={`flex-1 py-2 border rounded ${diff===d?'bg-blue-600 text-white':''}`}>{d}</button>)}</div>
        </div>
        <div>
          <label className="text-xs font-bold">Teoría {ratio}%</label>
          <input type="range" min="0" max="100" value={ratio} onChange={e=>setRatio(e.target.value)} className="w-full" />
        </div>
        <Button onClick={save} className="w-full">Guardar</Button>
      </Card>
      <Card>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {subjects.map(s => (
            <div key={s.id} className="flex justify-between p-3 border rounded items-center">
              <div><div className="font-bold">{s.name}</div><div className="text-xs text-slate-500">Dif: {s.difficulty}</div></div>
              <div className="flex gap-2">
                <button onClick={()=>{setName(s.name); setDiff(s.difficulty); setRatio((s.ratio||0.5)*100)}} className="text-blue-500"><Settings size={16}/></button>
                <button onClick={()=>del(s.id, s.name)} className="text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
