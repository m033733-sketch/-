// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== MOBILE MENU =====
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

burger.addEventListener('click', () => mobileMenu.classList.add('open'));
mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== FLATPICKR CALENDAR =====
const today = new Date();
flatpickr.localize(flatpickr.l10ns.ru);

const checkIn = flatpickr('#checkin', {
  dateFormat: 'd.m.Y',
  minDate: 'today',
  onChange(selected) {
    if (selected[0]) {
      checkOut.set('minDate', new Date(selected[0].getTime() + 86400000));
    }
    calcTotal();
  }
});

const checkOut = flatpickr('#checkout', {
  dateFormat: 'd.m.Y',
  minDate: new Date(today.getTime() + 86400000),
  onChange: calcTotal
});

// ===== PRICE CALCULATOR =====
function calcTotal() {
  const inDate  = checkIn.selectedDates[0];
  const outDate = checkOut.selectedDates[0];
  const obj     = document.getElementById('object').value;
  const banya   = document.querySelector('input[name="banya"]:checked');

  if (!inDate || !outDate || !obj) {
    document.getElementById('totalAmount').textContent = '—';
    return;
  }

  const nights   = Math.round((outDate - inDate) / 86400000);
  const housePrice = obj === 'Оба домика' ? 12000 : 6000;
  let total = nights * housePrice;

  if (banya) {
    const hours = parseInt(banya.value) || 0;
    total += hours * 1700;
  }

  const formatted = total.toLocaleString('ru-RU') + ' ₽';
  document.getElementById('totalAmount').textContent = formatted;
  document.getElementById('totalInput').value = formatted + ` (${nights} ночей)`;
}

document.getElementById('object').addEventListener('change', calcTotal);
document.querySelectorAll('input[name="banya"]').forEach(r => r.addEventListener('change', calcTotal));
document.getElementById('guests').addEventListener('change', () => {
  const val = document.getElementById('guests').value;
  if (val === '7-12') {
    document.getElementById('object').value = 'Оба домика';
    calcTotal();
  }
});

// ===== AOS (Animate on Scroll) =====
function aosInit() {
  const els = document.querySelectorAll('[data-aos]');
  if (!('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('js-aos');
    return;
  }
  // Only enable opacity-0 starting state once observer is wired
  document.documentElement.classList.add('js-aos');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.aosDelay || 0;
        setTimeout(() => e.target.classList.add('aos-animate'), parseInt(delay));
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px 200px 0px' });
  els.forEach(el => observer.observe(el));

  // Safety net: reveal anything still hidden after 1.2s
  setTimeout(() => {
    document.querySelectorAll('[data-aos]:not(.aos-animate)').forEach(el => el.classList.add('aos-animate'));
  }, 1200);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', aosInit);
} else {
  aosInit();
}

// ===== GLIGHTBOX =====
const lightbox = GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true });

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== FORM =====
document.getElementById('bookingForm').addEventListener('submit', function(e) {
  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Отправляем…';
  btn.disabled = true;
  // FormSubmit handles redirect via _next hidden field
});

// ===== STICKY CTA =====
const stickyCta = document.getElementById('stickyCta');
if (stickyCta) {
  const updateSticky = () => {
    const heroHeight = document.querySelector('.hero')?.offsetHeight || 600;
    const bookingTop = document.getElementById('booking')?.getBoundingClientRect().top || 9999;
    // Show after scrolling past 80% of hero, hide when booking is in view
    const show = window.scrollY > heroHeight * 0.8 && bookingTop > 200;
    stickyCta.classList.toggle('visible', show);
  };
  window.addEventListener('scroll', updateSticky, { passive: true });
  updateSticky();
}

