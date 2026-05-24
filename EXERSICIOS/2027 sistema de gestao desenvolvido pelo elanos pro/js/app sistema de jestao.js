const defaultState = {
  vendas: 8450000,
  clientes: 328,
  produtos: 1240,
  caixa: 2315000,
  documento: 85
};

const state = { ...defaultState, ...readJson('erpState', {}) };
const currency = new Intl.NumberFormat('pt-PT');
const toast = document.getElementById('toast');
const operacoesBody = document.getElementById('operacoes-body');
const qrVideo = document.getElementById('qr-video');
const qrCanvas = document.getElementById('qr-canvas');
const qrStatus = document.getElementById('qr-status');
const loginPanel = document.getElementById('login-panel');
const stockBody = document.getElementById('stock-body');
const stockCount = document.getElementById('stock-count');
const stockSearch = document.getElementById('stock-search');
let qrStream = null;
let qrTimer = null;

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function saveState() {
  saveJson('erpState', state);
}

function money(value) {
  return `${currency.format(value)} FCFA`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function updateKpis() {
  document.getElementById('kpi-vendas').textContent = money(state.vendas);
  document.getElementById('kpi-clientes').textContent = currency.format(state.clientes);
  document.getElementById('kpi-produtos').textContent = currency.format(state.produtos);
  document.getElementById('kpi-caixa').textContent = money(state.caixa);
}

function listItem(name, detail) {
  const item = document.createElement('div');
  item.innerHTML = `<span>${name}</span><strong>${detail}</strong><button class="trash-btn" type="button" aria-label="Excluir">🗑</button>`;
  return item;
}

function getStockProducts() {
  return readJson('stockProducts', []);
}

function saveStockProducts(products) {
  saveJson('stockProducts', products);
}

function renderStock(filter = '') {
  if (!stockBody) return;
  const products = getStockProducts();
  const query = filter.trim().toLowerCase();
  const visible = products.filter((product) =>
    [product.codigo, product.produto, product.categoria].some((value) =>
      String(value || '').toLowerCase().includes(query)
    )
  );

  stockBody.innerHTML = '';
  visible.forEach((product) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.codigo}</td>
      <td>${product.produto}</td>
      <td>${product.categoria || 'Geral'}</td>
      <td>${product.quantidade}</td>
      <td>${money(product.preco || 0)}</td>
      <td>${product.entrada}</td>
      <td><button class="stock-action" type="button" data-stock-delete="${product.codigo}" aria-label="Excluir">🗑</button></td>
    `;
    stockBody.appendChild(row);
  });

  if (!visible.length) {
    stockBody.innerHTML = '<tr><td colspan="7">Nenhum produto encontrado no banco de stock.</td></tr>';
  }

  if (stockCount) {
    stockCount.textContent = `${products.length} produto${products.length === 1 ? '' : 's'} no banco`;
  }
}

function upsertStockProduct({ codigo, produto, categoria = 'Geral', quantidade = 1, preco = 0 }) {
  const products = getStockProducts();
  const cleanCode = String(codigo || '').trim();
  const cleanName = String(produto || '').trim();
  if (!cleanCode || !cleanName) return false;

  const existing = products.find((item) => item.codigo.toLowerCase() === cleanCode.toLowerCase());
  if (existing) {
    existing.produto = cleanName;
    existing.categoria = categoria || existing.categoria || 'Geral';
    existing.quantidade = Number(existing.quantidade || 0) + Number(quantidade || 1);
    existing.preco = Number(preco || existing.preco || 0);
    existing.entrada = new Date().toLocaleDateString('pt-PT');
  } else {
    products.unshift({
      codigo: cleanCode,
      produto: cleanName,
      categoria: categoria || 'Geral',
      quantidade: Number(quantidade || 1),
      preco: Number(preco || 0),
      entrada: new Date().toLocaleDateString('pt-PT')
    });
  }

  saveStockProducts(products);
  state.produtos = products.length;
  saveState();
  updateKpis();
  renderStock(stockSearch?.value || '');
  return true;
}

function abrirStock() {
  document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Área de stock aberta.');
}

function serializeList(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  const items = [...list.children].map((item) => ({
    name: item.querySelector('span')?.textContent || '',
    detail: item.querySelector('strong')?.textContent || ''
  }));
  saveJson(`list:${listId}`, items);
}

function loadList(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  const saved = readJson(`list:${listId}`, null);

  if (saved) {
    list.innerHTML = '';
    saved.forEach((item) => list.appendChild(listItem(item.name, item.detail)));
    return;
  }

  [...list.children].forEach((item) => {
    if (!item.querySelector('.trash-btn')) {
      item.appendChild(listItem('', '').querySelector('.trash-btn'));
    }
  });
  serializeList(listId);
}

function addOperation(cliente, documento, valor, status, badgeClass = 'success') {
  if (!operacoesBody) return;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${new Date().toLocaleDateString('pt-PT')}</td>
    <td>${cliente}</td>
    <td>${documento}</td>
    <td>${money(valor)}</td>
    <td><span class="badge ${badgeClass}">${status}</span></td>
  `;
  operacoesBody.prepend(row);
}

function novaVenda() {
  const cliente = window.prompt('Nome do cliente:', 'Cliente balcão');
  if (!cliente) return;

  const valorDigitado = window.prompt('Valor da venda em FCFA:', '50000');
  const valor = Number(String(valorDigitado || '').replace(/\D/g, ''));
  if (!valor) {
    showToast('Venda cancelada: informe um valor válido.');
    return;
  }

  const documento = `FT-${String(state.documento).padStart(5, '0')}`;
  state.documento += 1;
  state.vendas += valor;
  state.caixa += valor;
  saveState();
  addOperation(cliente, documento, valor, 'Pago');
  updateKpis();
  showToast('Venda registada com sucesso.');
}

function abrirJanelaPdf(titulo, conteudo) {
  const janela = window.open('', '_blank', 'width=900,height=700');
  if (!janela) {
    showToast('Permita pop-ups para gerar o PDF.');
    return;
  }

  janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <title>${titulo}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:0;padding:32px;color:#101828}
        .doc{max-width:760px;margin:0 auto}
        .head{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #1f6feb;padding-bottom:18px;margin-bottom:24px}
        h1{margin:0;font-size:28px}.muted{color:#667085}.box{border:1px solid #dbe3ef;border-radius:8px;padding:16px;margin:18px 0}
        table{width:100%;border-collapse:collapse;margin-top:18px}th,td{padding:12px;border-bottom:1px solid #dbe3ef;text-align:left}
        th{background:#f8fafc}.total{font-size:22px;font-weight:800;text-align:right;margin-top:22px}
        .actions{margin-top:28px}@media print{.actions{display:none}body{padding:0}.doc{max-width:none}}
      </style>
    </head>
    <body><div class="doc">${conteudo}<div class="actions"><button onclick="window.print()">Guardar como PDF</button></div></div></body>
    </html>
  `);
  janela.document.close();
  janela.focus();
  setTimeout(() => janela.print(), 500);
}

function gerarFaturaPdf() {
  const cliente = window.prompt('Cliente da fatura:', 'Cliente balcão');
  if (!cliente) return;
  const valorDigitado = window.prompt('Valor da fatura em FCFA:', '50000');
  const valor = Number(String(valorDigitado || '').replace(/\D/g, ''));
  if (!valor) {
    showToast('Informe um valor válido para a fatura.');
    return;
  }

  const numero = `FT-${String(state.documento).padStart(5, '0')}`;
  state.documento += 1;
  saveState();

  abrirJanelaPdf(`Fatura ${numero}`, `
    <div class="head">
      <div><h1>Fatura</h1><p class="muted">${numero}</p></div>
      <div><strong>ERP CA Serviços</strong><p class="muted">${new Date().toLocaleDateString('pt-PT')}</p></div>
    </div>
    <div class="box"><strong>Cliente:</strong><br>${cliente}</div>
    <table>
      <thead><tr><th>Descrição</th><th>Qtd.</th><th>Valor</th></tr></thead>
      <tbody><tr><td>Produto ou serviço faturado</td><td>1</td><td>${money(valor)}</td></tr></tbody>
    </table>
    <p class="total">Total: ${money(valor)}</p>
  `);
  showToast('Fatura PDF gerada.');
}

function exportarPdf() {
  abrirJanelaPdf('Relatório ERP CA Serviços', `
    <div class="head">
      <div><h1>Relatório</h1><p class="muted">Resumo do sistema</p></div>
      <div><strong>ERP CA Serviços</strong><p class="muted">${new Date().toLocaleDateString('pt-PT')}</p></div>
    </div>
    <table>
      <tbody>
        <tr><th>Total de vendas</th><td>${money(state.vendas)}</td></tr>
        <tr><th>Clientes ativos</th><td>${currency.format(state.clientes)}</td></tr>
        <tr><th>Produtos em stock</th><td>${currency.format(state.produtos)}</td></tr>
        <tr><th>Saldo de caixa</th><td>${money(state.caixa)}</td></tr>
      </tbody>
    </table>
  `);
}

function addSimpleItem(listId, label, detail, successMessage) {
  const name = window.prompt(label);
  if (!name) return;
  const list = document.getElementById(listId);
  list.prepend(listItem(name, detail));
  serializeList(listId);
  showToast(successMessage);
}

function parseQrProduct(value) {
  const text = value.trim();
  if (!text) return null;
  try {
    const product = JSON.parse(text);
    return {
      codigo: product.codigo || product.code || text,
      produto: product.produto || product.nome || product.name || 'Produto QR'
    };
  } catch {
    const parts = text.split('|').map((item) => item.trim()).filter(Boolean);
    return {
      codigo: parts[0] || text,
      produto: parts[1] || `Produto ${parts[0] || text}`
    };
  }
}

function preencherProdutoQr(rawValue) {
  const product = parseQrProduct(rawValue);
  if (!product) return;
  document.getElementById('qr-code-input').value = product.codigo;
  document.getElementById('qr-product-input').value = product.produto;
  qrStatus.textContent = `QR lido: ${product.codigo}`;
  adicionarProduto(product.codigo, product.produto, 'QR', 1, 0);
  abrirStock();
  showToast('Código QR lido com sucesso.');
}

async function scanQrFrame(detector) {
  if (!qrStream || qrVideo.readyState < 2) return;
  const context = qrCanvas.getContext('2d');
  qrCanvas.width = qrVideo.videoWidth;
  qrCanvas.height = qrVideo.videoHeight;
  context.drawImage(qrVideo, 0, 0, qrCanvas.width, qrCanvas.height);
  const codes = await detector.detect(qrCanvas);
  if (codes.length) {
    preencherProdutoQr(codes[0].rawValue);
    pararQr();
  }
}

async function iniciarQr() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast('Este navegador não permite câmera aqui. Use o campo manual.');
    return;
  }
  if (!('BarcodeDetector' in window)) {
    showToast('Leitor QR automático não suportado. Use o campo manual.');
    return;
  }
  try {
    qrStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    qrVideo.srcObject = qrStream;
    await qrVideo.play();
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    qrStatus.textContent = 'A procurar código QR...';
    qrTimer = window.setInterval(() => scanQrFrame(detector).catch(() => null), 700);
  } catch {
    showToast('Não foi possível abrir a câmera. Verifique a permissão do navegador.');
  }
}

function pararQr() {
  if (qrTimer) window.clearInterval(qrTimer);
  qrTimer = null;
  if (qrStream) qrStream.getTracks().forEach((track) => track.stop());
  qrStream = null;
  qrVideo.srcObject = null;
  qrStatus.textContent = 'Câmera desligada';
}

function adicionarProduto(codigo, produto, categoria = 'QR', quantidade = 1, preco = 0) {
  const list = document.getElementById('produtos-list');
  if (list) {
    list.prepend(listItem(produto, codigo));
    serializeList('produtos-list');
  }
  upsertStockProduct({ codigo, produto, categoria, quantidade, preco });
  addOperation(produto, codigo, 0, 'Stock', 'info');
  showToast('Produto adicionado ao sistema.');
}

function init() {
  updateKpis();
  loadList('funcionarios-list');
  loadList('produtos-list');
  renderStock();
  if (localStorage.getItem('erpLoggedIn') === '1') {
    loginPanel?.classList.add('hidden');
  }
}

document.querySelectorAll('.menu a').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.menu a').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

document.addEventListener('click', (event) => {
  const stockDelete = event.target.closest('[data-stock-delete]');
  if (stockDelete) {
    const code = stockDelete.dataset.stockDelete;
    const products = getStockProducts().filter((product) => product.codigo !== code);
    saveStockProducts(products);
    state.produtos = products.length;
    saveState();
    updateKpis();
    renderStock(stockSearch?.value || '');
    showToast('Produto removido do stock.');
    return;
  }

  const trash = event.target.closest('.trash-btn');
  if (!trash) return;
  const list = trash.closest('.stock-list');
  trash.closest('div')?.remove();
  if (list?.id) serializeList(list.id);
  showToast('Item excluído.');
});

document.querySelector('[data-action="nova-venda"]')?.addEventListener('click', novaVenda);
document.querySelector('[data-action="exportar"]')?.addEventListener('click', exportarPdf);
document.querySelectorAll('[data-action="abrir-stock"]').forEach((button) => {
  button.addEventListener('click', abrirStock);
});
document.querySelector('[data-action="abrir-faturacao"]')?.addEventListener('click', () => {
  document.getElementById('faturacao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Módulo de faturação aberto.');
});
document.querySelector('[data-action="sair"]')?.addEventListener('click', () => {
  pararQr();
  localStorage.setItem('erpLoggedIn', '0');
  loginPanel?.classList.remove('hidden');
  showToast('Sistema desligado.');
});
document.querySelector('[data-action="novo-funcionario"]')?.addEventListener('click', () => {
  addSimpleItem('funcionarios-list', 'Nome do funcionário:', 'Equipa', 'Funcionário adicionado.');
});
document.querySelector('[data-action="iniciar-qr"]')?.addEventListener('click', iniciarQr);
document.querySelector('[data-action="parar-qr"]')?.addEventListener('click', pararQr);
document.querySelector('[data-action="emitir-fatura"]')?.addEventListener('click', gerarFaturaPdf);

document.getElementById('cliente-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const nome = data.get('nome') || 'Novo cliente';
  state.clientes += 1;
  saveState();
  updateKpis();
  addOperation(nome, 'CLI-NOVO', 0, 'Registado', 'info');
  event.currentTarget.reset();
  showToast('Cliente guardado com sucesso.');
});

document.getElementById('qr-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const codigo = String(data.get('codigo') || '').trim();
  const produto = String(data.get('produto') || '').trim();
  if (!codigo || !produto) {
    showToast('Informe o código e o nome do produto.');
    return;
  }
  adicionarProduto(codigo, produto, 'Manual', 1, 0);
  abrirStock();
  event.currentTarget.reset();
});

document.getElementById('stock-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const ok = upsertStockProduct({
    codigo: data.get('codigo'),
    produto: data.get('produto'),
    categoria: data.get('categoria') || 'Geral',
    quantidade: data.get('quantidade') || 1,
    preco: data.get('preco') || 0
  });
  if (!ok) {
    showToast('Informe código e nome do produto.');
    return;
  }
  event.currentTarget.reset();
  document.getElementById('stock-qty').value = 1;
  document.getElementById('stock-price').value = 0;
  showToast('Produto guardado no banco de stock.');
});

stockSearch?.addEventListener('input', () => renderStock(stockSearch.value));

document.querySelector('[data-action="limpar-stock"]')?.addEventListener('click', () => {
  if (!window.confirm('Deseja limpar todos os produtos do banco de stock?')) return;
  saveStockProducts([]);
  state.produtos = 0;
  saveState();
  updateKpis();
  renderStock();
  showToast('Banco de stock limpo.');
});

document.getElementById('login-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  localStorage.setItem('erpLoggedIn', '1');
  loginPanel?.classList.add('hidden');
  showToast('Login efetuado com sucesso.');
});

document.querySelector('[data-action="toggle-password"]')?.addEventListener('click', (event) => {
  const input = document.getElementById('login-password');
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  event.currentTarget.textContent = showing ? 'Ver' : 'Ocultar';
});

document.querySelector('[data-action="abrir-cadastro"]')?.addEventListener('click', () => {
  document.getElementById('register-form')?.classList.toggle('hidden');
});

document.getElementById('register-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const usuario = String(data.get('novo_usuario') || '').trim();
  const codigo = String(data.get('codigo') || '').trim();
  if (!usuario || !codigo) {
    showToast('Informe usuário e código de acesso.');
    return;
  }
  saveJson('erpRegisteredUser', { usuario, codigo });
  event.currentTarget.reset();
  event.currentTarget.classList.add('hidden');
  showToast('Usuário cadastrado com sucesso.');
});

window.addEventListener('hashchange', () => {
  const active = document.querySelector(`.menu a[href="${window.location.hash}"]`);
  if (!active) return;
  document.querySelectorAll('.menu a').forEach((item) => item.classList.remove('active'));
  active.classList.add('active');
});

init();
