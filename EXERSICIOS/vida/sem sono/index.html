<?php
declare(strict_types=1);

const CURRENCY = 'FCFA';
const DATA_DIR = __DIR__ . '/data';

$modules = [
    'dashboard' => 'Dashboard',
    'vendas' => 'Vendas',
    'clientes' => 'Clientes',
    'produtos' => 'Produtos',
    'fornecedores' => 'Fornecedores',
    'funcionarios' => 'Funcionários',
    'faturacao' => 'Faturação',
    'despesas' => 'Despesas',
    'relatorios' => 'Relatórios',
    'caixa' => 'Caixa Diário',
    'usuarios' => 'Usuários',
    'configuracoes' => 'Configurações',
    'estoque' => 'Controle de Estoque',
    'orcamentos' => 'Orçamentos',
    'receber' => 'Contas a Receber',
    'pagar' => 'Contas a Pagar',
    'servicos' => 'Gestão de Serviços',
    'backup' => 'Backup do Sistema',
    'logs' => 'Logs de Usuários',
];

function e(string|int|float|null $value): string { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); }
function path_for(string $table): string { return DATA_DIR . '/' . $table . '.json'; }
function money(float|int $value): string { return number_format((float) $value, 0, ',', '.') . ' ' . CURRENCY; }
function today(): string { return date('Y-m-d'); }

