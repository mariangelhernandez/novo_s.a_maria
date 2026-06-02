const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.use(express.json());

const clientRoot = path.resolve(__dirname, '..', 'client');

// Verifica existence da pasta client/
if (!fs.existsSync(clientRoot)) {
  console.error('ERRO: pasta client/ não encontrada em:', clientRoot);
  console.error('Coloca os ficheiros do frontend dentro de novo_s.a_maria/client/');
  process.exit(1);
}

// Serve ficheiros estáticos (index.html, style.css, script.js, logo.png, etc.)
app.use(express.static(clientRoot));

// API stub: /api/appointments
let appointments = [];
app.get('/api/appointments', (req, res) => res.json(appointments));
app.post('/api/appointments', (req, res) => {
  const id = Date.now().toString();
  const item = { id, ...req.body, status: 'pending', createdAt: new Date().toISOString() };
  appointments.push(item);
  res.status(201).json(item);
});

// Compatibilidade: se o HTML usar caminhos absolutos como /script.js ou /style.css,
// express.static já os serve. Se tiveres imagens em client/img, também serão servidas.
// Fallback SPA: qualquer rota não encontrada devolve index.html (se existir)
app.get('*', (req, res) => {
  const indexFile = path.join(clientRoot, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.status(404).send('Página não encontrada');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MoreLife server running on http://localhost:${PORT}`);
});


// ...existing code...

// ===== Integration bootstrap (append only) =====
(function integrationBootstrap(){
  console.log('script.js integration bootstrap');

  // fallback implementations if not present
  if (typeof window.openRegisterModal !== 'function') {
    window.openRegisterModal = function(role='patient'){
      const m = document.getElementById('auth-modal');
      if (m) {
        m.classList.remove('hidden'); m.classList.add('flex');
        if (typeof toggleRegisterFormFields === 'function') toggleRegisterFormFields(role);
        return;
      }
      location.href = 'register.html?role=' + encodeURIComponent(role);
    };
  }
  if (typeof window.closeAuthModal !== 'function') {
    window.closeAuthModal = function(){
      const m = document.getElementById('auth-modal');
      if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
    };
  }

  // expose main handlers if already defined
  ['handleRegister','handleLogin','handleLogout','toggleRegisterFormFields','openApproveModal','closeApproveModal'].forEach(fn => {
    if (typeof window[fn] !== 'function' && typeof eval(fn) === 'function') window[fn] = eval(fn);
  });

  // restore currentUser from sessionStorage
  try {
    window.currentUser = JSON.parse(sessionStorage.getItem('ML_ACTIVE_USER') || 'null');
  } catch(e) { window.currentUser = null; }

  document.addEventListener('DOMContentLoaded', () => {
    // header actions
    const authActions = document.getElementById('auth-header-actions');
    if (authActions) {
      if (window.currentUser) {
        authActions.innerHTML = `<div class="flex items-center gap-3"><span class="text-sm">Olá, ${window.currentUser.name.split(' ')[0]}</span><button onclick="handleLogout && handleLogout()" class="px-3 py-1 bg-[#0B8C7F] text-white rounded">Sair</button></div>`;
      } else {
        authActions.innerHTML = `<button onclick="openRegisterModal('patient')" class="px-3 py-1 bg-[#21A680] text-white rounded mr-2">Registar / Entrar</button>`;
      }
    }

    // if index page show/hide sections based on session
    const path = location.pathname.toLowerCase();
    const isIndex = path === '/' || path.endsWith('/index.html') || path === '' ;
    if (isIndex) {
      const landing = document.getElementById('section-landing');
      const patientSec = document.getElementById('section-patient');
      const doctorSec = document.getElementById('section-doctor');

      if (window.currentUser && window.currentUser.role === 'patient') {
        if (landing) landing.classList.add('hidden');
        if (patientSec) patientSec.classList.remove('hidden');
        if (doctorSec) doctorSec.classList.add('hidden');
        // populate small badges if exist
        const el = document.getElementById('patient-name-badge'); if (el) el.textContent = window.currentUser.name;
      } else if (window.currentUser && window.currentUser.role === 'doctor') {
        if (landing) landing.classList.add('hidden');
        if (doctorSec) doctorSec.classList.remove('hidden');
        if (patientSec) patientSec.classList.add('hidden');
        const el = document.getElementById('doctor-name-badge'); if (el) el.textContent = window.currentUser.name;
      } else {
        if (landing) landing.classList.remove('hidden');
        if (patientSec) patientSec.classList.add('hidden');
        if (doctorSec) doctorSec.classList.add('hidden');
      }
    }

    // attach landing CTA handlers defensively
    try {
      const btnP = document.querySelector("button[onclick*=\"register.html?role=patient\"], a[href*='register.html?role=patient']");
      const btnD = document.querySelector("button[onclick*=\"register.html?role=doctor\"], a[href*='register.html?role=doctor']");
      if (btnP) btnP.addEventListener('click', (e)=>{ /* allow default link behaviour */ });
      if (btnD) btnD.addEventListener('click', (e)=>{ /* allow default link behaviour */ });
    } catch(e){ /* noop */ }

    // if on register page, ensure form binds to handleRegister and apply role param
    if (path.endsWith('register.html')) {
      try {
        const params = new URLSearchParams(location.search);
        const role = params.get('role');
        if (role && typeof toggleRegisterFormFields === 'function') toggleRegisterFormFields(role);
        const form = document.getElementById('form-register');
        if (form && typeof handleRegister === 'function') {
          form.removeEventListener('submit', window.__boundHandleRegister);
          form.addEventListener('submit', handleRegister);
          window.__boundHandleRegister = handleRegister;
        }
      } catch(e){ console.warn(e); }
    }
  });

  // helper: when registration/login code sets currentUser, ensure sessionStorage + redirect handled by caller.
  window.__ml_setCurrentUser = function(user){
    try {
      window.currentUser = user;
      sessionStorage.setItem('ML_ACTIVE_USER', JSON.stringify(user));
    } catch(e){ console.warn('__ml_setCurrentUser error', e); }
  };

  console.log('script.js integration bootstrap finished');
})();

