#!/bin/sh

# Kode escape ANSI untuk warna
YELLOW='\033[0;93m'  # Kuning pastel
ROSE='\033[0;95m'    # Rose pastel
GREEN='\033[0;92m'   # Hijau pastel
BLUE='\033[0;94m'    # Biru pastel
NC='\033[0m'         # No Color

# Menghasilkan tag berdasarkan tanggal (format: YYYYMMDD)
tag=$(date +'%Y%m%d')
appName="icc"
dockerUsername="halimkun"  # Ganti dengan username Docker Hub Anda
dockerRepository="$dockerUsername/$appName"

# Menampilkan pesan memulai build
echo "${YELLOW}[+] Starting Docker build for application: $appName${NC}"
echo "${YELLOW}[+] Generated tag: $tag${NC}"

# Membangun image dengan tag
echo "${BLUE}[+] Building Docker image...${NC}"
docker build -t $dockerRepository:$tag .

# Menangani kesalahan build
if [ $? -ne 0 ]; then
  echo "${ROSE}[-] Docker build failed. Exiting.${NC}"
  exit 1
fi

# Menandai image sebagai latest
echo "${BLUE}[+] Tagging Docker image as latest...${NC}"
docker tag $dockerRepository:$tag $dockerRepository:latest

# Menangani kesalahan tagging
if [ $? -ne 0 ]; then
  echo "${ROSE}[-] Tagging Docker image failed. Exiting.${NC}"
  exit 1
fi

# Menampilkan pesan sukses
echo "${GREEN}[+] Docker image built successfully.${NC}"

# Menjalankan docker compose
echo "${YELLOW}[+] Running Docker compose...${NC}"
docker compose up -d

# Menampilkan pesan sukses
echo "${GREEN}[+] Docker compose ran successfully.${NC}"