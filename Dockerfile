# Dockerfile para a aplicação NestJS
FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production --legacy-peer-deps

# Copiar código fonte
COPY . .

# Compilar a aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando para executar a aplicação
CMD ["npm", "run", "start:prod"] 