// ===== TELEGRAM ONE-CLICK =====
// TODO: замени @your_telegram на реальный ник
const TG_USERNAME = 'your_telegram';
const tgDirectBtn = document.getElementById('tgDirectBtn');
const tgToast = document.getElementById('tgToast');
if (tgDirectBtn) {
  tgDirectBtn.addEventListener('click', async () => {
    const f = document.getElementById('bookingForm');
    const get = name => (f.querySelector(`[name="${name}"]`)?.value || '').trim();
    const radio = name => (f.querySelector(`[name="${name}"]:checked`)?.value || '').trim();
    const lines = [
      '🌿 Заявка с сайта «Дача у Мильтюша»',
      '',
      `📅 Заезд: ${get('check_in') || '—'}`,
      `📅 Выезд: ${get('check_out') || '—'}`,
      `🏡 Объект: ${get('object') || '—'}`,
      `👥 Гостей: ${get('guests') || '—'}`,
      `🛁 Баня: ${radio('banya') || 'не указано'}`,
      `💳 Оплата: ${radio('payment') || 'не указано'}`,
      `💰 Стоимость: ${document.getElementById('totalAmount')?.textContent || '—'}`,
      '',
      `👤 Имя: ${get('name') || '—'}`,
      `📞 Телефон: ${get('phone') || '—'}`
    ];
    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      if (tgToast) {
        tgToast.classList.add('visible');
        setTimeout(() => tgToast.classList.remove('visible'), 3000);
      }
    } catch (err) {
      // fallback: still open TG
    }
    setTimeout(() => {
      window.open(`https://t.me/${TG_USERNAME}`, '_blank', 'noopener');
    }, 300);
  });
}

