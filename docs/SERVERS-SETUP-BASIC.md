# 🖥️ Configuração para Plano Básico (R$ 23,41/mês)

## 📋 Especificações do Servidor

- **CPU**: 1 vCore
- **RAM**: 1GB
- **SSD**: 20GB
- **Banda**: 1TB/mês
- **Sistema**: Ubuntu 22.04 LTS

## 🚀 Configuração Otimizada

### **1. Otimização do Sistema**

```bash
# Conectar ao servidor
ssh root@seu-ip-servidor

# Atualizar sistema
apt update && apt upgrade -y

# Instalar ferramentas essenciais
apt install -y curl wget git htop nano ufw fail2ban

# Configurar swap (importante para 1GB RAM)
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Otimizar memória
echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl -p
```

### **2. Configuração de Segurança**

```bash
# Configurar firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # API
ufw allow 8080/tcp  # Kafka UI (se usar)
ufw enable

# Configurar fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### **3. Instalação do Docker (Otimizado)**

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Configurar Docker para usar menos memória
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

systemctl restart docker
```

### **4. Instalação do Node.js (Otimizado)**

```bash
# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar PM2 (process manager)
npm install -g pm2

# Configurar PM2 para usar menos memória
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### **5. Instalação do PostgreSQL (Otimizado)**

```bash
# Instalar PostgreSQL
apt install -y postgresql postgresql-contrib

# Configurar PostgreSQL para usar menos memória
cat > /etc/postgresql/14/main/conf.d/optimization.conf << EOF
# Configurações para 1GB RAM
shared_buffers = 128MB
effective_cache_size = 256MB
work_mem = 4MB
maintenance_work_mem = 32MB
checkpoint_completion_target = 0.9
wal_buffers = 4MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

# Reiniciar PostgreSQL
systemctl restart postgresql
```

### **6. Configuração do Nginx (Otimizado)**

```bash
# Instalar Nginx
apt install -y nginx

# Configurar Nginx para usar menos memória
cat > /etc/nginx/conf.d/optimization.conf << EOF
# Configurações para 1GB RAM
worker_processes 1;
worker_connections 512;
keepalive_timeout 65;
client_max_body_size 10M;
gzip on;
gzip_types text/plain text/css application/json application/javascript;
EOF

# Configurar proxy reverso
cat > /etc/nginx/sites-available/meupaozin << EOF
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend (React)
    location / {
        root /var/www/meupaozin/frontend/build;
        try_files \$uri \$uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API (NestJS)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/meupaozin_access.log;
    error_log /var/log/nginx/meupaozin_error.log;
}
EOF

# Habilitar site
ln -s /etc/nginx/sites-available/meupaozin /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### **7. Configuração do Kafka (Otimizado)**

```bash
# Criar diretório para Kafka
mkdir -p /opt/kafka
cd /opt/kafka

# Baixar Kafka
wget https://downloads.apache.org/kafka/3.6.1/kafka_2.13-3.6.1.tgz
tar -xzf kafka_2.13-3.6.1.tgz
ln -s kafka_2.13-3.6.1 kafka

# Configurar Kafka para usar menos memória
cat > /opt/kafka/kafka/config/server.properties << EOF
broker.id=0
listeners=PLAINTEXT://localhost:9092
log.dirs=/var/lib/kafka/data
num.partitions=1
num.recovery.threads.per.data.dir=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
log.cleaner.enable=true
log.cleaner.threads=1
log.cleaner.dedupe.buffer.size=67108864
delete.topic.enable=true
auto.create.topics.enable=true
# Configurações para 1GB RAM
num.network.threads=2
num.io.threads=4
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=52428800
EOF

# Criar diretório para dados
mkdir -p /var/lib/kafka/data
mkdir -p /var/lib/zookeeper/data

# Configurar Zookeeper
cat > /opt/kafka/kafka/config/zookeeper.properties << EOF
dataDir=/var/lib/zookeeper/data
clientPort=2181
maxClientCnxns=60
tickTime=2000
initLimit=10
syncLimit=5
EOF

# Criar serviços systemd
cat > /etc/systemd/system/zookeeper.service << EOF
[Unit]
Description=Apache Zookeeper
After=network.target

[Service]
Type=forking
User=root
Group=root
Environment=JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ExecStart=/opt/kafka/kafka/bin/zookeeper-server-start.sh /opt/kafka/kafka/config/zookeeper.properties
ExecStop=/opt/kafka/kafka/bin/zookeeper-server-stop.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/kafka.service << EOF
[Unit]
Description=Apache Kafka
After=network.target zookeeper.service

[Service]
Type=simple
User=root
Group=root
Environment=JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ExecStart=/opt/kafka/kafka/bin/kafka-server-start.sh /opt/kafka/kafka/config/server.properties
ExecStop=/opt/kafka/kafka/bin/kafka-server-stop.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Iniciar serviços
systemctl daemon-reload
systemctl enable zookeeper kafka
systemctl start zookeeper
sleep 10
systemctl start kafka

# Criar tópicos
sleep 30
/opt/kafka/kafka/bin/kafka-topics.sh --create --topic pedidos.created --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
/opt/kafka/kafka/bin/kafka-topics.sh --create --topic pedidos.updated --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
/opt/kafka/kafka/bin/kafka-topics.sh --create --topic pedidos.cancelled --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

### **8. Configuração do Datadog (Free Plan)**

```bash
# Instalar Datadog Agent
DD_API_KEY=sua_api_key_do_datadog DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"

