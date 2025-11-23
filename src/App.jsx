import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
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
  LogIn
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

// --- COLORES & ESTILOS ---
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

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  // Carga de Datos (Solo si hay usuario)
  useEffect(() => {
    if (!user) {
        setSubjects([]); setExams([]); setHistory([]); setTodos([]);
        return;
    }
    
    // Sincronización en tiempo real vinculada al UID del usuario
    const unsubSub = onSnapshot(collection(db, 'users', user.uid, 'subjects'), s => setSubjects(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExams = onSnapshot(collection(db, 'users', user.uid, 'exams'), s => setExams(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubHist = onSnapshot(collection(db, 'users', user.uid, 'history'), s => setHistory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTodos = onSnapshot(collection(db, 'users', user.uid, 'todos'), s => setTodos(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubSub(); unsubExams(); unsubHist(); unsubTodos(); };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  const handleLogout = () => signOut(auth);

  // --- PANTALLA DE LOGIN ---
  if (loadingAuth) return <div className="flex h-screen items-center justify-center text-slate-500">Cargando...</div>;

  if (!user) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido a StudyMaster</h1>
        <p className="text-slate-500 mb-8">Tu centro de estudio inteligente, sincronizado en todos tus dispositivos.</p>
        
        <Button onClick={handleLogin} variant="google" className="w-full flex items-center justify-center gap-3 py-3 text-lg shadow-sm">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
          Continuar con Google
        </Button>
        <p className="text-xs text-slate-400 mt-6">Tus datos se guardarán de forma segura en la nube.</p>
      </div>
    </div>
  );

  // --- APP LOGUEADA ---
  return (
    <div className={`min-h-screen ${COLORS.bg} flex flex-col md:flex-row font-sans text-slate-800`}>
      {/* Navegación */}
      <nav className="md:w-64 bg-slate-900 text-slate-300 flex md:flex-col justify-between md:h-screen sticky bottom-0 md:top-0 z-50 order-2 md:order-1">
        <div className="p-4 hidden md:block">
          <h1 className="text-2xl font-bold text-white">StudyMaster</h1>
          <div className="flex items-center gap-2 mt-2">
            <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full" />
            <p className="text-xs text-slate-400 truncate">{user.displayName}</p>
          </div>
        </div>
        
        <div className="flex md:flex-col flex-1 justify-around md:justify-start md:px-2 overflow-x-auto no-scrollbar">
          <NavBtn id="dashboard" icon={LayoutDashboard} label="Dashboard" active={activeTab} set={setActiveTab} />
          <NavBtn id="todo" icon={ListTodo} label="Planificador" active={activeTab} set={setActiveTab} />
          <NavBtn id="calendar" icon={CalIcon} label="Calendario" active={activeTab} set={setActiveTab} />
          <NavBtn id="timer" icon={Timer} label="Sala Estudio" active={activeTab} set={setActiveTab} />
          <NavBtn id="stats" icon={BarChart3} label="Estadísticas" active={activeTab} set={setActiveTab} />
          <NavBtn id="config" icon={Settings} label="Configuración" active={activeTab} set={setActiveTab} />
        </div>

        <div className="hidden md:block p-4">
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                <LogOut size={16} /> Cerrar Sesión
            </button>
        </div>
      </nav>

      {/* Contenido */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen order-1 md:order-2 relative">
        {/* Botón Logout Móvil */}
        <div className="md:hidden absolute top-4 right-4 z-10">
             <button onClick={handleLogout} className="p-2 bg-white rounded-full shadow text-slate-600"><LogOut size={20}/></button>
        </div>

        {activeTab === 'dashboard' && <DashboardView subjects={subjects} exams={exams} />}
        {activeTab === 'todo' && <TodoView subjects={subjects} exams={exams} todos={todos} userId={user.uid} />}
        {activeTab === 'calendar' && <CalendarView subjects={subjects} exams={exams} userId={user.uid} />}
        {activeTab === 'timer' && <TimerView subjects={subjects} userId={user.uid} />}
        {activeTab === 'stats' && <StatsView subjects={subjects} history={history} />}
        {activeTab === 'config' && <ConfigView subjects={subjects} exams={exams} userId={user.uid} />}
      </main>
    </div>
  );
}

const NavBtn = ({ id, icon: Icon, label, active, set }) => (
  <button onClick={() => set(id)} className={`flex flex-col md:flex-row items-center md:px-4 md:py-3 p-3 rounded-lg transition-colors ${active === id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
    <Icon size={20} className="md:mr-3 mb-1 md:mb-0" />
    <span className="text-[10px] md:text-sm font-medium">{label}</span>
  </button>
);

// --- VISTAS (IGUAL QUE v15) ---

// 1. DASHBOARD
const DashboardView = ({ subjects, exams }) => {
  const getStatus = (subjName) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const subExams = exams.filter(e => e.subject === subjName)
      .map(e => ({ ...e, d: new Date(e.date.split('/').reverse().join('-')) }))
      .filter(e => e.d >= today).sort((a,b) => a.d - b.d);
    
    if (!subExams.length) return { label: "⚠️ No al día", color: "text-amber-600 bg-amber-50", days: 999 };
    const days = Math.ceil((subExams[0].d - today) / (86400000));
    if (days <= 3) return { label: "🚨 CRÍTICO", color: "text-red-600 bg-red-50", days };
    if (days <= 7) return { label: "🔥 Urgente", color: "text-orange-600 bg-orange-50", days };
    return { label: "⚠️ No al día", color: "text-amber-600 bg-amber-50", days };
  };

  const suggest = () => {
    if(!subjects.length) return alert("Añade asignaturas primero.");
    let best = null, maxScore = -1;
    subjects.forEach(s => {
      const st = getStatus(s.name);
      let sc = (s.difficulty || 2) * 10;
      if (st.days <= 2) sc *= 10; else if (st.days <= 7) sc *= 5; else sc *= 1.5;
      if(sc > maxScore) { maxScore = sc; best = s; }
    });
    if(best) alert(`🤖 EL COACH SUGIERE:\n\n👉 ${best.name.toUpperCase()}\n\nEs tu prioridad actual por dificultad y urgencia.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pt-10 md:pt-0">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Global</h2>
        <Button variant="purple" onClick={suggest} className="flex gap-2 items-center text-sm"><Lightbulb size={16}/> Coach IA</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map(s => {
          const st = getStatus(s.name);
          return (
            <Card key={s.id} className="hover:shadow-md transition-all">
              <div className="flex justify-between mb-3">
                <h3 className="font-bold text-lg">{s.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${st.color}`}>{st.label}</span>
              </div>
              <div className="space-y-1 text-sm text-slate-500">
                <p className="flex justify-between"><span>Dificultad:</span> <span className="font-medium text-slate-700">{s.difficulty}</span></p>
                <p className="flex justify-between"><span>Días Restantes:</span> <span className="font-medium text-slate-700">{st.days === 999 ? '-' : st.days}</span></p>
                <div className="pt-2 border-t mt-2 flex items-center gap-2">
                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-400" style={{width: `${(s.ratio||0.5)*100}%`}}></div>
                   </div>
                   <span className="text-[10px] font-bold text-blue-500">{Math.round((s.ratio||0.5)*100)}% Teoría</span>
                </div>
              </div>
            </Card>
          )
        })}
        {!subjects.length && (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            <p className="mb-2">Tu panel está vacío</p>
            <p className="text-sm">Ve a la pestaña "Configuración" para añadir tus asignaturas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. TO-DO VIEW
const TodoView = ({ subjects, exams, todos, userId }) => {
  const [hours, setHours] = useState(2);
  const [sel, setSel] = useState({});
  
  const gen = async () => {
    todos.forEach(t => deleteDoc(doc(db, 'users', userId, 'todos', t.id)));
    const sels = Object.keys(sel).filter(k => sel[k]);
    const targets = sels.length > 0 ? sels : subjects.map(s => s.name);
    if (!targets.length) return alert("No hay asignaturas configuradas.");
    const totalMins = hours * 60;
    let scores = {};
    const today = new Date(); today.setHours(0,0,0,0);
    targets.forEach(name => {
      const s = subjects.find(sb => sb.name === name);
      if(!s) return;
      let base = (s.difficulty || 2) * 10;
      let minDays = 999;
      exams.filter(e => e.subject === name).forEach(e => {
         const d = new Date(e.date.split('/').reverse().join('-'));
         const diff = Math.ceil((d - today)/86400000);
         if(diff >= 0) minDays = Math.min(minDays, diff);
      });
      if(minDays <= 2) base *= 10; else if(minDays <= 7) base *= 4;
      scores[name] = base; 
    });
    const totalP = Object.values(scores).reduce((a,b)=>a+b, 0) || 1;
    for (const name of targets) {
      if(!scores[name]) continue;
      const mins = Math.floor(totalMins * (scores[name] / totalP));
      if (mins < 15 && scores[name] < 50) continue;
      const s = subjects.find(sb => sb.name === name);
      const ratioT = s?.ratio || 0.5;
      const tasks = [];
      if (ratioT > 0.8) tasks.push({t:'Teoría', m: mins});
      else if (ratioT < 0.2) tasks.push({t:'Práctica', m: mins});
      else {
        const tT = Math.floor(mins * ratioT);
        const tP = mins - tT;
        if(tT >= 15) tasks.push({t:'Teoría', m: tT});
        if(tP >= 15) tasks.push({t:'Práctica', m: tP});
      }
      for(let task of tasks) await addDoc(collection(db, 'users', userId, 'todos'), { subject: name, type: task.t, mins: task.m, done: false });
    }
  };

  const progress = useMemo(() => {
    if(!todos.length) return 0;
    return Math.round((todos.filter(t=>t.done).length / todos.length) * 100);
  }, [todos]);

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full animate-in fade-in duration-300 pt-10 md:pt-0">
      <div className="md:col-span-1 space-y-4">
        <Card>
          <h3 className="font-bold mb-4 text-slate-700">Generador de Rutina</h3>
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-400">Horas Hoy</label>
            <input type="number" value={hours} onChange={e=>setHours(e.target.value)} className="w-full p-2 border rounded mt-1" step="0.5" />
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Asignaturas (Opcional)</label>
            <div className="max-h-40 overflow-y-auto border p-2 rounded bg-slate-50">
              {subjects.map(s => (
                <label key={s.id} className="flex items-center gap-2 p-1 hover:bg-slate-100 cursor-pointer">
                  <input type="checkbox" checked={!!sel[s.name]} onChange={()=>setSel(prev=>({...prev, [s.name]: !prev[s.name]}))} className="rounded text-blue-600" />
                  <span className="text-sm">{s.name}</span>
                </label>
              ))}
            </div>
          </div>
          <Button onClick={gen} className="w-full">⚡ Generar Tareas</Button>
        </Card>
      </div>
      <div className="md:col-span-2 flex flex-col h-full">
        <div className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Progreso</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 bg-white p-4 rounded-xl shadow-inner border border-slate-200">
          {!todos.length && <div className="text-center text-slate-400 mt-10">Lista vacía. Genera una rutina.</div>}
          {todos.map(t => (
            <div key={t.id} onClick={()=>updateDoc(doc(db, 'users', userId, 'todos', t.id), {done: !t.done})} className={`p-4 rounded-lg border cursor-pointer flex items-center gap-4 transition-all hover:shadow-sm ${t.done ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {t.done && <CheckSquare size={16} className="text-white" />}
              </div>
              <div className="flex-1">
                <div className={`font-bold ${t.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.subject} <span className="font-normal opacity-70">- {t.type}</span></div>
                <div className="text-xs text-slate-400">⏱ {t.mins} minutos</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. CALENDARIO
const CalendarView = ({ subjects, exams, userId }) => {
  const [date, setDate] = useState("");
  const [sub, setSub] = useState("");
  const add = async () => {
    if(!sub || !date) return alert("Faltan datos");
    const dObj = new Date(date);
    const dStr = `${dObj.getDate().toString().padStart(2,'0')}/${(dObj.getMonth()+1).toString().padStart(2,'0')}/${dObj.getFullYear()}`;
    await addDoc(collection(db, 'users', userId, 'exams'), { subject: sub, date: dStr });
    setSub("");
    alert("Examen añadido");
  };
  return (
    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300 pt-10 md:pt-0">
      <Card>
        <h3 className="font-bold mb-4 text-lg">Añadir Examen</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Asignatura</label>
            <select value={sub} onChange={e=>setSub(e.target.value)} className="w-full p-2 border rounded bg-slate-50">
              <option value="">Seleccionar...</option>
              {subjects.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Fecha</label>
            <input type="date" onChange={e=>setDate(e.target.value)} className="w-full p-2 border rounded bg-slate-50" />
          </div>
          <Button onClick={add} className="w-full">Guardar Examen</Button>
        </div>
      </Card>
      <Card className="h-full overflow-hidden flex flex-col">
        <h3 className="font-bold mb-4 text-lg">Próximos Exámenes</h3>
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {exams.sort((a,b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'))).map(e => (
            <div key={e.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border hover:border-red-200 group">
              <div>
                <div className="font-bold text-slate-800">{e.subject}</div>
                <div className="text-xs text-slate-500 font-mono">{e.date}</div>
              </div>
              <button onClick={()=>deleteDoc(doc(db, 'users', userId, 'exams', e.id))} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
          {!exams.length && <div className="text-slate-400 text-center py-4 text-sm">No hay exámenes programados.</div>}
        </div>
      </Card>
    </div>
  );
};

// 4. SALA ESTUDIO
const TimerView = ({ subjects, userId }) => {
  const [sel, setSel] = useState("");
  const [min, setMin] = useState(45);
  const [left, setLeft] = useState(0);
  const [on, setOn] = useState(false);
  const [init, setInit] = useState(0);

  useEffect(() => {
    let i;
    if(on && left > 0) i = setInterval(() => setLeft(l=>l-1), 1000);
    else if(on && left===0) stop(true);
    return () => clearInterval(i);
  }, [on, left]);

  const start = () => { if(sel) { const s = min*60; setLeft(s); setInit(s); setOn(true); } else alert("Elige asignatura"); };
  
  const stop = async (fin) => {
    setOn(false);
    const done = Math.floor((init - left)/60);
    if(done>0) {
      await addDoc(collection(db, 'users', userId, 'history'), { subject: sel, minutes: done, date: new Date().toISOString() });
      alert(`Guardados ${done} min de ${sel}`);
    }
    setLeft(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center animate-in zoom-in duration-300">
      {!on ? (
        <Card className="w-full space-y-6 p-8">
          <h2 className="text-2xl font-bold text-slate-800">Sala de Estudio</h2>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">¿Qué vas a estudiar?</label>
              <select value={sel} onChange={e=>setSel(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50">
                <option value="">Elige asignatura...</option>
                {subjects.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tiempo (minutos)</label>
              <input type="number" value={min} onChange={e=>setMin(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" />
            </div>
          </div>
          <Button onClick={start} className="w-full py-4 text-lg shadow-lg shadow-blue-200">EMPEZAR SESIÓN</Button>
        </Card>
      ) : (
        <div className="w-full">
          <div className="text-2xl font-bold text-blue-600 mb-2 animate-pulse">{sel}</div>
          <div className="text-[6rem] md:text-[8rem] font-mono font-bold text-slate-800 leading-none tracking-tighter mb-8">
            {Math.floor(left/60).toString().padStart(2,'0')}:{(left%60).toString().padStart(2,'0')}
          </div>
          <Button variant="danger" onClick={()=>stop(false)} className="px-8 py-3 text-xl rounded-full shadow-lg shadow-red-200">TERMINAR AHORA</Button>
        </div>
      )}
    </div>
  );
};

// 5. STATS
const StatsView = ({ subjects, history }) => {
  const data = {};
  subjects.forEach(s => data[s.name]=0);
  history.forEach(h => { if(data[h.subject]!==undefined) data[h.subject]+=h.minutes; });
  const max = Math.max(...Object.values(data), 1);
  const total = Object.values(data).reduce((a,b)=>a+b,0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pt-10 md:pt-0">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs font-bold uppercase mb-1">Tiempo Total Acumulado</div>
          <div className="text-4xl font-bold">{Math.floor(total/60)}h <span className="text-slate-500 text-2xl">{total%60}m</span></div>
        </div>
        <BarChart3 size={40} className="text-blue-500" />
      </div>

      <Card>
        <h3 className="font-bold mb-6 text-lg">Desglose por Asignatura</h3>
        <div className="space-y-5">
          {Object.keys(data).map(k => (
            <div key={k}>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>{k}</span>
                <span className="text-slate-500">{data[k]} min</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${(data[k]/max)*100}%`}}></div>
              </div>
            </div>
          ))}
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
    if(exist) {
      await updateDoc(doc(db, 'users', userId, 'subjects', exist.id), { difficulty: Number(diff), ratio: ratio/100 });
    } else {
      await addDoc(collection(db, 'users', userId, 'subjects'), { name, difficulty: Number(diff), ratio: ratio/100 });
    }
    setName(""); 
    alert("Guardado");
  };

  const delSub = async (id, subName) => {
    if(!confirm(`¿Borrar ${subName} y sus exámenes? Esta acción no se puede deshacer.`)) return;
    await deleteDoc(doc(db, 'users', userId, 'subjects', id));
    const subExams = exams.filter(e => e.subject === subName);
    subExams.forEach(e => deleteDoc(doc(db, 'users', userId, 'exams', e.id)));
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300 pt-10 md:pt-0">
      <Card className="space-y-5">
        <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
          <Plus className="text-blue-600" size={20}/> Crear / Editar
        </h3>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nombre</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded bg-slate-50 focus:ring-2 ring-blue-200 outline-none" placeholder="Ej: Matemáticas" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Dificultad</label>
          <div className="flex gap-2">
            {[1,2,3].map(d => <button key={d} onClick={()=>setDiff(d)} className={`flex-1 py-2 border rounded transition-all ${diff===d?'bg-blue-600 text-white border-blue-600 shadow-md':'bg-white hover:bg-slate-50'}`}>{d}</button>)}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2 flex justify-between">
            <span>Perfil: {ratio}% Teoría</span>
          </label>
          <input type="range" min="0" max="100" value={ratio} onChange={e=>setRatio(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>Más Práctica</span><span>Más Teoría</span></div>
        </div>
        <Button onClick={save} className="w-full mt-4 shadow-lg shadow-blue-100">Guardar Asignatura</Button>
      </Card>

      <Card>
        <h3 className="font-bold text-lg border-b pb-2 mb-4 flex items-center gap-2">
          <ListTodo className="text-slate-600" size={20}/> Lista Actual
        </h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {subjects.map(s => (
            <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border group hover:bg-white hover:shadow-md transition-all duration-200">
              <div>
                <div className="font-bold text-slate-800">{s.name}</div>
                <div className="text-xs text-slate-500">Dif: {s.difficulty} | {Math.round((s.ratio||0.5)*100)}% T</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{setName(s.name); setDiff(s.difficulty); setRatio((s.ratio||0.5)*100)}} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Settings size={18}/></button>
                <button onClick={()=>delSub(s.id, s.name)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
          {!subjects.length && <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed rounded-lg">No hay asignaturas configuradas.</div>}
        </div>
      </Card>
    </div>
  );
};
