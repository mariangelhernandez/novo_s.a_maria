// ============================================
// 1. BASE DE DADOS SIMULADA (LOCALSTORAGE)
// ============================================
const MOCK_DATA_KEY = 'MORELIFE_MOCK_DATABASE';

const defaultDatabase = {
    users: [
        {
            id: "u-patient-test",
            name: "Maria da Silva Silveira",
            email: "p@ml.com",
            password: "123",
            role: "patient",
            cpf: "501 234 567",
            phone: "912 345 678",
            income: "850"
        },
        {
            id: "u-doc-1",
            name: "Dr. Roberto de Souza",
            email: "d@ml.com",
            password: "123",
            role: "doctor",
            professionalId: "CÉD-88921",
            university: "Faculdade de Medicina Dentária (FMDUL)",
            specialty: "Medicina Dentária"
        },
        {
            id: "u-doc-2",
            name: "Dra. Flávia Albuquerque",
            email: "flavia@ml.com",
            password: "123",
            role: "doctor",
            professionalId: "OP-44231",
            university: "Faculdade de Psicologia de Coimbra",
            specialty: "Psicologia"
        },
        {
            id: "u-doc-3",
            name: "Dr. Arthur Lima Mendes",
            email: "arthur@ml.com",
            password: "123",
            role: "doctor",
            professionalId: "CREF-55110",
            university: "Escola Superior de Saúde do Alcoitão",
            specialty: "Fisioterapia"
        },
        {
            id: "u-doc-4",
            name: "Dra. Camila Nogueira",
            email: "camila@ml.com",
            password: "123",
            role: "doctor",
            professionalId: "ON-99432",
            university: "Faculdade de Ciências da Nutrição do Porto",
            specialty: "Nutrição"
        }
    ],
    appointments: [
        {
            id: "ap-1",
            patientId: "u-patient-test",
            doctorId: "u-doc-1",
            specialty: "Medicina Dentária",
            description: "Preciso de uma consulta de urgência para tratamento de cárie. Sinto muitas dores ao mastigar alimentos frios e quentes.",
            status: "confirmed",
            date: "2026-06-05",
            time: "14:30",
            location: "Gabinete 4, Piso 1, Clínica Escola da Faculdade de Medicina Dentária"
        },
        {
            id: "ap-2",
            patientId: "u-patient-test",
            doctorId: null,
            specialty: "Psicologia",
            description: "Tenho tido episódios de ansiedade intensa antes dos exames escolares. Gostaria de falar com um terapeuta.",
            status: "pending",
            date: "",
            time: "",
            location: ""
        }
    ]
};

function getDatabase() {
    let db = localStorage.getItem(MOCK_DATA_KEY);
    if (!db) {
        localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(defaultDatabase));
        return defaultDatabase;
    }
    return JSON.parse(db);
}

function saveDatabase(db) {
    localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(db));
}

// ============================================
// 2. CONTROLO DE SESSÃO DO UTILIZADOR
// ============================================
let currentUser = null;

window.addEventListener('DOMContentLoaded', () => {
    const savedSession = sessionStorage.getItem('ML_ACTIVE_USER');
    if (savedSession) {
        currentUser = JSON.parse(savedSession);
    }
    updateImpactStats();
    renderSystem();
});