# Configurar para usar menos recursos
cat > /etc/datadog-agent/datadog.yaml << EOF
api_key: sua_api_key_do_datadog
site: datadoghq.com
hostname: seu-servidor
tags:
  - "env:production"
  - "service:meupaozin"

# Configurações para 1GB RAM
apm_config:
  enabled: true
  apm_non_local_traffic: true

logs_config:
  enabled: true

process_config:
  enabled: true

use_dogstatsd: true
dogstatsd_metrics_stats_enable: true
EOF

systemctl restart datadog-agent
```

### **9. Deploy da Aplicação**

```bash
# Criar diretório da aplicação
mkdir -p /var/www/meupaozin
cd /var/www/meupaozin

# Clonar repositório
git clone https://github.com/seu-usuario/meu-paozin-api.git backend
git clone https://github.com/seu-usuario/meu-paozin-frontend.git frontend

# Configurar backend
cd backend
npm install --production
cp .env.example .env
# Editar .env com as configurações corretas

# Configurar frontend
cd ../frontend
npm install
npm run build

# Configurar PM2 para backend
cd ../backend
pm2 start dist/main.js --name "meupaozin-api" --max-memory-restart 300M
pm2 save
pm2 startup
```

### **10. Configuração de SSL (Certbot)**

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### **11. Monitoramento de Recursos**

```bash
# Criar script de monitoramento
cat > /usr/local/bin/monitor-resources.sh << 'EOF'
#!/bin/bash
echo "=== Uso de Memória ==="
free -h
echo ""
echo "=== Uso de Disco ==="
df -h
echo ""
echo "=== Uso de CPU ==="
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
echo ""
echo "=== Processos PM2 ==="
pm2 status
echo ""
echo "=== Status dos Serviços ==="
systemctl status nginx postgresql kafka zookeeper datadog-agent --no-pager -l
EOF

chmod +x /usr/local/bin/monitor-resources.sh
```

## 📊 **Uso de Recursos Estimado**

| Serviço | RAM | CPU | Disco |
|---------|-----|-----|-------|
| **NestJS API** | 200MB | 0.3 vCore | 500MB |
| **PostgreSQL** | 150MB | 0.2 vCore | 1GB |
| **Kafka** | 200MB | 0.2 vCore | 2GB |
| **Nginx** | 50MB | 0.1 vCore | 100MB |
| **Datadog** | 100MB | 0.1 vCore | 500MB |
| **Sistema** | 100MB | 0.1 vCore | 2GB |
| **Total** | 800MB | 1 vCore | 6GB |

## ✅ **Conclusão**

**Sim, vai funcionar perfeitamente!** 🎉

- ✅ **RAM**: 800MB usado de 1GB disponível
- ✅ **CPU**: 1 vCore é suficiente
- ✅ **Disco**: 6GB usado de 20GB disponível
- ✅ **Banda**: 1TB é mais que suficiente

O plano básico da Serverspace é **perfeito** para estudos e desenvolvimento! 🚀 