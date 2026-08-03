# ==========================================
# DOCKERFILE DEL FRONTEND (VITE + REACT)
# ==========================================

# 1. Usar imagen oficial de Node.js (versión Alpine por ser ultra ligera)
FROM node:20-alpine

# 2. Establecer el directorio de trabajo
WORKDIR /app

# 3. Copiar los archivos físicos requeridos (si existen) para instalar dependencias primero
# (Esto optimiza el caché de capas de Docker)
COPY package.json package-lock.json* ./

# 4. Instalar las dependencias de Node
RUN npm install

# 5. Copiar el resto del código
COPY . .

# 6. Exponer el puerto de Vite
EXPOSE 5173

# 7. Comando de ejecución
CMD ["npm", "run", "dev", "--", "--host"]