function scrollToSection(id) {
    goToHome();
    setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// ============================================
// 3. TOASTS DE NOTIFICAÇÃO
// ============================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    
    let bgClass = 'bg-[#105773]';
    if (type === 'error') bgClass = 'bg-rose-600';
    if (type === 'success') bgClass = 'bg-[#4BBF73]';
    if (type === 'warning') bgClass = 'bg-amber-500';

    toast.className = `${bgClass} text-white text-sm font-semibold px-6 py-4 rounded-2xl shadow-xl transition-all transform translate-y-2 opacity-0 duration-300 flex items-center gap-3`;
    toast.innerHTML = `
        <span>${type === 'error' ? '❌' : type === 'success' ? '✅' : '⚠️'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
    }, 50);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

function updateImpactStats() {
    const db = getDatabase();
    const totalConcluidas = db.appointments.filter(a => a.status === 'confirmed').length;
    const totalDocs = db.users.filter(u => u.role === 'doctor').length;
    
    const statsConsultas = document.getElementById('stats-consultas');
    const statsProfissionais = document.getElementById('stats-profissionais');
    
    if (statsConsultas) statsConsultas.innerText = `${1420 + totalConcluidas}+`;
    if (statsProfissionais) statsProfissionais.innerText = `${280 + totalDocs}+`;
}

// ============================================
// 4. AUTENTICAÇÃO, LOGIN E CADASTRO
// ============================================
function openRegisterModal(preferredRole = 'patient') {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('auth-modal').classList.add('flex');
    switchAuthTab('register');
    
    const radios = document.getElementsByName('reg-role');
    for(let radio of radios) {
        if(radio.value === preferredRole) {
            radio.checked = true;
        }
    }
    toggleRegisterFormFields(preferredRole);
}

function openLoginModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('auth-modal').classList.add('flex');
    switchAuthTab('login');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('auth-modal').classList.remove('flex');
}

function switchAuthTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tab === 'login') {
        tabLogin.className = "flex-1 py-4 text-center font-semibold text-sm border-b-2 border-[#105773] text-[#105773]";
        tabRegister.className = "flex-1 py-4 text-center font-semibold text-sm text-slate-500 hover:text-slate-700 border-b-2 border-transparent";
        formLogin.classList.remove('hidden');
        formRegister.classList.add('hidden');
        document.getElementById('modal-title-text').innerText = "Aceder à Plataforma";
        document.getElementById('modal-title-icon').innerText = "🔑";
        document.getElementById('modal-subtitle-text').innerText = "Bem-vindo(a) de volta à sua conta MoreLife.";
        const modalRegisterCta = document.getElementById('modal-register-cta'); if (modalRegisterCta) modalRegisterCta.classList.add('hidden');
    } else {
        tabRegister.className = "flex-1 py-4 text-center font-semibold text-sm border-b-2 border-[#0B8C7F] text-[#0B8C7F]";
        tabLogin.className = "flex-1 py-4 text-center font-semibold text-sm text-slate-500 hover:text-slate-700 border-b-2 border-transparent";
        formRegister.classList.remove('hidden');
        formLogin.classList.add('hidden');
        document.getElementById('modal-title-text').innerText = "Crie a sua Conta de Apoio";
        document.getElementById('modal-title-icon').innerText = "🩺";
        document.getElementById('modal-subtitle-text').innerText = "Preencha os dados abaixo para se ligar à nossa rede.";
        const modalRegisterCta = document.getElementById('modal-register-cta'); if (modalRegisterCta) modalRegisterCta.classList.remove('hidden');
        // limpar mensagens de erro e estado do formulário
        ['reg-name','reg-email','reg-password','reg-terms'].forEach(id => clearFieldError(id));
        const pwdBar = document.getElementById('reg-password-strength'); if (pwdBar) { pwdBar.style.width = '0%'; }
    }
}

// Safe submit helper for the modal's Register CTA
function submitRegisterFromModal() {
    const form = document.querySelector('#form-register form');
    if (!form) return;
    if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
        return;
    }
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
        submitBtn.click();
        return;
    }
    // Fallback: dispatch submit event
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

// (mobile nav removed)

function toggleRegisterFormFields(role) {
    const patientFields = document.getElementById('patient-only-fields');
    const doctorFields = document.getElementById('doctor-only-fields');

    if (role === 'patient') {
        patientFields.classList.remove('hidden');
        doctorFields.classList.add('hidden');
        document.getElementById('reg-cpf').required = true;
        document.getElementById('reg-phone').required = true;
        document.getElementById('reg-income').required = true;
        document.getElementById('reg-professional-id').required = false;
        document.getElementById('reg-university').required = false;
    } else {
        patientFields.classList.add('hidden');
        doctorFields.classList.remove('hidden');
        document.getElementById('reg-professional-id').required = true;
        document.getElementById('reg-university').required = true;
        document.getElementById('reg-cpf').required = false;
        document.getElementById('reg-phone').required = false;
        document.getElementById('reg-income').required = false;
    }
}

// ==========================
// Validação do Formulário
// ==========================
function setFieldError(id, message) {
    const el = document.getElementById(id + '-error');
    if (el) {
        el.innerText = message;
        el.classList.remove('hidden');
    }
}

function clearFieldError(id) {
    const el = document.getElementById(id + '-error');
    if (el) {
        el.innerText = '';
        el.classList.add('hidden');
    }
}

function evaluatePasswordStrength(password) {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0..4
}

function updatePasswordStrengthBar() {
    const pwd = document.getElementById('reg-password');
    const bar = document.getElementById('reg-password-strength');
    if (!pwd || !bar) return;
    const score = evaluatePasswordStrength(pwd.value);
    const percent = (score / 4) * 100;
    bar.style.width = percent + '%';
    if (score <= 1) {
        bar.className = 'h-2 w-0 bg-rose-600 transition-all';
    } else if (score === 2) {
        bar.className = 'h-2 w-0 bg-amber-400 transition-all';
    } else {
        bar.className = 'h-2 w-0 bg-emerald-500 transition-all';
    }
    bar.style.width = percent + '%';
}

function validateRegisterForm() {
    let valid = true;
    // clear all
    ['reg-name','reg-username','reg-email','reg-password','reg-password-confirm','reg-terms'].forEach(clearFieldError);

    const name = (document.getElementById('reg-name') || {value:''}).value.trim();
    const username = (document.getElementById('reg-username') || {value:''}).value.trim();
    const email = (document.getElementById('reg-email') || {value:''}).value.trim();
    const password = (document.getElementById('reg-password') || {value:''}).value;
    const passwordConfirm = (document.getElementById('reg-password-confirm') || {value:''}).value;
    const terms = (document.getElementById('reg-terms') || {checked:false}).checked;

    if (name.length < 3) {
        setFieldError('reg-name', 'Por favor introduza o seu nome completo.');
        valid = false;
    }

    if (username.length < 3) {
        setFieldError('reg-username', 'Escolha um nome de utilizador com pelo menos 3 caracteres.');
        valid = false;
    } else {
        const db = getDatabase();
        if (db.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase())) {
            setFieldError('reg-username', 'Nome de usuário já em uso.');
            valid = false;
        }
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        setFieldError('reg-email', 'Endereço de e-mail inválido.');
        valid = false;
    }

    if (password.length < 8 || evaluatePasswordStrength(password) < 2) {
        setFieldError('reg-password', 'A senha deve ter pelo menos 8 caracteres e combinar letras, números e símbolos.');
        valid = false;
    }

    if (password !== passwordConfirm) {
        setFieldError('reg-password-confirm', 'As senhas não coincidem.');
        valid = false;
    }

    if (!terms) {
        setFieldError('reg-terms', 'É necessário aceitar os termos para continuar.');
        valid = false;
    }

    return valid;
}

// Atualizar a barra de força da password em tempo real
document.addEventListener('DOMContentLoaded', () => {
    const pwd = document.getElementById('reg-password');
    if (pwd) {
        pwd.addEventListener('input', () => {
            updatePasswordStrengthBar();
            clearFieldError('reg-password');
        });
    }
});

// Helpers: read file as data URL and hash string using Web Crypto API
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function hashString(str) {
    if (!str) return '';
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function togglePasswordVisibility(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
}

function handleRegPhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    const preview = document.getElementById('reg-photo-preview');
    if (!file) {
        if (preview) preview.classList.add('hidden');
        return;
    }
    readFileAsDataURL(file).then(dataUrl => {
        if (preview) {
            preview.src = dataUrl;
            preview.classList.remove('hidden');
        }
    }).catch(() => {});
}

async function handleForgotPassword() {
    const email = prompt('Introduza o seu e-mail para recuperar a senha:');
    if (!email) return;
    const db = getDatabase();
    const user = db.users.find(u => u.email === email.toLowerCase());
    if (!user) {
        showToast('E-mail não encontrado.', 'error');
        return;
    }
    // mock: open mailto with instructions
    const subject = encodeURIComponent('Recuperação de senha - MoreLife');
    const body = encodeURIComponent('Olá,\n\nRecebemos um pedido de recuperação de senha. Como este é um ambiente local, por favor redefina a sua senha diretamente na aplicação ou contacte o suporte.\n\nCumprimentos,\nMoreLife');
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
    showToast('Enviámos instruções para o seu e-mail (mock).', 'success');
}

async function handleRegister(e) {
    e.preventDefault();
    const db = getDatabase();

    // client-side validation
    if (!validateRegisterForm()) {
        showToast('Por favor, corrija os campos assinalados e tente novamente.', 'error');
        return;
    }

    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const role = document.querySelector('input[name="reg-role"]:checked').value;

    if (db.users.find(u => u.email === email)) {
        setFieldError('reg-email', 'Este endereço de e-mail já se encontra registado.');
        showToast('E-mail já registado.', 'error');
        return;
    }
    if (db.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase())) {
        setFieldError('reg-username', 'Este nome de usuário já se encontra registado.');
        showToast('Nome de usuário já existe.', 'error');
        return;
    }

    const newUser = {
        id: 'u-' + Date.now(),
        name,
        username,
        email,
        role,
        createdAt: new Date().toISOString()
    };

    if (role === 'patient') {
        newUser.cpf = document.getElementById('reg-cpf').value;
        newUser.phone = document.getElementById('reg-phone').value;
        newUser.income = document.getElementById('reg-income').value;
    } else {
        newUser.professionalId = document.getElementById('reg-professional-id').value;
        newUser.university = document.getElementById('reg-university').value;
        newUser.specialty = document.getElementById('reg-specialty').value;
    }

    // profile photo
    const photoInput = document.getElementById('reg-photo');
    if (photoInput && photoInput.files && photoInput.files[0]) {
        try {
            newUser.photo = await readFileAsDataURL(photoInput.files[0]);
        } catch (err) {
            console.warn('photo read failed', err);
        }
    } else {
        newUser.photo = null;
    }

    try {
        // hash password before storing
        newUser.password = await hashString(password);

        db.users.push(newUser);
        saveDatabase(db);
        showToast(`Conta criada com sucesso! Bem-vindo(a), ${name.split(' ')[0]}.`, 'success');

        currentUser = newUser;
        sessionStorage.setItem('ML_ACTIVE_USER', JSON.stringify(currentUser));

        closeAuthModal();
        renderSystem();
        updateImpactStats();
    } catch (err) {
        console.error('Register save error', err);
        showToast('Ocorreu um erro ao gravar a sua conta. Tente novamente mais tarde.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const db = getDatabase();

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    const user = db.users.find(u => u.email === email);
    if (!user) {
        showToast('E-mail ou senha incorretos. Tente novamente.', 'error');
        return;
    }

    let matched = false;
    // if stored password equals raw input (legacy), upgrade to hashed
    if (user.password === password) {
        try {
            const h = await hashString(password);
            user.password = h;
            saveDatabase(db);
            matched = true;
        } catch (e) {
            // continue to try hash compare
        }
    }

    if (!matched) {
        const hashedInput = await hashString(password);
        if (hashedInput === user.password) matched = true;
    }

    if (!matched) {
        showToast('E-mail ou senha incorretos. Tente novamente.', 'error');
        return;
    }

    currentUser = user;
    const remember = document.getElementById('login-remember') && document.getElementById('login-remember').checked;
    if (remember) localStorage.setItem('ML_ACTIVE_USER', JSON.stringify(currentUser)); else sessionStorage.setItem('ML_ACTIVE_USER', JSON.stringify(currentUser));

    showToast(`Bem-vindo, ${user.name.split(' ')[0]}!`, 'success');
    closeAuthModal();
    renderSystem();
}

function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem('ML_ACTIVE_USER');
    showToast("Sessão terminada com segurança.", "warning");
    goToHome();
}
        try { updateImpactStats(); } catch (e) {}

// ============================================
// 5. ATUALIZAÇÃO DOS PAINÉIS
// ============================================
function renderSystem() {
    const headerActions = document.getElementById('auth-header-actions');
    const landingSection = document.getElementById('section-landing');
    const patientSection = document.getElementById('section-patient');
    const doctorSection = document.getElementById('section-doctor');
    // If the page doesn't include the main sections (standalone pages like register.html),
    // avoid running the full render to prevent null reference errors.
    if (!headerActions || !landingSection || !patientSection || !doctorSection) {
        if (headerActions) {
            if (!currentUser) {
                headerActions.innerHTML = `
                    <button onclick="openLoginModal()" class="text-[#105773] hover:text-[#0B8C7F] font-bold px-4 py-2.5 rounded-xl transition-all text-sm">Entrar</button>
                    <button onclick="openRegisterModal('patient')" class="bg-[#0B8C7F] hover:bg-[#21A680] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm">Registar</button>
                `;
            } else {
                // minimal header for logged users on standalone pages
                headerActions.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-semibold">Olá, ${currentUser.name.split(' ')[0]}</span>
                        <button onclick="handleLogout()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded">Sair</button>
                    </div>
                `;
            }
        }
        return;
    }

    let dashboardAction = '';
    if (currentUser.role === 'patient') {
        dashboardAction = `<button onclick="showPatientDashboard()" class="text-[#0B8C7F] hover:text-[#21A680] font-bold text-sm">Painel do Paciente</button>`;
    } else if (currentUser.role === 'doctor') {
        dashboardAction = `<button onclick="showDoctorDashboard()" class="text-[#0B8C7F] hover:text-[#21A680] font-bold text-sm">Painel do Médico</button>`;
    }

    headerActions.innerHTML = `
        <div class="flex items-center gap-4">
            <div class="hidden sm:flex flex-col text-right">
                <span class="text-xs text-slate-500 font-semibold">Olá, ${currentUser.name.split(' ')[0]}</span>
                ${dashboardAction}
            </div>
            <button onclick="handleLogout()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md">
                Sair
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            </button>
        </div>
    `;
    // mobile nav removed; nothing to sync

    if (currentUser.role === 'patient') {
        landingSection.classList.add('hidden');
        patientSection.classList.remove('hidden');
        doctorSection.classList.add('hidden');
        renderPatientDashboard();
    } else if (currentUser.role === 'doctor') {
        landingSection.classList.add('hidden');
        patientSection.classList.add('hidden');
        doctorSection.classList.remove('hidden');
        renderDoctorDashboard();
    }
}

