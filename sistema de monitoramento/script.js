// 1. Inicializa o mapa focado em uma coordenada inicial (Ex: São Paulo)
const centroInicial = [-23.55052, -46.633308]; 
const map = L.map('map').setView(centroInicial, 15);

// 2. Adiciona a camada visual do mapa (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Cria o marcador do objeto rastreado
let marcador = L.marker(centroInicial).addTo(map)
    .bindPopup('Veículo de Entrega 01')
    .openPopup();

// Função para atualizar o painel e o mapa quando novas coordenadas chegam
function atualizarPosicao(lat, lng) {
    const novaCoordenada = [lat, lng];

    // Move o marcador para o novo ponto
    marcador.setLatLng(novaCoordenada);
    
    // Opcional: Centraliza o mapa automaticamente no objeto em movimento
    map.panTo(novaCoordenada);

    // Atualiza a interface de texto (Sidebar)
    document.getElementById('lat').innerText = lat.toFixed(6);
    document.getElementById('lng').innerText = lng.toFixed(6);
    document.getElementById('time').innerText = new Date().toLocaleTimeString();
}

// --- SIMULAÇÃO DE MOVIMENTO EM TEMPO REAL ---
// Aqui fingimos que o GPS está mandando dados a cada 2 segundos
let simularAtivo = false;
let intervaloSimulacao;
let latAtual = centroInicial[0];
let lngAtual = centroInicial[1];

document.getElementById('btnSimular').addEventListener('click', () => {
    if (simularAtivo) {
        clearInterval(intervaloSimulacao);
        document.getElementById('btnSimular').innerText = "Simular Movimento";
        simularAtivo = false;
    } else {
        document.getElementById('btnSimular').innerText = "Parar Simulação";
        simularAtivo = true;
        
        intervaloSimulacao = setInterval(() => {
            // Altera levemente a latitude e longitude para simular deslocamento
            latAtual += (Math.random() - 0.5) * 0.001;
            lngAtual += (Math.random() - 0.5) * 0.001;
            
            atualizarPosicao(latAtual, lngAtual);
        }, 2000); // Atualiza a cada 2000ms (2 segundos)
    }
});