// ===== AI CONCIERGE (rule-based with prepared FAQ) =====
// Поведение: при загрузке — приветствие + быстрые подсказки.
// Пользователь жмёт подсказку или пишет → бот ищет совпадение по ключевым словам.
// TODO: для настоящего LLM-консьержа — отправляй сообщение на свой backend, который проксирует к Anthropic API.
//        Замени conciergeAnswer() на async fetch('/api/concierge', { ... }).
const conciergeKB = [
  {
    id: 'price',
    keywords: ['цен', 'стоим', 'скольк', 'тариф', 'оплат', 'руб', 'почём', 'почем'],
    quick: 'Сколько стоит?',
    answer: 'Один домик — 6 000 ₽ за сутки (до 6 человек). Оба домика — 12 000 ₽ за сутки (до 12 человек). Баня — 1 700 ₽ за час, бронируется отдельно. Все цены без скрытых доплат, заезд с 14:00, выезд до 12:00.'
  },
  {
    id: 'included',
    keywords: ['входит', 'включ', 'удобств', 'мебел', 'посуд', 'микровол', 'плита', 'холодильн', 'wifi', 'wi-fi', 'интернет', 'вай-фай', 'вайфай'],
    quick: 'Что входит?',
    answer: 'В каждом домике: кухня с холодильником, микроволновкой и варочной поверхностью, посуда, обеденная зона, спальные места до 6 человек, туалет. На территории — мангал, беседка с большим столом, парковка, выход к реке Мильтюш в 2 минутах ходьбы.'
  },
  {
    id: 'banya',
    keywords: ['баня', 'банька', 'парн', 'веник', 'топ'],
    quick: 'Расскажите про баню',
    answer: 'Баня бронируется отдельно — 1 700 ₽ за час, минимум 2 часа. Парная + предбанник. Можем заранее протопить к вашему приезду (партнёр Иван, ~1 500 ₽). Веники, простыни — обсудим при бронировании.'
  },
  {
    id: 'arrival',
    keywords: ['заезд', 'выезд', 'врем', 'когда приехать', 'во сколько', 'часы', 'check-in', 'check in', 'check-out'],
    quick: 'Когда заезд и выезд?',
    answer: 'Заезд — с 14:00, выезд — до 12:00. По договорённости можем сделать ранний заезд или поздний выезд бесплатно, если даты до и после свободны.'
  },
  {
    id: 'route',
    keywords: ['доехать', 'как добра', 'дорог', 'маршрут', 'gps', 'координат', 'адрес', 'находитесь', 'где'],
    quick: 'Как доехать?',
    answer: 'Деревня Бурмистрово, Новосибирская область. Из Новосибирска — ~1 час на машине. Точные координаты и пошаговый маршрут пришлём после бронирования. Дорога асфальт + последние ~200 м грунт, проезд легковой даже зимой.'
  },
  {
    id: 'kids',
    keywords: ['дет', 'ребён', 'ребен', 'малыш', 'грудничок', 'коляск', 'детск'],
    quick: 'Можно с детьми?',
    answer: 'Да, конечно. Территория огорожена, до реки 2 минуты, мангал и баня — под присмотром взрослых. Детских кроваток и стульчиков пока нет, по запросу подскажем что взять. При бронировании укажите возраст детей — посоветуем оптимальный домик.'
  },
  {
    id: 'pets',
    keywords: ['собак', 'кошк', 'животн', 'питом', 'пёс', 'пес', 'кот'],
    quick: 'Можно с собакой?',
    answer: 'С собакой — да, по согласованию. Просим заранее предупредить (порода, размер). Залог за уборку — обсуждается индивидуально. На лужайке псу будет где разбежаться.'
  },
  {
    id: 'season',
    keywords: ['зим', 'лет', 'весн', 'осен', 'сезон', 'отоплен', 'мороз', 'круглый год', 'круглогодич'],
    quick: 'Работаете зимой?',
    answer: 'Круглый год! Зимой — печь и обогреватели, прогрев домика к приезду. Летом — мангал, рыбалка, грибы. Лучшие месяцы: июнь–сентябрь и зимние праздники.'
  },
  {
    id: 'cancel',
    keywords: ['отмен', 'верн', 'переноc', 'передум', 'обстоятельств'],
    quick: 'Можно отменить бронь?',
    answer: 'Отмена за 7+ дней — возврат полной суммы. За 3–6 дней — 50%. Менее 72 часов — без возврата. Перенос дат по согласованию, постараемся подобрать удобный вариант.'
  },
  {
    id: 'pay',
    keywords: ['оплат', 'предоплат', 'наличн', 'карт', 'перевод', 'банк', 'счёт', 'счет', 'квитанц'],
    quick: 'Как оплатить?',
    answer: 'При заезде наличными или переводом, либо онлайн картой после подтверждения брони. Возможна частичная предоплата для гарантии даты. Кассовый чек — по запросу.'
  },
  {
    id: 'pack',
    keywords: ['взять', 'привезти', 'чек-лист', 'чек лист', 'с собой', 'что нужно'],
    quick: 'Что взять с собой?',
    answer: 'Минимум: продукты, средства гигиены, удобную обувь. Летом — репеллент. Осенью/зимой — тёплая одежда. Полотенца, постельное бельё, базовая посуда — наше. Дрова и угли для мангала уточняйте, либо привезите свои.'
  },
  {
    id: 'capacity',
    keywords: ['скольк человек', 'вмест', 'компани', 'мест', 'на сколь', 'размер групп'],
    quick: 'На сколько человек?',
    answer: 'Один домик — комфортно до 6 человек. Оба домика — до 12 человек, отличный вариант для компании или двух семей. Можем посоветовать оптимальный вариант под ваш состав.'
  },
  {
    id: 'discount',
    keywords: ['скидк', 'промок', 'акци', 'дешевле', 'спец', 'выгод', 'льгот'],
    quick: 'Есть скидки?',
    answer: 'Будни (Пн–Чт) — обсуждаемо. От 3 ночей — бонус (зависит от сезона). Постоянным гостям — особые условия. Напишите ваши даты — посчитаем индивидуально.'
  }
];

const conciergeLauncher = document.getElementById('conciergeLauncher');
const conciergePanel = document.getElementById('conciergePanel');
const conciergeClose = document.getElementById('conciergeClose');
const conciergeBody = document.getElementById('conciergeBody');
const conciergeQuick = document.getElementById('conciergeQuick');
const conciergeForm = document.getElementById('conciergeForm');
const conciergeInput = document.getElementById('conciergeInput');