// ============================================
// 6. ÁREA DO PACIENTE
// ============================================
function renderPatientDashboard() {
    if (!currentUser || currentUser.role !== 'patient') return;

    document.getElementById('patient-name-badge').innerText = currentUser.name;
    document.getElementById('patient-email-badge').innerText = currentUser.email;
    document.getElementById('patient-income-badge').innerText = `€ ${parseFloat(currentUser.income).toLocaleString('pt-PT', {minimumFractionDigits: 2})}`;
    document.getElementById('patient-phone-badge').innerText = currentUser.phone;

    const db = getDatabase();
    const myAppointments = db.appointments.filter(ap => ap.patientId === currentUser.id);
    document.getElementById('patient-total-requests').innerText = `${myAppointments.length} no total`;

    const listContainer = document.getElementById('patient-appointments-list');
    if (myAppointments.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <span class="text-3xl block mb-2">🤷‍♂️</span>
                <p class="text-slate-500 font-medium text-sm">Ainda não realizou pedidos de consulta nesta conta.</p>
                <p class="text-xs text-slate-400 mt-1">Utilize o formulário lateral para marcar a sua primeira avaliação.</p>
            </div>
        `;
    } else {
        listContainer.innerHTML = myAppointments.map(ap => {
            let statusClass = '';
            let statusText = '';
            let detailsHTML = '';
            let docInfo = '';

            if (ap.doctorId) {
                const doc = db.users.find(u => u.id === ap.doctorId);
                if (doc) {
                    docInfo = `
                        <div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                            <span class="text-lg">👨‍⚕️</span>
                            <div class="text-xs text-slate-600">
                                <p class="font-semibold text-slate-800">${doc.name} (${doc.professionalId})</p>
                                <p class="text-[10px] text-teal-700 font-medium">${doc.university}</p>
                            </div>
                        </div>
                    `;
                }
            }

            if (ap.status === 'pending') {
                statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
                statusText = '⏳ Pedido Pendente de Avaliação';
                detailsHTML = `<p class="text-xs text-slate-500 mt-2">Os médicos da área de **${ap.specialty}** estão a analisar as informações.</p>`;
            } else if (ap.status === 'confirmed') {
                statusClass = 'bg-green-100 text-green-800 border-green-200';
                statusText = '✅ Consulta Confirmada';
                detailsHTML = `
                    <div class="mt-3 bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 space-y-1 text-xs">
                        <p class="text-slate-700">📅 <strong>Data:</strong> ${formatDateBr(ap.date)} às ${ap.time}</p>
                        <p class="text-slate-700">🏥 <strong>Gabinete / Instalações:</strong> ${ap.location}</p>
                    </div>
                `;
            } else if (ap.status === 'rejected') {
                statusClass = 'bg-rose-100 text-rose-800 border-rose-200';
                statusText = '❌ Indisponível no Momento';
                detailsHTML = `<p class="text-xs text-slate-500 mt-2">De momento, as vagas estão preenchidas. Experimente submeter o pedido mais tarde.</p>`;
            }

            return `
                <div class="bg-white border border-slate-150 rounded-2xl p-5 hover:shadow-sm transition-all">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-slate-500">Ref: ${ap.id}</span>
                            <span class="px-2.5 py-1 text-xs font-bold rounded-full ${statusClass} border">${statusText}</span>
                        </div>
                        <span class="bg-[#105773] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">${ap.specialty}</span>
                    </div>
                    <p class="text-sm text-slate-700 mt-3 font-medium bg-[#F2F2F2] p-3.5 rounded-xl border border-slate-100">
                        "${ap.description}"
                    </p>
                    ${detailsHTML}
                    ${docInfo}
                </div>
            `;
        }).join('');
    }

    filterDoctors();
}

function filterDoctors() {
    const db = getDatabase();
    const specFilter = document.getElementById('search-specialty-filter').value;
    const univFilter = document.getElementById('search-university-input').value.toLowerCase().trim();

    const docList = db.users.filter(u => {
        if (u.role !== 'doctor') return false;
        const matchesSpec = specFilter === '' || u.specialty === specFilter;
        const matchesUniv = univFilter === '' || u.university.toLowerCase().includes(univFilter);
        return matchesSpec && matchesUniv;
    });

    const docContainer = document.getElementById('doctors-list');
    if (!docContainer) return;
    
    if (docList.length === 0) {
        docContainer.innerHTML = `<div class="col-span-2 text-center py-6 text-slate-400 text-xs">Nenhum profissional académico encontrado.</div>`;
        return;
    }

    docContainer.innerHTML = docList.map(doc => {
        return `
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-start gap-3">
                <div class="w-10 h-10 bg-[#0B8C7F]/10 text-[#0B8C7F] rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0">🩺</div>
                <div class="space-y-0.5">
                    <h4 class="font-title text-sm font-bold text-slate-800 leading-tight">${doc.name}</h4>
                    <p class="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded-md font-semibold inline-block uppercase tracking-wider">${doc.specialty}</p>
                    <p class="text-xs text-slate-500 font-medium">${doc.university}</p>
                    <p class="text-[9px] text-slate-400">Reg: ${doc.professionalId}</p>
                </div>
            </div>
        `;
    }).join('');
}

function handleAppointmentSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;

    const specialty = document.getElementById('req-specialty').value;
    const description = document.getElementById('req-description').value.trim();

    const db = getDatabase();
    
    const newAppointment = {
        id: 'ap-' + (db.appointments.length + 1),
        patientId: currentUser.id,
        doctorId: null,
        specialty,
        description,
        status: "pending",
        date: "",
        time: "",
        location: ""
    };

    db.appointments.push(newAppointment);
    saveDatabase(db);

    showToast("O seu pedido de consulta social foi registado com sucesso!", "success");
    document.getElementById('form-appointment-request').reset();
    renderPatientDashboard();
}

// ============================================
// 7. ÁREA DE CLÍNICO (PROFISSIONAL)
// ============================================
function renderDoctorDashboard() {
    if (!currentUser || currentUser.role !== 'doctor') return;

    document.getElementById('doctor-name-badge').innerText = currentUser.name;
    document.getElementById('doctor-specialty-badge').innerText = currentUser.specialty;
    document.getElementById('doctor-register-badge').innerText = currentUser.professionalId;
    document.getElementById('doctor-university-badge').innerText = currentUser.university;

    const db = getDatabase();
    const pendingRequests = db.appointments.filter(ap => ap.specialty === currentUser.specialty && ap.status === 'pending');
    document.getElementById('doctor-pending-count').innerText = `${pendingRequests.length} pendentes`;

    const pendingContainer = document.getElementById('doctor-pending-requests-list');

    if (pendingRequests.length === 0) {
        pendingContainer.innerHTML = `
            <div class="text-center py-12 bg-[#F2F2F2] rounded-2xl border border-slate-200">
                <span class="text-3xl block mb-2">🥳</span>
                <p class="text-slate-600 font-bold text-sm">Não há pedidos pendentes!</p>
                <p class="text-xs text-slate-400 mt-1">Todos os pedidos de pacientes para a sua especialidade já foram triados.</p>
            </div>
        `;
    } else {
        pendingContainer.innerHTML = pendingRequests.map(ap => {
            const patient = db.users.find(u => u.id === ap.patientId);
            const patientName = patient ? patient.name : 'Paciente';
            const patientIncome = patient ? `€ ${parseFloat(patient.income).toLocaleString('pt-PT', {minimumFractionDigits: 2})}` : 'Não fornecido';
            const patientPhone = patient ? patient.phone : 'Não fornecido';

            return `
                <div class="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 hover:border-[#21A680] transition-all">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                            <span class="text-xs text-[#0B8C7F] font-bold uppercase tracking-wider block">Perfil Social do Paciente</span>
                            <h4 class="font-title text-base font-bold text-slate-800">${patientName}</h4>
                        </div>
                        <div class="text-left sm:text-right">
                            <span class="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded font-bold border border-rose-100">Rendimento: ${patientIncome}</span>
                        </div>
                    </div>
                    <div class="my-4">
                        <span class="text-xs text-slate-400 uppercase font-semibold block mb-1">Motivo do Pedido:</span>
                        <p class="text-sm text-slate-700 bg-slate-50 border rounded-xl p-4 font-medium italic">"${ap.description}"</p>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-2 border-t border-slate-100">
                        <div class="text-xs text-slate-400">Ref: ${ap.id} • Tel: ${patientPhone}</div>
                        <div class="flex gap-2">
                            <button onclick="rejectAppointment('${ap.id}')" class="px-4 py-2 text-xs bg-rose-50 text-rose-700 font-bold rounded-lg border">Recusar</button>
                            <button onclick="openApproveModal('${ap.id}')" class="px-5 py-2 text-xs bg-[#21A680] text-white font-bold rounded-lg shadow-sm">Aceitar e Agendar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    const myAgenda = db.appointments.filter(ap => ap.doctorId === currentUser.id && ap.status === 'confirmed');
    document.getElementById('doctor-agenda-count').innerText = `${myAgenda.length} Confirmados`;

    const agendaContainer = document.getElementById('doctor-confirmed-appointments');
    if (!agendaContainer) return;

    if (myAgenda.length === 0) {
        agendaContainer.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs">Não existem agendamentos ativos na sua lista.</div>`;
    } else {
        agendaContainer.innerHTML = myAgenda.map(ap => {
            const patient = db.users.find(u => u.id === ap.patientId);
            const patientName = patient ? patient.name : 'Paciente';

            return `
                <div class="bg-[#F2F2F2] p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-800 text-sm block">${patientName}</span>
                        <span class="text-[9px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">Confirmado</span>
                    </div>
                    <div class="space-y-1 text-slate-600">
                        <p>📆 <strong>Data/Hora:</strong> ${formatDateBr(ap.date)} às ${ap.time}</p>
                        <p>🏥 <strong>Gabinete:</strong> ${ap.location}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function rejectAppointment(id) {
    const db = getDatabase();
    const ap = db.appointments.find(a => a.id === id);
    if (ap) {
        ap.status = 'rejected';
        saveDatabase(db);
        showToast("Pedido rejeitado com sucesso.", "warning");
        renderDoctorDashboard();
    }
}

function openApproveModal(id) {
    document.getElementById('approve-appointment-id').value = id;
    document.getElementById('approve-modal').classList.remove('hidden');
    document.getElementById('approve-modal').classList.add('flex');
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('approve-date').min = todayStr;
}

function closeApproveModal() {
    document.getElementById('approve-modal').classList.add('hidden');
    document.getElementById('approve-modal').classList.remove('flex');
    document.getElementById('form-approve-appointment').reset();
}

function handleApproveSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('approve-appointment-id').value;
    const date = document.getElementById('approve-date').value;
    const time = document.getElementById('approve-time').value;
    const location = document.getElementById('approve-location').value.trim();

    const db = getDatabase();
    const ap = db.appointments.find(a => a.id === id);

    if (ap) {
        ap.status = 'confirmed';
        ap.doctorId = currentUser.id;
        ap.date = date;
        ap.time = time;
        ap.location = location;

        saveDatabase(db);
        showToast("Consulta registada e agendada com sucesso!", "success");
        closeApproveModal();
        renderDoctorDashboard();
        updateImpactStats();
    }
}

// ============================================
// 8. AUXILIARES
// ============================================
function formatDateBr(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}
