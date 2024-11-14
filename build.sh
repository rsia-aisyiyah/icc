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

# Meminta konfirmasi untuk melakukan push ke Docker Hub
echo "${YELLOW}[?] Do you want to push the Docker image to Docker Hub? (yes/no) ${NC}\c"
read confirmPush

# Menggunakan kondisional untuk memproses pilihan pengguna
if [ "$confirmPush" = "yes" ] || [ "$confirmPush" = "y" ]; then
  # Mengunggah image ke Docker Hub
  echo "${YELLOW}[+] Pushing Docker image to Docker Hub...${NC}"
  docker push $dockerRepository:$tag
  docker push $dockerRepository:latest

  # Menampilkan pesan sukses
  echo "${GREEN}[+] Docker image pushed to Docker Hub successfully.${NC}"
  echo "${GREEN}[+] Docker image pushed with tag: $tag${NC}"
  echo "${GREEN}[+] Docker image also pushed as: latest${NC}"
else
  echo "${YELLOW}[+] Push to Docker Hub aborted by user.${NC}"
fi

# Instruksi untuk menjalankan docker compose
echo "${YELLOW}[+] To start the application, run the following command:${NC}"
echo "${GREEN}[+] For local environment: docker-compose --env-file .env.local up -d${NC}"
echo "${GREEN}[+] For production environment: docker-compose --env-file .env.public up -d${NC}"