function conciergeOpen() {
  conciergePanel.classList.add('open');
  conciergePanel.setAttribute('aria-hidden', 'false');
  conciergeLauncher.classList.add('hidden');
  setTimeout(() => conciergeInput?.focus(), 200);
  if (!conciergeBody.dataset.greeted) {
    conciergeBody.dataset.greeted = '1';
    pushBot('Здравствуйте! Я консьерж «Дачи у Мильтюша». Отвечу на любые вопросы про домики, баню, заезд и окрестности. Можно нажать подсказку ниже или написать своими словами.');
    renderQuick();
  }
}
function conciergeCloseAction() {
  conciergePanel.classList.remove('open');
  conciergePanel.setAttribute('aria-hidden', 'true');
  conciergeLauncher.classList.remove('hidden');
}
function pushMsg(text, role) {
  const el = document.createElement('div');
  el.className = `concierge-msg ${role}`;
  el.textContent = text;
  conciergeBody.appendChild(el);
  conciergeBody.scrollTop = conciergeBody.scrollHeight;
}
function pushBot(text) { pushMsg(text, 'bot'); }
function pushUser(text) { pushMsg(text, 'user'); }
function pushTyping() {
  const el = document.createElement('div');
  el.className = 'concierge-typing';
  el.id = 'conciergeTyping';
  el.innerHTML = '<span></span><span></span><span></span>';
  conciergeBody.appendChild(el);
  conciergeBody.scrollTop = conciergeBody.scrollHeight;
  return el;
}
function clearTyping() {
  document.getElementById('conciergeTyping')?.remove();
}
function renderQuick() {
  conciergeQuick.innerHTML = '';
  const items = ['price', 'included', 'route', 'banya', 'arrival', 'pack'];
  items.forEach(id => {
    const item = conciergeKB.find(k => k.id === id);
    if (!item) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'concierge-quick-chip';
    btn.textContent = item.quick;
    btn.addEventListener('click', () => answerByItem(item));
    conciergeQuick.appendChild(btn);
  });
}
function answerByItem(item) {
  pushUser(item.quick);
  conciergeQuick.innerHTML = '';
  const typing = pushTyping();
  setTimeout(() => {
    clearTyping();
    pushBot(item.answer);
    setTimeout(renderQuick, 300);
  }, 600 + Math.random() * 400);
}
function findAnswer(text) {
  const q = text.toLowerCase().trim();
  let best = null;
  let bestScore = 0;
  conciergeKB.forEach(item => {
    let score = 0;
    item.keywords.forEach(kw => { if (q.includes(kw)) score++; });
    if (score > bestScore) { bestScore = score; best = item; }
  });
  return bestScore > 0 ? best : null;
}
function userAsked(text) {
  pushUser(text);
  conciergeQuick.innerHTML = '';
  const typing = pushTyping();
  setTimeout(() => {
    clearTyping();
    const item = findAnswer(text);
    if (item) {
      pushBot(item.answer);
    } else {
      pushBot('Хороший вопрос — не уверен, что отвечу точно. Напишите хозяевам напрямую в WhatsApp или Telegram (значки в футере), там ответят быстро и подробно.');
    }
    setTimeout(renderQuick, 300);
  }, 600 + Math.random() * 500);
}
if (conciergeLauncher) {
  conciergeLauncher.addEventListener('click', conciergeOpen);
  conciergeClose.addEventListener('click', conciergeCloseAction);
  conciergeForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = conciergeInput.value.trim();
    if (!text) return;
    conciergeInput.value = '';
    userAsked(text);
  });
  // Esc closes the chat
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && conciergePanel.classList.contains('open')) {
      conciergeCloseAction();
    }
  });
  // Click outside closes the chat
  document.addEventListener('click', e => {
    if (!conciergePanel.classList.contains('open')) return;
    if (conciergePanel.contains(e.target) || conciergeLauncher.contains(e.target)) return;
    conciergeCloseAction();
  });
}