function rows(string $table): array {
    $path = path_for($table);
    if (!file_exists($path)) return [];
    $json = file_get_contents($path) ?: '[]';
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function save_rows(string $table, array $rows): void {
    if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0777, true);
    file_put_contents(path_for($table), json_encode(array_values($rows), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function next_id(array $rows): int {
    $ids = array_column($rows, 'id');
    return $ids ? max($ids) + 1 : 1;
}

function add_log(string $action): void {
    $logs = rows('logs');
    $logs[] = ['id' => next_id($logs), 'date' => date('Y-m-d H:i'), 'user' => 'Administrador', 'action' => $action];
    save_rows('logs', $logs);
}

function create_row(string $table, array $data, string $log): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
    $rows = rows($table);
    $data['id'] = next_id($rows);
    $data['created_at'] = today();
    $rows[] = $data;
    save_rows($table, $rows);
    add_log($log);
    header('Location: ?page=' . urlencode($_GET['page'] ?? 'dashboard'));
    exit;
}

function sum_col(string $table, string $field): float {
    return array_sum(array_map(fn($row) => (float)($row[$field] ?? 0), rows($table)));
}

function stats(): array {
    return [
        'sales' => sum_col('vendas', 'total'),
        'clients' => count(rows('clientes')),
        'products' => count(rows('produtos')),
        'cash' => sum_col('vendas', 'total') - sum_col('despesas', 'valor') + sum_col('receber', 'valor') - sum_col('pagar', 'valor'),
    ];
}

function badge(string $status): string {
    $map = ['Pago'=>'ok','Ativo'=>'ok','Recebido'=>'ok','Aprovado'=>'ok','Concluído'=>'ok','Normal'=>'ok','Aberto'=>'warn','Pendente'=>'warn','Em execução'=>'warn','Baixo'=>'warn','Cancelado'=>'bad','Atrasado'=>'bad','Recusado'=>'bad','Inativo'=>'bad'];
    $class = $map[$status] ?? 'neutral';
    return '<span class="badge ' . $class . '">' . e($status) . '</span>';
}

function field(string $name, string $placeholder, string $type = 'text', string $value = '"''"'): string {
    return '<input name="' . e($name) . '" type="' . e($type) . '" placeholder="' . e($placeholder) . '" value="' . e($value) . '" required>';
}

function panel_table(string $title, array $headers, array $rows, callable $render): void {
    echo '<section class="panel"><div class="panel-head"><h2>' . e($title) . '</h2></div><div class="table-wrap"><table><thead><tr>';
    foreach ($headers as $head) echo '<th>' . e($head) . '</th>';
    echo '</tr></thead><tbody>';
    if (!$rows) echo '<tr><td colspan="' . count($headers) . '">Nenhum registo encontrado.</td></tr>';
    foreach ($rows as $row) echo $render($row);
    echo '</tbody></table></div></section>';
}

$page = $_GET['page'] ?? 'dashboard';
if (!isset($modules[$page])) $page = 'dashboard';

if ($page === 'vendas') create_row('vendas', ['cliente'=>trim($_POST['cliente'] ?? '"''"'), 'produto'=>trim($_POST['produto'] ?? '"''"'), 'quantidade'=>(int)($_POST['quantidade'] ?? 1), 'total'=>(float)($_POST['total'] ?? 0), 'status'=>$_POST['status'] ?? 'Pago'], 'Venda registada');
if ($page === 'clientes') create_row('clientes', ['nome'=>trim($_POST['nome'] ?? '"''"'), 'telefone'=>trim($_POST['telefone'] ?? '"''"'), 'email'=>trim($_POST['email'] ?? '"''"'), 'tipo'=>$_POST['tipo'] ?? 'Particular'], 'Cliente cadastrado');
if ($page === 'produtos') create_row('produtos', ['nome'=>trim($_POST['nome'] ?? '"''"'), 'categoria'=>trim($_POST['categoria'] ?? '"''"'), 'preco'=>(float)($_POST['preco'] ?? 0), 'stock'=>(int)($_POST['stock'] ?? 0), 'status'=>$_POST['status'] ?? 'Ativo'], 'Produto cadastrado');
if ($page === 'despesas') create_row('despesas', ['descricao'=>trim($_POST['descricao'] ?? '"''"'), 'categoria'=>trim($_POST['categoria'] ?? '"''"'), 'valor'=>(float)($_POST['valor'] ?? 0), 'status'=>$_POST['status'] ?? 'Pago'], 'Despesa lançada');
if ($page === 'fornecedores') create_row('fornecedores', ['nome'=>trim($_POST['nome'] ?? '"''"'), 'telefone'=>trim($_POST['telefone'] ?? '"''"'), 'nif'=>trim($_POST['nif'] ?? '"''"'), 'area'=>trim($_POST['area'] ?? '"''"')], 'Fornecedor cadastrado');
if ($page === 'funcionarios') create_row('funcionarios', ['nome'=>trim($_POST['nome'] ?? '"''"'), 'cargo'=>trim($_POST['cargo'] ?? '"''"'), 'telefone'=>trim($_POST['telefone'] ?? '"''"'), 'salario'=>(float)($_POST['salario'] ?? 0)], 'Funcionário cadastrado');
if ($page === 'usuarios') create_row('usuarios', ['nome'=>trim($_POST['nome'] ?? '"''"'), 'email'=>trim($_POST['email'] ?? '"''"'), 'perfil'=>$_POST['perfil'] ?? 'Operador', 'status'=>$_POST['status'] ?? 'Ativo'], 'Usuário cadastrado');
if ($page === 'orcamentos') create_row('orcamentos', ['cliente'=>trim($_POST['cliente'] ?? '"''"'), 'descricao'=>trim($_POST['descricao'] ?? '"''"'), 'valor'=>(float)($_POST['valor'] ?? 0), 'validade'=>$_POST['validade'] ?? today(), 'status'=>$_POST['status'] ?? 'Aberto'], 'Orçamento criado');
if ($page === 'servicos') create_row('servicos', ['cliente'=>trim($_POST['cliente'] ?? '"''"'), 'servico'=>trim($_POST['servico'] ?? '"''"'), 'tecnico'=>trim($_POST['tecnico'] ?? '"''"'), 'valor'=>(float)($_POST['valor'] ?? 0), 'status'=>$_POST['status'] ?? 'Aberto'], 'Serviço registado');
if ($page === 'receber') create_row('receber', ['entidade'=>trim($_POST['entidade'] ?? '"''"'), 'descricao'=>trim($_POST['descricao'] ?? '"''"'), 'valor'=>(float)($_POST['valor'] ?? 0), 'vencimento'=>$_POST['vencimento'] ?? today(), 'status'=>$_POST['status'] ?? 'Pendente'], 'Conta a receber registada');
if ($page === 'pagar') create_row('pagar', ['entidade'=>trim($_POST['entidade'] ?? '"''"'), 'descricao'=>trim($_POST['descricao'] ?? '"''"'), 'valor'=>(float)($_POST['valor'] ?? 0), 'vencimento'=>$_POST['vencimento'] ?? today(), 'status'=>$_POST['status'] ?? 'Pendente'], 'Conta a pagar registada');

$s = stats();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP CA Serviços - <?= e($modules[$page]) ?></title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<aside class="sidebar">
  <div class="brand"><span>CA</span><div><strong>ERP CA Serviços</strong><small>Sistema de Gestão</small></div></div>
  <nav class="menu">
    <?php foreach ($modules as $key => $label): ?>
      <a class="<?= $page === $key ? 'active' : '"''"' ?>" href="?page=<?= e($key) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </nav>
</aside>
<main class="main">
  <header class="topbar"><div><p>Painel administrativo</p><h1><?= e($modules[$page]) ?></h1></div><div><a class="button secondary" href="?page=clientes">Novo Cliente</a><a class="button" href="?page=vendas">Nova Venda</a></div></header>
  <section class="stats"><article><span>Total Vendas</span><strong><?= money($s['sales']) ?></strong></article><article><span>Total Clientes</span><strong><?= $s['clients'] ?></strong></article><article><span>Total Produtos</span><strong><?= $s['products'] ?></strong></article><article><span>Saldo Caixa</span><strong><?= money($s['cash']) ?></strong></article></section>

<?php if ($page === 'dashboard'): ?>
  <section class="grid two"><div class="panel"><div class="panel-head"><h2>Ações Rápidas</h2></div><div class="actions"><a class="button" href="?page=vendas">Registrar Venda</a><a class="button secondary" href="?page=clientes">Cadastrar Cliente</a><a class="button secondary" href="?page=produtos">Novo Produto</a><a class="button secondary" href="?page=despesas">Lançar Despesa</a><a class="button secondary" href="?page=relatorios">Relatórios</a></div></div><div class="panel"><div class="panel-head"><h2>Últimos Logs</h2></div><?php panel_table('"''"', ['Data','Usuário','Ação'], array_slice(array_reverse(rows('logs')),0,5), fn($r)=>'<tr><td>'.e($r['date']).'</td><td>'.e($r['user']).'</td><td>'.e($r['action']).'</td></tr>'); ?></div></section>
<?php elseif ($page === 'vendas'): ?>
  <section class="panel"><div class="panel-head"><h2>Registrar Venda</h2></div><form method="post" class="form-grid"><?= field('cliente','Cliente') ?><?= field('produto','Produto ou serviço') ?><?= field('quantidade','Quantidade','number','1') ?><?= field('total','Total','number') ?><select name="status"><option>Pago</option><option>Pendente</option><option>Cancelado</option></select><button>Salvar Venda</button></form></section>
  <?php panel_table('Histórico de Vendas', ['ID','Data','Cliente','Produto','Qtd.','Total','Status'], array_reverse(rows('vendas')), fn($r)=>'<tr><td>#'.e($r['id']).'</td><td>'.e($r['created_at']).'</td><td>'.e($r['cliente']).'</td><td>'.e($r['produto']).'</td><td>'.e($r['quantidade']).'</td><td>'.money($r['total']).'</td><td>'.badge($r['status']).'</td></tr>'); ?>
<?php elseif ($page === 'clientes'): ?>
  <section class="panel"><div class="panel-head"><h2>Cadastrar Cliente</h2></div><form method="post" class="form-grid"><?= field('nome','Nome do cliente') ?><?= field('telefone','Telefone') ?><input name="email" type="email" placeholder="Email"><select name="tipo"><option>Particular</option><option>Empresa</option></select><button>Salvar Cliente</button></form></section>
  <?php panel_table('Clientes', ['ID','Nome','Telefone','Email','Tipo'], array_reverse(rows('clientes')), fn($r)=>'<tr><td>#'.e($r['id']).'</td><td>'.e($r['nome']).'</td><td>'.e($r['telefone']).'</td><td>'.e($r['email']).'</td><td>'.e($r['tipo']).'</td></tr>'); ?>
<?php elseif ($page === 'produtos'): ?>
  <section class="panel"><div class="panel-head"><h2>Novo Produto</h2></div><form method="post" class="form-grid"><?= field('nome','Nome do produto') ?><input name="categoria" placeholder="Categoria"><?= field('preco','Preço','number') ?><?= field('stock','Stock','number','0') ?><select name="status"><option>Ativo</option><option>Inativo</option></select><button>Salvar Produto</button></form></section>
  <?php panel_table('Produtos', ['ID','Produto','Categoria','Preço','Stock','Status'], array_reverse(rows('produtos')), fn($r)=>'<tr><td>#'.e($r['id']).'</td><td>'.e($r['nome']).'</td><td>'.e($r['categoria']).'</td><td>'.money($r['preco']).'</td><td>'.e($r['stock']).'</td><td>'.badge($r['status']).'</td></tr>'); ?>
<?php elseif ($page === 'despesas'): ?>
  <section class="panel"><div class="panel-head"><h2>Lançar Despesa</h2></div><form method="post" class="form-grid"><?= field('descricao','Descrição') ?><input name="categoria" placeholder="Categoria"><?= field('valor','Valor','number') ?><select name="status"><option>Pago</option><option>Pendente</option></select><button>Salvar Despesa</button></form></section>
  <?php panel_table('Despesas', ['ID','Data','Descrição','Categoria','Valor','Status'], array_reverse(rows('despesas')), fn($r)=>'<tr><td>#'.e($r['id']).'</td><td>'.e($r['created_at']).'</td><td>'.e($r['descricao']).'</td><td>'.e($r['categoria']).'</td><td>'.money($r['valor']).'</td><td>'.badge($r['status']).'</td></tr>'); ?>
<?php elseif (in_array($page, ['receber','pagar'], true)): ?>
  <section class="panel"><div class="panel-head"><h2>Novo Registro</h2></div><form method="post" class="form-grid"><?= field('entidade','Cliente ou fornecedor') ?><?= field('descricao','Descrição') ?><?= field('valor','Valor','number') ?><input name="vencimento" type="date" value="<?= today() ?>"><select name="status"><option>Pendente</option><option>Pago</option><option>Recebido</option><option>Atrasado</option></select><button>Salvar</button></form></section>
  <?php panel_table('Registros Financeiros', ['ID','Entidade','Descrição','Valor','Vencimento','Status'], array_reverse(rows($page)), fn($r)=>'<tr><td>#'.e($r['id']).'</td><td>'.e($r['entidade']).'</td><td>'.e($r['descricao']).'</td><td>'.money($r['valor']).'</td><td>'.e($r['vencimento']).'</td><td>'.badge($r['status']).'</td></tr>'); ?>
<?php elseif (in_array($page, ['fornecedores','funcionarios','usuarios','orcamentos','servicos'], true)): ?>
  <?php $config = [
    'fornecedores'=>['Fornecedor',['nome'=>'Nome','telefone'=>'Telefone','nif'=>'NIF','area'=>'Área'],['ID','Nome','Telefone','NIF','Área']],
    'funcionarios'=>['Funcionário',['nome'=>'Nome','cargo'=>'Cargo','telefone'=>'Telefone','salario'=>'Salário'],['ID','Nome','Cargo','Telefone','Salário']],
    'usuarios'=>['Usuário',['nome'=>'Nome','email'=>'Email','perfil'=>'Perfil','status'=>'Status'],['ID','Nome','Email','Perfil','Status']],
    'orcamentos'=>['Orçamento',['cliente'=>'Cliente','descricao'=>'Descrição','valor'=>'Valor','validade'=>'Validade','status'=>'Status'],['ID','Cliente','Descrição','Valor','Validade','Status']],
    'servicos'=>['Serviço',['cliente'=>'Cliente','servico'=>'Serviço','tecnico'=>'Técnico','valor'=>'Valor','status'=>'Status'],['ID','Cliente','Serviço','Técnico','Valor','Status']],
  ][$page]; ?>
  <section class="panel"><div class="panel-head"><h2>Novo <?= e($config[0]) ?></h2></div><form method="post" class="form-grid"><?php foreach ($config[1] as $name=>$label): ?><input name="<?= e($name) ?>" placeholder="<?= e($label) ?>" required><?php endforeach; ?><button>Salvar</button></form></section>
  <?php panel_table($modules[$page], $config[2], array_reverse(rows($page)), function($r) use ($page) { $cells = '<td>#'.e($r['id']).'</td>'; foreach ($r as $k=>$v) if (!in_array($k, ['id','created_at'], true)) $cells .= '<td>'.(in_array($k,['valor','salario'],true)?money((float)$v):e($v)).'</td>'; return '<tr>'.$cells.'</tr>'; }); ?>
<?php elseif ($page === 'estoque'): ?>
  <?php panel_table('Controle de Estoque', ['Produto','Categoria','Stock','Preço','Situação'], array_reverse(rows('produtos')), fn($r)=>'<tr><td>'.e($r['nome']).'</td><td>'.e($r['categoria']).'</td><td>'.e($r['stock']).'</td><td>'.money($r['preco']).'</td><td>'.badge(((int)$r['stock']<=5?'Baixo':'Normal')).'</td></tr>'); ?>
<?php elseif ($page === 'faturacao'): ?>
  <?php panel_table('Faturação', ['Fatura','Data','Cliente','Total','Status'], array_reverse(rows('vendas')), fn($r)=>'<tr><td>FT-'.str_pad((string)$r['id'],5,'0',STR_PAD_LEFT).'</td><td>'.e($r['created_at']).'</td><td>'.e($r['cliente']).'</td><td>'.money($r['total']).'</td><td>'.badge($r['status']).'</td></tr>'); ?>
<?php elseif ($page === 'caixa' || $page === 'relatorios'): ?>
  <section class="grid two"><div class="panel"><div class="panel-head"><h2>Financeiro</h2></div><dl><div><dt>Vendas</dt><dd><?= money(sum_col('vendas','total')) ?></dd></div><div><dt>Despesas</dt><dd><?= money(sum_col('despesas','valor')) ?></dd></div><div><dt>Saldo</dt><dd><?= money($s['cash']) ?></dd></div></dl></div><div class="panel"><div class="panel-head"><h2>Operacional</h2></div><dl><div><dt>Clientes</dt><dd><?= count(rows('clientes')) ?></dd></div><div><dt>Produtos</dt><dd><?= count(rows('produtos')) ?></dd></div><div><dt>Vendas</dt><dd><?= count(rows('vendas')) ?></dd></div></dl></div></section>
<?php elseif ($page === 'backup'): ?>
  <?php $files = glob(DATA_DIR.'/*.json') ?: []; panel_table('Ficheiros de Dados', ['Ficheiro','Tamanho','Atualizado'], $files, fn($f)=>'<tr><td>'.e(basename($f)).'</td><td>'.number_format(filesize($f)/1024,1,',','.').' KB</td><td>'.date('Y-m-d H:i', filemtime($f)).'</td></tr>'); ?>
<?php elseif ($page === 'logs'): ?>
  <?php panel_table('Logs de Usuários', ['ID','Data','Usuário','Ação'], array_reverse(rows('logs')), fn($r)=>'<tr><td>#'.e($r['id']).'</td><td>'.e($r['date']).'</td><td>'.e($r['user']).'</td><td>'.e($r['action']).'</td></tr>'); ?>
<?php else: ?>
  <section class="panel"><div class="panel-head"><h2>Configurações</h2></div><form class="form-grid"><input value="CA Serviços"><input value="FCFA"><input placeholder="NIF"><input placeholder="Telefone"><button type="button">Guardar</button></form><p class="note">Esta versão usa JSON. Para produção, use MySQL, autenticação e permissões por perfil.</p></section>
<?php endif; ?>
</main>
</body>
</html>
'@ | Set-Content -LiteralPath index.php -Encoding UTF8
@'
:root{--bg:#f4f7fb;--panel:#fff;--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--brand:#1f6feb;--brand-dark:#174ea6;--sidebar:#111827;--soft:#1f2937;--ok:#0f766e;--warn:#b45309;--bad:#b91c1c}*{box-sizing:border-box}body{min-height:100vh;margin:0;display:flex;background:var(--bg);color:var(--ink);font-family:Arial,Helvetica,sans-serif}.sidebar{width:280px;min-height:100vh;position:sticky;top:0;overflow-y:auto;padding:22px;background:var(--sidebar);color:#fff}.brand{display:flex;gap:12px;align-items:center;margin-bottom:24px}.brand span{display:grid;width:44px;height:44px;place-items:center;border-radius:8px;background:var(--brand);font-weight:800}.brand strong,.brand small{display:block}.brand small{margin-top:3px;color:#aeb8c8;font-size:12px}.menu{display:grid;gap:5px}.menu a{padding:11px 12px;border-radius:8px;color:#cbd5e1;text-decoration:none;font-size:14px}.menu a:hover,.menu a.active{background:var(--soft);color:#fff}.main{flex:1;min-width:0;padding:30px}.topbar{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:22px}.topbar p{margin:0 0 4px;color:var(--muted);font-size:13px;font-weight:700;text-transform:uppercase}h1,h2{margin:0}h1{font-size:28px}h2{font-size:18px}.topbar>div:last-child,.actions{display:flex;gap:10px;flex-wrap:wrap}.button,button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:10px 16px;border:0;border-radius:8px;background:var(--brand);color:#fff;font-size:14px;font-weight:700;text-decoration:none;cursor:pointer}.button:hover,button:hover{background:var(--brand-dark)}.button.secondary{background:#e8eef9;color:#153b7a}.button.secondary:hover{background:#dbe7fb}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:18px}.stats article,.panel{background:var(--panel);border:1px solid var(--line);border-radius:8px;box-shadow:0 8px 24px rgba(15,23,42,.05)}.stats article{padding:18px}.stats span{display:block;color:var(--muted);font-size:13px;margin-bottom:10px}.stats strong{font-size:24px}.grid{display:grid;gap:18px;margin-bottom:18px}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.panel{margin-bottom:18px;overflow:hidden}.panel-head{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:18px;border-bottom:1px solid var(--line)}.actions,.form-grid,dl,.note{padding:18px}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:12px}input,select{width:100%;min-height:42px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:var(--ink)}input:focus,select:focus{outline:3px solid rgba(31,111,235,.14);border-color:var(--brand)}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse}th,td{padding:13px 14px;border-bottom:1px solid var(--line);text-align:left;font-size:14px;vertical-align:middle}th{background:#f8fafc;color:#334155;font-size:12px;text-transform:uppercase}tr:hover td{background:#fbfdff}.badge{display:inline-flex;padding:5px 9px;border-radius:999px;background:#e2e8f0;color:#334155;font-size:12px;font-weight:700}.badge.ok{background:#dcfce7;color:var(--ok)}.badge.warn{background:#fef3c7;color:var(--warn)}.badge.bad{background:#fee2e2;color:var(--bad)}dl{display:grid;gap:12px;margin:0}dl div{display:flex;justify-content:space-between;gap:16px;padding-bottom:12px;border-bottom:1px solid var(--line)}dt{color:var(--muted)}dd{margin:0;font-weight:800}.note{color:var(--muted);line-height:1.6}@media(max-width:980px){body{display:block}.sidebar{position:static;width:100%;min-height:auto}.menu{grid-template-columns:repeat(2,minmax(0,1fr))}.stats,.grid.two,.form-grid{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column}}
'@ | Set-Content -LiteralPath assets\css\style.css -Encoding UTF8
'"''"' | Set-Content -LiteralPath data\.gitkeep -Encoding UTF8
