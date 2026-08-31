
const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const panel = document.getElementById('panel');
const messages = document.getElementById('messages');
const closePanel = document.getElementById('closePanel');
const tradingBtn = document.getElementById('tradingBtn');
const toast = document.getElementById('toast');

function addMessage(text, who='user'){
  const el = document.createElement('div');
  el.className = `msg ${who}`;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden','false');
  addMessage(text,'user');
  input.value = '';

  setTimeout(()=>{
    addMessage("I'm Vlad. My live AI and wallet logic will plug in here later — for now this is the working front-end shell.",'vlad');
  },450);
});

closePanel.addEventListener('click', ()=>{
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden','true');
});

tradingBtn.addEventListener('click', ()=>{
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2500);
});
