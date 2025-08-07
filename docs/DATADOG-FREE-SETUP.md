# 🆓 Configuração do Datadog Free Plan

## 📋 Pré-requisitos

1. **Conta Datadog**: Criar conta gratuita em [datadoghq.com](https://www.datadoghq.com/)
2. **API Key**: Obter a chave da API no dashboard do Datadog
3. **Servidor**: Acesso root ao servidor

## 🚀 Passo a Passo

### **1. Criar Conta Datadog**

1. Acesse [datadoghq.com](https://www.datadoghq.com/)
2. Clique em "Start Free Trial"
3. Preencha os dados:
   - **Email**: seu-email@exemplo.com
   - **Nome**: Seu Nome
   - **Empresa**: MeuPaoZin
   - **Tamanho da empresa**: 1-10 funcionários
   - **Cargo**: Desenvolvedor/CTO

### **2. Obter API Key**

1. Faça login no Datadog
2. Vá em **Settings** → **API Keys**
3. Copie a **API Key** (formato: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### **3. Configurar no Servidor**

```bash
# Conectar ao servidor
ssh root@seu-ip-servidor

# Instalar Datadog Agent
DD_API_KEY=sua_api_key_do_datadog DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"

# Verificar instalação
sudo datadog-agent status
```

### **4. Configurar APM (Application Performance Monitoring)**

```bash
# Instalar dd-trace no servidor
npm install -g dd-trace

# Configurar variáveis de ambiente
export DD_ENV=production
export DD_SERVICE=meu-paozin-api
export DD_VERSION=1.0.0
export DD_TRACE_ENABLED=true
export DD_AGENT_HOST=localhost
export DD_AGENT_PORT=8126
```

### **5. Configurar Logs**

```bash
# Habilitar coleta de logs
sudo sed -i 's/# logs_enabled: false/logs_enabled: true/' /etc/datadog-agent/datadog.yaml

# Configurar logs da aplicação
sudo tee -a /etc/datadog-agent/conf.d/logs.yaml << EOF
logs:
  - type: file
    path: /var/www/meupaozin/backend/logs/*.log
    service: meu-paozin-api
    source: nodejs
EOF

# Reiniciar Datadog Agent
sudo systemctl restart datadog-agent
```

### **6. Configurar Métricas Customizadas**

```bash
# Criar arquivo de configuração para métricas
sudo tee /etc/datadog-agent/conf.d/custom_metrics.yaml << EOF
init_config:

instances:
  - name: meu-paozin-metrics
    tags:
      - "service:meu-paozin-api"
      - "env:production"
EOF
```

### **7. Configurar Alertas (Free Plan Limitado)**

```bash
# Criar monitor básico (via UI do Datadog)
# 1. Acesse: https://app.datadoghq.com/monitors/manage
# 2. Clique em "New Monitor"
# 3. Configure:
#    - Type: Metric
#    - Query: avg:system.cpu.user{host:seu-servidor}
#    - Alert: > 80
#    - Warning: > 60
```

### **8. Configurar Dashboard**

```bash
# Criar dashboard básico (via UI do Datadog)
# 1. Acesse: https://app.datadoghq.com/dashboard/lists
# 2. Clique em "New Dashboard"
# 3. Adicione widgets:
#    - CPU Usage
#    - Memory Usage
#    - Disk Usage
#    - Network Traffic
#    - Application Response Time
```

## 📊 Métricas Disponíveis no Free Plan

### **🔹 Sistema**
- CPU Usage
- Memory Usage
- Disk Usage
- Network Traffic
- Load Average

### **🔹 Aplicação**
- Response Time
- Error Rate
- Throughput
- Custom Metrics (5 métricas)

### **🔹 Logs**
- Log Volume
- Error Logs
- Custom Logs
- Retenção: 1 dia

### **🔹 APM**
- Request Traces
- Database Queries
- External Calls
- Custom Spans (100/hora)

## 🎯 Limitações do Free Plan

### **✅ Incluído**
- 3 hosts
- 5 métricas customizadas
- 1 dia de retenção de logs
- 100 spans/hora (APM)
- Alertas básicos

### **❌ Não Incluído**
- Alertas customizados avançados
- Retenção de logs > 1 dia
- Métricas customizadas > 5
- Spans APM > 100/hora
- Suporte prioritário

## 💡 Dicas para Otimizar o Free Plan

### **1. Focar nas Métricas Essenciais**
```javascript
// Exemplo de métricas customizadas otimizadas
const essentialMetrics = [
  'pedidos.created',
  'pedidos.updated', 
  'pedidos.deleted',
  'api.response_time',
  'database.connections'
];
```

### **2. Usar Logs Estratégicos**
```javascript
// Log apenas erros e eventos críticos
if (error) {
  console.error('ERRO_CRITICO:', error);
}

if (event.important) {
  console.log('EVENTO_IMPORTANTE:', event);
}
```

### **3. Otimizar APM**
```javascript
// Usar spans apenas para operações críticas
@DatadogTrace('operacao.critica')
async operacaoCritica() {
  // código
}
```

## 🔄 Upgrade para Pro Plan

### **Quando Considerar Upgrade**
- ✅ Mais de 3 hosts
- ✅ Mais de 5 métricas customizadas
- ✅ Necessidade de retenção > 1 dia
- ✅ Mais de 100 spans/hora
- ✅ Alertas customizados

### **Custo do Upgrade**
- **Pro Plan**: R$ 23/host/mês
- **Seu caso**: 1 host = R$ 23/mês

## 📞 Suporte

### **Free Plan**
- Documentação online
- Comunidade
- Email básico

### **Pro Plan**
- Suporte prioritário
- Chat em tempo real
- Consultoria

## 🎯 Conclusão

**Para começar**: Free Plan é **perfeito** e **gratuito**
**Para crescer**: Pro Plan custa apenas **R$ 23/mês**

O Free Plan já oferece tudo que você precisa para monitorar sua aplicação de forma eficaz! 🚀 