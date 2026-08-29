/* ── AUTH FLOW (shared by customer & vendor sign-up) ── */
function initAuth({ role }) {
  const prefix = role; // 'customer' or 'vendor'

  // DOM refs
  const phoneInput   = document.getElementById(prefix + 'Phone');
  const sendOtpBtn   = document.getElementById(prefix + 'SendOtp');
  const verifyOtpBtn = document.getElementById(prefix + 'VerifyOtp');
  const changePhoneBtn = document.getElementById(prefix + 'ChangePhone');
  const resendOtpBtn = document.getElementById(prefix + 'ResendOtp');
  const timerEl      = document.getElementById(prefix + 'Timer');
  const otpDisplay   = document.getElementById('otpPhoneDisplay');
  const finishBtn    = document.getElementById(prefix + 'Finish');
  const otpContainer = document.getElementById(prefix + 'OtpInputs');
  const otpInputs    = otpContainer ? otpContainer.querySelectorAll('input') : [];

  let otpValue = '';
  let timerInterval = null;
  let currentStep = 1;

  // ── Step navigation ──
  function goToStep(step) {
    currentStep = step;
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.auth-step').forEach(s => {
      const sNum = parseInt(s.dataset.step);
      s.classList.toggle('active', sNum === step);
      s.classList.toggle('done', sNum < step);
    });
    document.querySelectorAll('.auth-step-line').forEach((line, i) => {
      line.classList.toggle('done', i < step - 1);
    });
    const panel = document.querySelector(`.auth-panel[data-panel="${step}"]`);
    if (panel) panel.classList.add('active');
  }

  // ── Phone validation ──
  function isValidPhone(val) {
    return /^[6-9]\d{9}$/.test(val);
  }

  // ── Send OTP ──
  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
      const phone = phoneInput.value.trim();
      const group = phoneInput.closest('.input-group');

      if (!isValidPhone(phone)) {
        group.classList.add('error');
        return;
      }
      group.classList.remove('error');

      // Simulate sending OTP
      sendOtpBtn.textContent = 'Sending...';
      sendOtpBtn.disabled = true;

      setTimeout(() => {
        otpValue = '123456'; // simulated OTP
        if (otpDisplay) otpDisplay.textContent = '+91 ' + phone;
        sendOtpBtn.textContent = 'Send OTP';
        sendOtpBtn.disabled = false;
        goToStep(2);
        startTimer();
        // Focus first OTP input
        if (otpInputs.length) otpInputs[0].focus();
      }, 800);
    });
  }

  // ── OTP input handling ──
  otpInputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val;
      if (val && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }
      checkOtpComplete();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        otpInputs[idx - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      pasted.split('').forEach((ch, i) => {
        if (otpInputs[i]) otpInputs[i].value = ch;
      });
      if (otpInputs[Math.min(pasted.length, 5)]) {
        otpInputs[Math.min(pasted.length, 5)].focus();
      }
      checkOtpComplete();
    });
  });

  function checkOtpComplete() {
    const entered = Array.from(otpInputs).map(i => i.value).join('');
    if (verifyOtpBtn) verifyOtpBtn.disabled = entered.length !== 6;
  }

  // ── Verify OTP ──
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', () => {
      const entered = Array.from(otpInputs).map(i => i.value).join('');
      if (entered.length !== 6) return;

      verifyOtpBtn.textContent = 'Verifying...';
      verifyOtpBtn.disabled = true;

      setTimeout(() => {
        if (entered === otpValue) {
          verifyOtpBtn.textContent = 'Verify OTP';
          verifyOtpBtn.disabled = false;
          stopTimer();
          goToStep(3);
        } else {
          verifyOtpBtn.textContent = 'Verify OTP';
          verifyOtpBtn.disabled = false;
          // Shake animation on OTP inputs
          otpContainer.style.animation = 'shake 0.4s ease';
          setTimeout(() => otpContainer.style.animation = '', 400);
        }
      }, 600);
    });
  }

  // ── Change phone ──
  if (changePhoneBtn) {
    changePhoneBtn.addEventListener('click', () => {
      stopTimer();
      otpInputs.forEach(i => i.value = '');
      if (verifyOtpBtn) verifyOtpBtn.disabled = true;
      if (timerEl) timerEl.style.display = '';
      if (resendOtpBtn) resendOtpBtn.style.display = 'none';
      goToStep(1);
      phoneInput.focus();
    });
  }

  // ── Resend OTP ──
  if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', () => {
      otpValue = '123456';
      resendOtpBtn.style.display = 'none';
      otpInputs.forEach(i => i.value = '');
      if (verifyOtpBtn) verifyOtpBtn.disabled = true;
      startTimer();
      if (otpInputs.length) otpInputs[0].focus();
    });
  }

  // ── Timer ──
  function startTimer() {
    let seconds = 30;
    if (timerEl) {
      timerEl.style.display = '';
      timerEl.textContent = 'Resend OTP in ' + seconds + 's';
    }
    if (resendOtpBtn) resendOtpBtn.style.display = 'none';
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      seconds--;
      if (timerEl) timerEl.textContent = 'Resend OTP in ' + seconds + 's';
      if (seconds <= 0) {
        clearInterval(timerInterval);
        if (timerEl) timerEl.style.display = 'none';
        if (resendOtpBtn) resendOtpBtn.style.display = '';
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    if (timerEl) timerEl.style.display = 'none';
    if (resendOtpBtn) resendOtpBtn.style.display = 'none';
  }

  // ── Finish (profile submit) ──
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      let valid = true;

      if (role === 'customer') {
        const name = document.getElementById('customerName');
        const area = document.getElementById('customerArea');
        if (!name.value.trim()) { name.closest('.input-group').classList.add('error'); valid = false; }
        else { name.closest('.input-group').classList.remove('error'); }
        if (!area.value.trim()) { area.closest('.input-group').classList.add('error'); valid = false; }
        else { area.closest('.input-group').classList.remove('error'); }
      } else {
        const biz = document.getElementById('vendorBusiness');
        const name = document.getElementById('vendorName');
        const cat = document.getElementById('vendorCategory');
        const area = document.getElementById('vendorArea');
        if (!biz.value.trim()) { biz.closest('.input-group').classList.add('error'); valid = false; }
        else { biz.closest('.input-group').classList.remove('error'); }
        if (!name.value.trim()) { name.closest('.input-group').classList.add('error'); valid = false; }
        else { name.closest('.input-group').classList.remove('error'); }
        if (!cat.value) { cat.closest('.input-group').classList.add('error'); valid = false; }
        else { cat.closest('.input-group').classList.remove('error'); }
        if (!area.value.trim()) { area.closest('.input-group').classList.add('error'); valid = false; }
        else { area.closest('.input-group').classList.remove('error'); }
      }

      if (!valid) return;

      finishBtn.textContent = 'Creating account...';
      finishBtn.disabled = true;

      setTimeout(() => {
        finishBtn.textContent = 'Create ' + (role === 'vendor' ? 'Vendor ' : '') + 'Account';
        finishBtn.disabled = false;
        goToStep(4);
      }, 1000);
    });
  }

  // ── Clear error on input ──
  document.querySelectorAll('.auth-form-wrap input, .auth-form-wrap select').forEach(el => {
    el.addEventListener('input', () => {
      el.closest('.input-group')?.classList.remove('error');
    });
  });
}

/* ── Shake animation ── */
const style = document.createElement('style');
style.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`;
document.head.appendChild(style);
