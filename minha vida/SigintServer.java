import org.java-websocket.WebSocket;
import org.java-websocket.handshake.ClientHandshake;
import org.java-websocket.server.WebSocketServer;
import java.net.InetSocketAddress;
import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;

public class SigintServer extends WebSocketServer {

    private Timer canalTimer;
    private Timer hardwareTimer;
    private int alvoAtivoId = -1;
    private final Random random = new Random();
    
    // Base de dados simulando interceptações telefônicas capturadas na rede
    private final String[][] logsConversas = {
        {
            "Alvo: O perímetro sul está limpo. Pode encaminhar o ativo.",
            "Destino: Entendido. O transporte avança em 3 minutos.",
            "Alvo: Copiado. Mudando frequência de rádio."
        },
        {
            "Alvo: Solicito atualização do status de criptografia das partições.",
            "Destino: Chaves RSA de 4096 bits aplicadas com sucesso.",
            "Alvo: Perfeito. Desconectando terminal de auditoria."
        }
    };
    private int logIndex = 0;

    public SigintServer(int porta) {
        super(new InetSocketAddress(porta));
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("💻 [INFO]: Painel Operacional conectado de: " + conn.getRemoteSocketAddress());
        iniciarMonitoramentoHardware(conn);
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("❌ [INFO]: Painel Desconectado.");
        pararCapturaCanal();
        if (hardwareTimer != null) hardwareTimer.cancel();
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        // Trata os pacotes JSON de controle vindos do JavaScript do navegador
        if (message.contains("START")) {
            int id = message.contains("alvoId\":1") ? 1 : 2;
            System.out.println("📡 [SINAL]: Ordem recebida. Iniciando grampo no Alvo #" + id);
            iniciarCapturaCanal(conn, id);
        } else if (message.contains("STOP")) {
            System.out.println("🛑 [SINAL]: Encerrando interceptação atual.");
            pararCapturaCanal();
        }
    }

    private void iniciarCapturaCanal(WebSocket conn, int alvoId) {
        pararCapturaCanal(); // Garante isolamento de canais
        this.alvoAtivoId = alvoId;
        this.logIndex = 0;
        
        canalTimer = new Timer();
        canalTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                if (!conn.isOpen()) { cancel(); return; }

                // 1. Gera Array matemático de frequências dinâmicas da voz
                StringBuilder ondasJson = new StringBuilder("[");
                for (int i = 0; i < 16; i++) {
                    int amplitude = random.nextInt(90) + 10;
                    if (i == 4 || i == 5) amplitude += 120; // Força pico de frequência humana
                    ondasJson.append(amplitude).append(i < 15 ? "," : "");
                }
                ondasJson.append("]");

                // 2. Criação do pacote de metadados simulando a inspeção de pacotes VoIP reais
                String codec = (alvoId == 1) ? "G.711A (PCMA)" : "OPUS (48kHz)";
                String jitter = String.format("%.1f ms", random.nextFloat() * 1.5);
                String latencia = (random.nextInt(5) + 8) + " ms";

                // 3. Injeta a string de diálogo de forma espaçada no tempo
                String textoLinha = "";
                if (random.nextFloat() > 0.85 && logIndex < logsConversas[alvoId - 1].length) {
                    textoLinha = logsConversas[alvoId - 1][logIndex];
                    logIndex++;
                }

                // Monta o frame JSON bruto de transmissão em tempo real
                String parseOrigem = textoLinha.startsWith("Alvo") ? "Alvo" : "Destino";
                String limpaTexto = textoLinha.replace("Alvo: ", "").replace("Destino: ", "");

                String payload = "{"
                        + "\"alvoId\":" + alvoId + ","
                        + "\"ondas\":" + ondasJson.toString() + ","
                        + "\"codec\":\"" + codec + "\","
                        + "\"jitter\":\"" + jitter + "\","
                        + "\"perda\":\"0.00%\","
                        + "\"latencia\":\"" + latencia + "\""
                        + (!textoLinha.isEmpty() ? ",\长期\"texto\":\"" + limpaTexto + "\",\"origem\":\"" + parseOrigem + "\"" : "")
                        + "}";

                conn.send(payload);
            }
        }, 0, 200); // Taxa de amostragem agressiva: Transmite a cada 200ms (Tempo Real)
    }

    private void pararCapturaCanal() {
        if (canalTimer != null) {
            canalTimer.cancel();
            canalTimer = null;
        }
        alvoAtivoId = -1;
    }

    private void iniciarMonitoramentoHardware(WebSocket conn) {
        hardwareTimer = new Timer();
        hardwareTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                if (conn.isOpen()) {
                    String cpu = (random.nextInt(6) + 4) + "%";
                    String banda = (alvoAtivoId != -1) ? String.format("%.2f Mbps", random.nextFloat() * 0.8 + 2.1) : "0.00 Mbps";
                    
                    conn.send("{\"tipo\":\"hardware\",\"cpu\":\"" + cpu + "\",\"banda\":\"" + banda + "\"}");
                }
            }
        }, 0, 1500);
    }

    @Override
    public void onError(WebSocket conn, Exception ex) { System.err.println("🚨 [ERRO]: " + ex.getMessage()); }

    @Override
    public void onStart() { System.out.println("⚡ [START]: Servidor SIGINT Core rodando com sucesso na porta 8888."); }

    public static void main(String[] args) {
        int porta = 8888;
        SigintServer servidor = new SigintServer(porta);
        servidor.start();
    }
}