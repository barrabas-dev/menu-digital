# ==========================================
# DOCKERFILE DEL BACKEND (DJANGO + DRF)
# ==========================================

# 1. Usar la imagen base oficial de Python (ligera)
FROM python:3.11-slim

# 2. Configurar variables de entorno de Python
# Evita que Python escriba archivos .pyc en el disco
ENV PYTHONDONTWRITEBYTECODE=1
# Evita que Python almacene en búfer la salida estándar y de error
ENV PYTHONUNBUFFERED=1

# 3. Directorio de trabajo dentro del contenedor
WORKDIR /app

# 4. Instalar dependencias del sistema requeridas para mysqlclient
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        build-essential \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 5. Copiar el archivo de requerimientos
COPY requirements.txt .

# 6. Instalar las dependencias de Python
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# 7. Copiar el resto del código del proyecto
COPY . .

# 8. Exponer el puerto por el que correrá Django
EXPOSE 8000
