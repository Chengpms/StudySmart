import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
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
  Maximize2
} from 'lucide-react';

// --- TU CONFIGURACIÓN DE FIREBASE (SE MANTIENE) ---
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

  // Carga de Datos
  useEffect(() => {
    if (!user) {
        setSubjects([]); setExams([]); setHistory([]); setTodos([]);
        return;
    }
    // Persistencia: Estos listeners mantienen los datos sincronizados con la nube
    const unsubSub = onSnapshot(collection(db, 'users', user.uid, 'subjects'), s => setSubjects(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExams = onSnapshot(collection(db, 'users', user.uid, 'exams'), s => setExams(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubHist = onSnapshot(collection(db, 'users', user.uid, 'history'), s => setHistory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTodos = onSnapshot(collection(db, 'users', user.uid, 'todos'), s => setTodos(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubSub(); unsubExams(); unsubHist(); unsubTodos(); };
  }, [user]);

  // Auth Anónimo por defecto
  useEffect(() => {
    if (!loadingAuth && !user) {
       signInAnonymously(auth).catch(console.error);
    }
  }, [loadingAuth, user]);

  if (loadingAuth) return <div className="flex h-screen items-center justify-center text-slate-500">Cargando...</div>;

  // --- APP RENDER ---
  return (
    <div className={`h-screen ${COLORS.bg} flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden`}>
      {/* Navegación */}
      <nav className="md:w-64 bg-slate-900 text-slate-300 flex md:flex-col justify-between md:h-screen z-50 order-2 md:order-1 shrink-0 shadow-xl">
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-white tracking-wider">StudyMaster</h1>
          <div className="flex items-center gap-2 mt-3 p-2 bg-slate-800 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm text-white font-bold shadow-md">
              {user?.isAnonymous ? 'A' : 'G'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-300 font-medium truncate">{user?.isAnonymous ? 'Modo Invitado' : user?.displayName}</p>
              <p className="text-[10px] text-slate-500">En línea</p>
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
      </nav>

      {/* Contenido */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto h-full order-1 md:order-2 relative scroll-smooth">
        {activeTab === 'dashboard' && <DashboardView subjects={subjects} exams={exams} />}
        {activeTab === 'todo' && <TodoView subjects={subjects} exams={exams} todos={todos} userId={user?.uid} />}
        {activeTab === 'calendar' && <CalendarView subjects={subjects} exams={exams} userId={user?.uid} />}
        {activeTab === 'timer' && <TimerView subjects={subjects} userId={user?.uid} />}
        {activeTab === 'stats' && <StatsView subjects={subjects} history={history} />}
        {activeTab === 'config' && <ConfigView subjects={subjects} exams={exams} userId={user?.uid} />}
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pt-4">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <LayoutDashboard className="text-blue-600"/> Dashboard Global
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map(s => {
          const st = getStatus(s.name);
          return (
            <Card key={s.id} className="hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 border-l-blue-500">
              <div className="flex justify-between mb-3 items-start">
                <h3 className="font-bold text-lg text-slate-800">{s.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold border ${st.color}`}>{st.label}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between bg-slate-50 p-2 rounded">
                  <span>Dificultad:</span> 
                  <span className="font-bold flex gap-1">
                    {[...Array(s.difficulty)].map((_,i)=><span key={i} className="text-blue-500">★</span>)}
                  </span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded">
                  <span>Días Restantes:</span> 
                  <span className="font-bold">{st.days === 999 ? '-' : st.days}</span>
                </div>
                <div className="pt-2 border-t mt-2 flex items-center gap-2">
                   <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" style={{width: `${(s.ratio||0.5)*100}%`}}></div>
                   </div>
                   <span className="text-[10px] font-bold text-indigo-600">{Math.round((s.ratio||0.5)*100)}% Teoría</span>
                </div>
              </div>
            </Card>
          )
        })}
        {!subjects.length && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            <Settings size={48} className="mb-4 opacity-20"/>
            <p className="text-lg font-medium">Tu panel está vacío</p>
            <p className="text-sm">Ve a la pestaña "Configuración" para añadir tus asignaturas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. TO-DO VIEW (CON PERSISTENCIA LOCAL)
const TodoView = ({ subjects, exams, todos, userId }) => {
  // Persistencia local para configuración de sesión (no datos críticos, solo preferencias UI)
  const [hours, setHours] = useState(() => localStorage.getItem('sm_hours') || 2);
  const [sel, setSel] = useState(() => {
    try {
        const saved = localStorage.getItem('sm_sel');
        return saved ? JSON.parse(saved) : {};
    } catch { return {} }
  });
  
  useEffect(() => { localStorage.setItem('sm_hours', hours); }, [hours]);
  useEffect(() => { localStorage.setItem('sm_sel', JSON.stringify(sel)); }, [sel]);

  const toggleSel = (name) => {
    setSel(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const gen = async () => {
    todos.forEach(t => deleteDoc(doc(db, 'users', userId, 'todos', t.id)));
    const sels = Object.keys(sel).filter(k => sel[k]);
    const targets = sels.length > 0 ? sels : subjects.map(s => s.name);
    
    if (!targets.length) return alert("No hay asignaturas disponibles. Añádelas en Configuración.");
    
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
    <div className="grid md:grid-cols-3 gap-6 h-full animate-in fade-in duration-300 pt-4">
      <div className="md:col-span-1 space-y-4">
        <Card className="border-blue-100 shadow-md">
          <h3 className="font-bold mb-4 text-slate-800 flex items-center gap-2">
            <ListTodo size={20} className="text-blue-600"/> Configurar Sesión
          </h3>
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-400">Horas Hoy</label>
            <input 
              type="number" 
              value={hours} 
              onChange={e=>setHours(e.target.value)} 
              className="w-full p-3 border border-slate-200 rounded-lg mt-1 text-lg font-medium focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
              step="0.5" 
            />
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Selección (Opcional)</label>
            <div className="max-h-60 overflow-y-auto border border-slate-200 p-2 rounded-lg bg-slate-50">
              {subjects.map(s => (
                <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={!!sel[s.name]} 
                    onChange={()=>toggleSel(s.name)} 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  <span className="text-sm font-medium text-slate-700">{s.name}</span>
                </label>
              ))}
              {!subjects.length && <div className="text-xs text-slate-400 p-2">Sin asignaturas</div>}
            </div>
          </div>
          <Button onClick={gen} className="w-full py-3 shadow-lg shadow-blue-100">⚡ Generar Rutina</Button>
        </Card>
      </div>

      <div className="md:col-span-2 flex flex-col h-full">
        <div className="mb-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-slate-600">Progreso Diario</span>
            <span className="text-blue-600 text-lg">{progress}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{width: `${progress}%`}}></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 bg-white p-4 rounded-xl shadow-inner border border-slate-200 custom-scrollbar">
          {!todos.length && (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <CheckSquare size={64} className="mb-4 opacity-20"/>
              <p>Tu lista está vacía. ¡Configura y genera!</p>
            </div>
          )}
          {todos.map(t => (
            <div key={t.id} onClick={()=>updateDoc(doc(db, 'users', userId, 'todos', t.id), {done: !t.done})} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all duration-200 ${t.done ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'}`}>
              <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 text-white'}`}>
                <CheckSquare size={18} className={t.done ? 'text-white' : 'hidden'} />
              </div>
              <div className="flex-1">
                <div className={`font-bold text-lg ${t.done ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'}`}>{t.subject}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${t.type === 'Teoría' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'}`}>{t.type}</span>
                  <span>⏱ {t.mins} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. CALENDARIO GRANDE (FULL SCREEN & BIG NUMBERS)
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
  for (let i = 0; i < adjustedFirstDay; i++) days.push(<div key={`empty-${i}`} className="bg-slate-50/30 border-r border-b border-slate-100"></div>);
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
    const dayExams = exams.filter(e => e.date === dateStr);
    const isToday = new Date().getDate() === d && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
    const isSelected = selectedDateStr === dateStr;

    days.push(
      <div 
        key={d} 
        onClick={() => handleDayClick(d)}
        className={`
          min-h-[120px] border-r border-b border-slate-100 p-2 cursor-pointer transition-all relative group flex flex-col
          ${isToday ? 'bg-blue-50/40' : 'bg-white hover:bg-slate-50'} 
          ${isSelected ? 'ring-2 ring-inset ring-blue-500 z-10' : ''}
        `}
      >
        <div className="flex justify-between items-start mb-1">
          {/* NÚMERO GRANDE */}
          <span className={`text-3xl font-bold leading-none ${isToday ? 'text-blue-600' : 'text-slate-700 opacity-50 group-hover:opacity-80'}`}>{d}</span>
        </div>
        
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar mt-1">
          {dayExams.map(e => (
            <div key={e.id} className="text-[11px] bg-red-100 text-red-900 px-2 py-1 rounded border-l-4 border-l-red-500 border-y border-r border-red-100 font-bold shadow-sm flex justify-between items-center group/exam transition-all hover:shadow-md hover:bg-red-200 truncate">
              <span className="truncate w-full">{e.subject}</span>
              <button 
                onClick={(ev) => { ev.stopPropagation(); deleteExam(e.id); }}
                className="opacity-0 group-hover/exam:opacity-100 hover:text-red-700 rounded p-0.5 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in duration-300 pt-2 pb-4">
      {/* Calendario Grande */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden h-full">
        <div className="p-4 flex justify-between items-center border-b bg-white z-20 relative">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-2xl text-slate-800 capitalize">
              {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1))} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm font-bold hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors">HOY</button>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1))} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-3 border-b bg-slate-50 shadow-sm z-10">
          <div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div><div>DOM</div>
        </div>
        
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
          {days}
        </div>
      </div>

      {/* Panel Lateral */}
      <div className="lg:w-80 space-y-4 flex-shrink-0 h-full flex flex-col">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-md">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-600"/> Nuevo Examen
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Asignatura</label>
              <select 
                value={newExamSub} 
                onChange={e => setNewExamSub(e.target.value)}
                className="w-full p-3 text-sm border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              >
                <option value="">Seleccionar...</option>
                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Fecha Seleccionada</label>
              <div className="w-full p-3 text-sm font-mono font-bold text-blue-800 bg-white border border-blue-200 rounded-lg text-center shadow-inner">
                {selectedDateStr}
              </div>
            </div>
            <Button onClick={addExam} className="w-full shadow-lg shadow-blue-200">Guardar Examen</Button>
          </div>
        </Card>

        <Card className="flex-1 overflow-y-auto min-h-0 shadow-md flex flex-col">
          <h3 className="font-bold mb-3 text-sm uppercase text-slate-400 border-b pb-2">Lista de Eventos</h3>
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {exams
              .sort((a,b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')))
              .map(e => (
              <div key={e.id} className="flex justify-between items-center p-3 bg-white rounded-lg border hover:border-red-300 hover:shadow-md group transition-all">
                <div>
                  <div className="font-bold text-sm text-slate-700">{e.subject}</div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1 border border-slate-200">{e.date}</div>
                </div>
                <button onClick={() => deleteExam(e.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {!exams.length && (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <CalIcon size={32} className="mb-2 opacity-20"/>
                <span className="text-sm italic">Sin exámenes</span>
              </div>
            )}
          </div>
        </Card>
      </div>
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
        <Card className="w-full space-y-6 p-8 border-t-4 border-t-blue-500 shadow-xl">
          <h2 className="text-3xl font-bold text-slate-800">Sala de Estudio</h2>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">¿Qué vas a estudiar?</label>
              <select value={sel} onChange={e=>setSel(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-200 transition-all">
                <option value="">Elige asignatura...</option>
                {subjects.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tiempo (minutos)</label>
              <input type="number" value={min} onChange={e=>setMin(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>
          </div>
          <Button onClick={start} className="w-full py-4 text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300">EMPEZAR SESIÓN</Button>
        </Card>
      ) : (
        <div className="w-full">
          <div className="text-2xl font-bold text-blue-600 mb-4 animate-pulse bg-blue-50 inline-block px-4 py-1 rounded-full">{sel}</div>
          <div className="text-[6rem] md:text-[8rem] font-mono font-bold text-slate-800 leading-none tracking-tighter mb-12 drop-shadow-sm">
            {Math.floor(left/60).toString().padStart(2,'0')}:{(left%60).toString().padStart(2,'0')}
          </div>
          <Button variant="danger" onClick={()=>stop(false)} className="px-10 py-4 text-xl rounded-full shadow-xl shadow-red-200 hover:shadow-red-300 hover:scale-105">TERMINAR AHORA</Button>
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
    <div className="space-y-6 animate-in fade-in duration-300 pt-4">
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">Tiempo Total Acumulado</div>
          <div className="text-5xl font-bold">{Math.floor(total/60)}h <span className="text-slate-500 text-3xl">{total%60}m</span></div>
        </div>
        <BarChart3 size={56} className="text-blue-500 relative z-10" />
      </div>

      <Card className="shadow-lg">
        <h3 className="font-bold mb-6 text-lg text-slate-800 flex items-center gap-2">
          <BarChart3 size={20} className="text-slate-400"/> Desglose por Asignatura
        </h3>
        <div className="space-y-6">
          {Object.keys(data).map(k => (
            <div key={k}>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-slate-700">{k}</span>
                <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs">{data[k]} min</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out rounded-full" style={{width: `${(data[k]/max)*100}%`}}></div>
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
    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300 pt-4">
      <Card className="space-y-6 border-blue-100 shadow-lg">
        <h3 className="font-bold text-lg border-b pb-4 flex items-center gap-2 text-blue-900">
          <Plus className="bg-blue-100 text-blue-600 p-1 rounded-md" size={24}/> Crear / Editar Asignatura
        </h3>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nombre</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="Ej: Matemáticas" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Dificultad</label>
          <div className="flex gap-2">
            {[1,2,3].map(d => <button key={d} onClick={()=>setDiff(d)} className={`flex-1 py-3 border rounded-lg transition-all font-bold ${diff===d?'bg-blue-600 text-white border-blue-600 shadow-md':'bg-white hover:bg-slate-50 text-slate-600'}`}>{d}</button>)}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2 flex justify-between">
            <span>Perfil: {ratio}% Teoría</span>
          </label>
          <input type="range" min="0" max="100" value={ratio} onChange={e=>setRatio(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium"><span>Más Práctica</span><span>Más Teoría</span></div>
        </div>
        <Button onClick={save} className="w-full mt-4 shadow-md shadow-blue-200 py-3">Guardar Asignatura</Button>
      </Card>

      <Card className="shadow-lg">
        <h3 className="font-bold text-lg border-b pb-4 mb-4 flex items-center gap-2 text-slate-700">
          <ListTodo className="text-slate-400" size={24}/> Asignaturas Actuales
        </h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {subjects.map(s => (
            <div key={s.id} className="flex justify-between items-center p-4 bg-white rounded-lg border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
              <div>
                <div className="font-bold text-slate-800 text-lg">{s.name}</div>
                <div className="text-xs text-slate-500 mt-1 flex gap-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Dif: {s.difficulty}</span>
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{Math.round((s.ratio||0.5)*100)}% Teoría</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>{setName(s.name); setDiff(s.difficulty); setRatio((s.ratio||0.5)*100)}} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Settings size={18}/></button>
                <button onClick={()=>delSub(s.id, s.name)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
          {!subjects.length && (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              <p>No hay asignaturas.</p>
              <p className="text-sm">Usa el formulario de la izquierda.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
