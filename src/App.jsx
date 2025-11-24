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
  onSnapshot, 
  query, 
  where 
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
  Pause,
  RotateCcw,
  Flame,
  Trophy,
  TrendingUp,
  Clock,
  CalendarDays
} from 'lucide-react';

// --- TU CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAscXU-OzIudkHNMSS701XmHtVMsehutSI",
  authDomain: "studymaster-20233.firebaseapp.com",
  projectId: "studymaster-20233",
  storageBucket: "studymaster-20233.firebasestorage.app",
  messagingSenderId: "123202181282",
  appId: "1:123202181282:web:dd519d692dc65552539ffb",
  measurementId: "G-7K467EK825"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- SISTEMA DE COLORES POR ASIGNATURA ---
const SUBJECT_COLORS = [
  { name: 'red', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', fill: '#EF4444', ring: 'ring-red-500', bar: 'bg-red-500' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', fill: '#F97316', ring: 'ring-orange-500', bar: 'bg-orange-500' },
  { name: 'amber', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', fill: '#F59E0B', ring: 'ring-amber-500', bar: 'bg-amber-500' },
  { name: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', fill: '#EAB308', ring: 'ring-yellow-500', bar: 'bg-yellow-500' },
  { name: 'lime', bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200', fill: '#84CC16', ring: 'ring-lime-500', bar: 'bg-lime-500' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', fill: '#22C55E', ring: 'ring-green-500', bar: 'bg-green-500' },
  { name: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', fill: '#10B981', ring: 'ring-emerald-500', bar: 'bg-emerald-500' },
  { name: 'teal', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', fill: '#14B8A6', ring: 'ring-teal-500', bar: 'bg-teal-500' },
  { name: 'cyan', bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', fill: '#06B6D4', ring: 'ring-cyan-500', bar: 'bg-cyan-500' },
  { name: 'sky', bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', fill: '#0EA5E9', ring: 'ring-sky-500', bar: 'bg-sky-500' },
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', fill: '#3B82F6', ring: 'ring-blue-500', bar: 'bg-blue-500' },
  { name: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', fill: '#6366F1', ring: 'ring-indigo-500', bar: 'bg-indigo-500' },
  { name: 'violet', bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', fill: '#8B5CF6', ring: 'ring-violet-500', bar: 'bg-violet-500' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', fill: '#A855F7', ring: 'ring-purple-500', bar: 'bg-purple-500' },
  { name: 'fuchsia', bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-200', fill: '#D946EF', ring: 'ring-fuchsia-500', bar: 'bg-fuchsia-500' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', fill: '#EC4899', ring: 'ring-pink-500', bar: 'bg-pink-500' },
  { name: 'rose', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', fill: '#F43F5E', ring: 'ring-rose-500', bar: 'bg-rose-500' }
];

const getSubjectColor = (name) => {
  if (!name) return SUBJECT_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash % SUBJECT_COLORS.length)];
};

// --- ESTILOS GENERALES ---
const COLORS = {
  bg: "bg-slate-50",
  panel: "bg-white",
  primary: "bg-blue-600",
  primaryHover: "hover:bg-blue-700",
  textMain: "text-slate-800"
};

// --- COMPONENTES AUXILIARES ---
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
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border border-slate-300",
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

// --- LÓGICA DE RECOMENDACIÓN CENTRALIZADA ---
const calculatePriority = (subject, exams) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let score = (subject.difficulty || 2) * 10;
  let minDays = 999;

  exams.filter(e => e.subject === subject.name).forEach(e => {
      const parts = e.date.split('/');
      if (parts.length === 3) {
          const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
          if (diff >= 0) minDays = Math.min(minDays, diff);
      }
  });

  let reason = "Mantenimiento";
  if (minDays <= 1) { score *= 100; reason = "¡Examen Inminente!"; }
  else if (minDays <= 3) { score *= 50; reason = `Examen en ${minDays} días`; }
  else if (minDays <= 7) { score *= 20; reason = "Examen esta semana"; }
  else if (minDays <= 14) { score *= 5; reason = "Examen en 2 semanas"; }
  else if (minDays <= 30) { score *= 2; reason = "Examen a la vista"; }
  else {
     score *= 1;
     reason = subject.difficulty >= 3 ? "Asignatura Difícil" : "Repaso General";
  }

  return { score, minDays, reason };
};

// --- APP PRINCIPAL ---
export default function StudyMasterWeb() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

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

  useEffect(() => {
    if (!loadingAuth && !user) {
       signInAnonymously(auth).catch(console.error);
    }
  }, [loadingAuth, user]);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { alert(e.message); }
  };

  if (loadingAuth) return <div className="flex h-screen items-center justify-center text-slate-500">Cargando...</div>;

  if (!user) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">StudyMaster</h1>
        <p className="text-slate-500 mb-8">Sincroniza tu estudio en todos tus dispositivos.</p>
        <Button onClick={handleLogin} variant="google" className="w-full flex items-center justify-center gap-3 py-3 text-lg shadow-sm">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
          Continuar con Google
        </Button>
        <div className="mt-6 pt-6 border-t border-slate-100">
            <button onClick={() => signInAnonymously(auth)} className="text-sm text-slate-400 hover:text-slate-600 underline">Continuar como invitado</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-screen ${COLORS.bg} flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden`}>
      <nav className="md:w-64 bg-slate-900 text-slate-300 flex md:flex-col justify-between md:h-screen z-50 order-2 md:order-1 shrink-0 shadow-xl">
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-white tracking-wider">StudyMaster</h1>
          <div className="flex items-center gap-2 mt-3 p-2 bg-slate-800 rounded-lg">
            {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full shadow-md" />
            ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm text-white font-bold shadow-md">
                {user.isAnonymous ? 'A' : user.displayName?.[0] || 'U'}
                </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{user.isAnonymous ? 'Invitado' : user.displayName}</p>
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
                <LogOut size={16} /> Cerrar Sesión
            </button>
        </div>
      </nav>

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
    <Icon size={20} className={`md:mr-3 mb-1 md:mb-0 transition-transform ${active === id ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-[10px] md:text-sm font-medium">{label}</span>
  </button>
);

// --- VISTAS ---

// 1. DASHBOARD
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

  const suggest = () => {
    if(!subjects.length) return alert("Añade asignaturas primero.");
    let best = null, maxScore = -1;
    subjects.forEach(s => {
      const { score, reason } = calculatePriority(s, exams);
      if(score > maxScore) { maxScore = score; best = { ...s, reason }; }
    });
    if(best) alert(`🤖 EL COACH SUGIERE:\n\n👉 ${best.name.toUpperCase()}\n\nMotivo: ${best.reason}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in pt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><LayoutDashboard className="text-blue-600"/> Dashboard</h2>
        <Button variant="purple" onClick={suggest} className="flex gap-2 items-center text-sm"><Lightbulb size={16}/> Coach</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map(s => {
          const st = getStatus(s.name);
          const color = getSubjectColor(s.name);
          return (
            <Card key={s.id} className={`hover:shadow-lg border-l-4 ${color.border}`} style={{ borderLeftColor: color.fill }}>
              <div className="flex justify-between mb-3 items-start">
                <h3 className="font-bold text-lg text-slate-800">{s.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold border ${st.color}`}>{st.label}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between bg-slate-50 p-2 rounded">
                  <span>Dificultad:</span> 
                  <span className="font-bold flex gap-1">
                    {[...Array(s.difficulty)].map((_,i)=><span key={i} className="text-yellow-400">★</span>)}
                  </span>
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

// 2. TO-DO VIEW
const TodoView = ({ subjects, exams, todos, userId }) => {
  const [hours, setHours] = useState(() => localStorage.getItem('sm_hours') || 2);
  const [sel, setSel] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sm_sel') || '{}'); } catch { return {} }
  });
  
  useEffect(() => { localStorage.setItem('sm_hours', hours); }, [hours]);
  useEffect(() => { localStorage.setItem('sm_sel', JSON.stringify(sel)); }, [sel]);

  const toggleSel = (name) => setSel(prev => ({ ...prev, [name]: !prev[name] }));

  const gen = async () => {
    todos.forEach(t => deleteDoc(doc(db, 'users', userId, 'todos', t.id)));
    const targets = Object.keys(sel).filter(k => sel[k]);
    const finalList = targets.length > 0 ? targets : subjects.map(s => s.name);
    if (!finalList.length) return alert("No hay asignaturas.");
    
    const totalMins = hours * 60;
    let scores = {};
    
    finalList.forEach(name => {
      const s = subjects.find(sb => sb.name === name);
      if(!s) return;
      const { score } = calculatePriority(s, exams);
      scores[name] = score; 
    });
    
    const totalP = Object.values(scores).reduce((a,b)=>a+b, 0) || 1;
    let allocations = finalList.map(name => ({ name, rawMins: totalMins * (scores[name] / totalP), score: scores[name] }));

    if (allocations.length > 1) {
        const validAllocations = allocations.filter(a => a.rawMins >= 25);
        if (validAllocations.length === 0) {
            const top = allocations.sort((a,b) => b.score - a.score)[0];
            allocations = [{ ...top, rawMins: totalMins }];
        } else {
            const newTotalScore = validAllocations.reduce((acc, curr) => acc + curr.score, 0);
            allocations = validAllocations.map(a => ({ ...a, rawMins: totalMins * (a.score / newTotalScore) }));
        }
    }

    for (const alloc of allocations) {
      let mins = Math.round(Math.floor(alloc.rawMins) / 5) * 5;
      if (mins < 15) continue;

      const s = subjects.find(sb => sb.name === alloc.name);
      const ratioT = s?.ratio || 0.5;
      const tasks = [];
      
      if (ratioT > 0.8) tasks.push({t:'Teoría', m: mins});
      else if (ratioT < 0.2) tasks.push({t:'Práctica', m: mins});
      else {
        let tT = Math.round(Math.floor(mins * ratioT) / 5) * 5;
        let tP = mins - tT;
        if (tT < 15) { tP += tT; tT = 0; }
        if (tP < 15) { tT += tP; tP = 0; }
        if(tT >= 15) tasks.push({t:'Teoría', m: tT});
        if(tP >= 15) tasks.push({t:'Práctica', m: tP});
      }
      for(let task of tasks) await addDoc(collection(db, 'users', userId, 'todos'), { subject: alloc.name, type: task.t, mins: task.m, done: false });
    }
  };

  const progress = useMemo(() => {
    if(!todos.length) return 0;
    return Math.round((todos.filter(t=>t.done).length / todos.length) * 100);
  }, [todos]);

  return (
    <div className="grid md:grid-cols-3 gap-6 pt-4 h-full">
      <div className="md:col-span-1 space-y-4">
        <Card className="border-blue-100 shadow-md">
          <h3 className="font-bold mb-4 text-slate-800 flex items-center gap-2"><ListTodo size={20} className="text-blue-600"/> Configurar Sesión</h3>
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-400">Horas Hoy</label>
            <input type="number" value={hours} onChange={e=>setHours(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg mt-1 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-200" step="0.5" />
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Selección (Opcional)</label>
            <div className="max-h-60 overflow-y-auto border border-slate-200 p-2 rounded-lg bg-slate-50">
              {subjects.map(s => (
                <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition-colors">
                  <input type="checkbox" checked={!!sel[s.name]} onChange={()=>toggleSel(s.name)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">{s.name}</span>
                </label>
              ))}
              {!subjects.length && <div className="text-xs text-slate-400 p-2">Sin asignaturas</div>}
            </div>
          </div>
          <Button onClick={gen} className="w-full py-3 shadow-lg shadow-blue-100">⚡ Generar Rutina Inteligente</Button>
        </Card>
      </div>

      <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
        <div className="mb-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200 shrink-0">
          <div className="flex justify-between text-sm font-bold mb-2"><span className="text-slate-600">Progreso Diario</span><span className="text-blue-600 text-lg">{progress}%</span></div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{width: `${progress}%`}}></div></div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 bg-white p-4 rounded-xl shadow-inner border border-slate-200 custom-scrollbar">
          {!todos.length && <div className="text-center text-slate-400 mt-10">Lista vacía</div>}
          {todos.map(t => {
            const color = getSubjectColor(t.subject);
            return (
            <div key={t.id} onClick={()=>updateDoc(doc(db, 'users', userId, 'todos', t.id), {done: !t.done})} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all duration-200 ${t.done ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-white hover:shadow-md'}`} style={{ borderLeftColor: color.fill, borderLeftWidth: '4px' }}>
              <div className={`w-6 h-6 rounded border flex items-center justify-center ${t.done ? 'bg-green-500 border-green-500' : ''}`}>
                {t.done && <CheckSquare size={16} className="text-white"/>}
              </div>
              <div>
                <div className={`font-bold ${t.done && 'line-through'}`}>{t.subject}</div>
                <div className="text-xs text-slate-500 flex gap-2 items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${color.bg} ${color.text}`}>{t.type}</span>
                    <span>{t.mins} min</span>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

// 3. CALENDARIO (COLORFUL)
const CalendarView = ({ subjects, exams, userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toLocaleDateString('es-ES')); 
  const [newExamSub, setNewExamSub] = useState("");

  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  useEffect(() => { setSelectedDateStr(formatDate(new Date())); }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const handleDayClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDateStr(formatDate(date));
  };

  const addExam = async () => {
    if (!newExamSub) return alert("Elige una asignatura");
    await addDoc(collection(db, 'users', userId, 'exams'), {
      subject: newExamSub,
      date: selectedDateStr,
      createdAt: new Date()
    });
    setNewExamSub("");
  };

  const deleteExam = async (id) => {
    if (confirm("¿Borrar examen?")) {
      await deleteDoc(doc(db, 'users', userId, 'exams', id));
    }
  };

  const days = [];
  for (let i = 0; i < adjustedFirstDay; i++) days.push(<div key={`empty-${i}`} className="bg-white border-r border-b border-slate-100 min-h-[120px]"></div>);
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
    const dayExams = exams.filter(e => e.date === dateStr);
    const isToday = new Date().getDate() === d && new Date().getMonth() === currentDate.getMonth();
    const isSelected = selectedDateStr === dateStr;

    days.push(
      <div key={d} onClick={() => handleDayClick(d)} className={`min-h-[120px] border-r border-b border-slate-100 p-2 cursor-pointer transition-all relative group flex flex-col ${isToday ? 'bg-blue-50/40' : 'bg-white hover:bg-slate-50'} ${isSelected ? 'ring-2 ring-inset ring-blue-500 z-10' : ''}`}>
        <div className="flex justify-between items-start mb-1">
          <span className={`text-3xl font-bold leading-none ${isToday ? 'text-blue-600' : 'text-slate-700 opacity-50 group-hover:opacity-80'}`}>{d}</span>
        </div>
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar mt-1">
          {dayExams.map(e => {
            const color = getSubjectColor(e.subject);
            return (
            <div key={e.id} className={`text-[11px] ${color.bg} ${color.text} px-2 py-1 rounded border-l-4 ${color.border} font-bold shadow-sm flex justify-between items-center group/exam transition-all hover:shadow-md truncate`} style={{ borderLeftColor: color.fill }}>
              <span className="truncate w-full">{e.subject}</span>
              <button onClick={(ev) => { ev.stopPropagation(); deleteExam(e.id); }} className="opacity-0 group-hover/exam:opacity-100 hover:text-red-700 rounded p-0.5 transition-all"><Trash2 size={14} /></button>
            </div>
          )})}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in duration-300 pt-2 pb-4">
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden h-full">
        <div className="p-4 flex justify-between items-center border-b bg-white z-20 relative">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-2xl text-slate-800 capitalize">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1))} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm font-bold hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors">HOY</button>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1))} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-3 border-b bg-slate-50 shadow-sm z-10"><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div><div>DOM</div></div>
        <div className="grid grid-cols-7 auto-rows-min flex-1 overflow-y-auto bg-white">{days}</div>
      </div>
      <div className="lg:w-80 space-y-4 flex-shrink-0 h-full flex flex-col">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-md">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Plus size={18} className="text-blue-600"/> Nuevo Examen</h3>
          <div className="space-y-3">
            <select value={newExamSub} onChange={e => setNewExamSub(e.target.value)} className="w-full p-3 text-sm border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all">
              <option value="">Seleccionar...</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <div className="w-full p-3 text-sm font-mono font-bold text-blue-800 bg-white border border-blue-200 rounded-lg text-center shadow-inner">{selectedDateStr}</div>
            <Button onClick={addExam} className="w-full shadow-lg shadow-blue-200">Guardar Examen</Button>
          </div>
        </Card>
        <Card className="flex-1 overflow-y-auto min-h-0 shadow-md flex flex-col">
          <h3 className="font-bold mb-3 text-sm uppercase text-slate-400 border-b pb-2">Lista de Eventos</h3>
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {exams.sort((a,b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'))).map(e => {
              const color = getSubjectColor(e.subject);
              return (
              <div key={e.id} className={`flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-md group transition-all ${color.bg}`} style={{ borderLeft: `4px solid ${color.fill}` }}>
                <div><div className="font-bold text-sm text-slate-700">{e.subject}</div><div className="text-xs text-slate-400 font-mono bg-white/50 px-1.5 py-0.5 rounded inline-block mt-1">{e.date}</div></div>
                <button onClick={() => deleteExam(e.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full transition-all"><Trash2 size={16} /></button>
              </div>
            )})}
            {!exams.length && <div className="text-center text-slate-400 text-sm py-4 italic">No hay exámenes a la vista</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// 4. SALA ESTUDIO
const TimerView = ({ subjects, exams, userId }) => {
  const [sel, setSel] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const bestSubject = useMemo(() => {
    if (!subjects.length) return null;
    let best = null, maxScore = -1;
    subjects.forEach(s => {
      const { score, reason } = calculatePriority(s, exams);
      if(score > maxScore) { maxScore = score; best = { ...s, reason }; }
    });
    return best;
  }, [subjects, exams]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused]);

  const handleStart = () => {
    if (!sel) return alert("Elige asignatura");
    setIsActive(true);
    setIsPaused(false);
  };

  const handleStop = async () => {
    setIsActive(false); setIsPaused(false);
    const minutes = Math.floor(elapsed / 60);
    if (minutes > 0) {
      await addDoc(collection(db, 'users', userId, 'history'), { subject: sel, minutes: minutes, date: new Date().toISOString() });
      alert(`¡Sesión guardada! ${minutes} minutos.`);
    }
    setElapsed(0);
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center animate-in zoom-in duration-300">
      {!isActive ? (
        <Card className="w-full space-y-6 p-8 border-t-4 border-t-blue-500 shadow-xl">
          <h2 className="text-3xl font-bold text-slate-800">Cronómetro de Estudio</h2>
          {bestSubject && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left flex items-start gap-3">
              <Flame className="text-orange-500 shrink-0 mt-1" />
              <div>
                <div className="font-bold text-amber-900 text-sm uppercase tracking-wide">Recomendación Prioritaria</div>
                <div className="font-bold text-slate-800 text-lg" style={{color: getSubjectColor(bestSubject.name).fill}}>{bestSubject.name}</div>
                <p className="text-xs text-amber-700 mt-1">{bestSubject.reason}</p>
                <button onClick={() => setSel(bestSubject.name)} className="text-xs text-blue-600 hover:underline mt-2 font-medium">Seleccionar esta asignatura</button>
              </div>
            </div>
          )}
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Asignatura</label>
              <select value={sel} onChange={e=>setSel(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-200 transition-all">
                <option value="">Elige asignatura...</option>
                {subjects.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <Button onClick={handleStart} className="w-full py-4 text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300 flex justify-center gap-2"><Play size={24} fill="currentColor"/> INICIAR CRONÓMETRO</Button>
        </Card>
      ) : (
        <div className="w-full space-y-8">
          <div>
            <div className={`text-2xl font-bold mb-4 animate-pulse bg-slate-50 inline-block px-4 py-1 rounded-full`} style={{ color: getSubjectColor(sel).fill }}>{sel}</div>
            <div className={`text-[5rem] md:text-[7rem] font-mono font-bold text-slate-800 leading-none tracking-tighter drop-shadow-sm ${isPaused ? 'opacity-50' : ''}`}>{formatTime(elapsed)}</div>
            {isPaused && <div className="text-amber-500 font-bold uppercase tracking-widest mt-2">En Pausa</div>}
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={() => setIsPaused(!isPaused)} className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-all shadow-lg">
              {isPaused ? <Play size={32} fill="currentColor"/> : <Pause size={32} fill="currentColor"/>}
            </button>
            <button onClick={handleStop} className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all shadow-lg"><Square size={32} fill="currentColor"/></button>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. STATS
const StatsView = ({ subjects, history }) => {
  const stats = useMemo(() => {
    if(!history.length) return null;
    const total = history.reduce((a,b)=>a+b.minutes,0);
    const subTot = {}; history.forEach(h=>subTot[h.subject]=(subTot[h.subject]||0)+h.minutes);
    const top = Object.keys(subTot).reduce((a,b)=>subTot[a]>subTot[b]?a:b, "");
    
    const dates = [...new Set(history.map(h=>h.date.split('T')[0]))].sort().reverse();
    let streak = 0;
    if(dates.length>0) {
        const today = new Date().toISOString().split('T')[0];
        const yest = new Date(Date.now()-86400000).toISOString().split('T')[0];
        if(dates[0]===today || dates[0]===yest) {
            streak=1;
            let curr = new Date(dates[0]);
            for(let i=1; i<dates.length; i++) {
                const prev = new Date(dates[i]);
                if(Math.ceil(Math.abs(curr-prev)/86400000)===1) { streak++; curr=prev; } else break;
            }
        }
    }

    const last7 = [...Array(7)].map((_,i)=>{
        const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().split('T')[0];
    });
    const weekly = last7.map(d=>({d, m: history.filter(h=>h.date.startsWith(d)).reduce((a,b)=>a+b.minutes,0)}));
    const maxDay = Math.max(...weekly.map(w=>w.m), 1);
    const bd = Object.entries(subTot).sort(([,a],[,b])=>b-a).map(([n,m])=>({n,m, p:Math.round((m/total)*100), s:history.filter(h=>h.subject===n).length}));

    return { total, top, streak, weekly, maxDay, bd };
  }, [history]);

  if(!stats) return <div className="text-center mt-20 text-slate-400">Sin datos aún</div>;

  return (
    <div className="space-y-6 pt-4 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded"><Clock size={24}/></div>
            <div><div className="text-xs text-slate-500 font-bold">TIEMPO TOTAL</div><div className="text-2xl font-bold">{(stats.total/60).toFixed(1)}h</div></div>
        </div>
        <div className="bg-white p-5 rounded-xl border flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded"><Flame size={24}/></div>
            <div><div className="text-xs text-slate-500 font-bold">RACHA</div><div className="text-2xl font-bold">{stats.streak} días</div></div>
        </div>
        <div className="bg-white p-5 rounded-xl border flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded"><Trophy size={24}/></div>
            <div><div className="text-xs text-slate-500 font-bold">TOP ASIGNATURA</div><div className="text-xl font-bold truncate max-w-[120px]" style={{color: getSubjectColor(stats.top).fill}}>{stats.top}</div></div>
        </div>
      </div>

      <Card className="h-64 flex flex-col">
        <h3 className="font-bold mb-4 flex gap-2"><TrendingUp size={18}/> Actividad Semanal</h3>
        <div className="flex-1 flex items-end gap-2 justify-between">
            {stats.weekly.map((d,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div className="w-full max-w-[30px] bg-blue-500 rounded-t hover:bg-blue-600 transition-all" style={{height:`${(d.m/stats.maxDay)*150}px`, minHeight:'4px'}}></div>
                    <div className="text-[10px] mt-2 text-slate-400">{new Date(d.d).getDate()}</div>
                    <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{d.m}m</div>
                </div>
            ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-4">Desglose</h3>
        <div className="space-y-4">
            {stats.bd.map(i=>{
                const c = getSubjectColor(i.n);
                return (
                <div key={i.n}>
                    <div className="flex justify-between text-sm mb-1 font-bold text-slate-700"><span>{i.n}</span><span className="text-slate-400 text-xs font-normal">{i.m}m ({i.s} ses)</span></div>
                    <div className="h-2 bg-slate-100 rounded overflow-hidden"><div className="h-full" style={{width:`${i.p}%`, backgroundColor: c.fill}}></div></div>
                </div>
            )})}
        </div>
      </Card>
    </div>
  );
};

// 6. CONFIG
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
          {subjects.map(s => {
            const c = getSubjectColor(s.name);
            return (
            <div key={s.id} className={`flex justify-between p-3 border rounded items-center ${c.bg} ${c.border}`}>
              <div><div className={`font-bold ${c.text}`}>{s.name}</div><div className="text-xs text-slate-500">Dif: {s.difficulty}</div></div>
              <div className="flex gap-2">
                <button onClick={()=>{setName(s.name); setDiff(s.difficulty); setRatio((s.ratio||0.5)*100)}} className="text-blue-500"><Settings size={16}/></button>
                <button onClick={()=>del(s.id, s.name)} className="text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          )})}
        </div>
      </Card>
    </div>
  );
};
