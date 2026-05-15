#!/bin/bash

# ==================================================================================
# Script d'installation et de lancement pour l'application ASH sur Ubuntu 24.04
# ==================================================================================

# Arrête le script si une commande échoue
set -e

# --- Configuration ---
REPO_URL="https://github.com/ysalim152/typescript-ash.git"
PROJECT_DIR="typescript-ash"
CLIENT_DIR="client"
NODE_VERSION="18" # Version de Node.js requise par le projet
API_URL="http://localhost:3001" # URL par défaut de l'API backend

# --- Fonctions d'aide pour l'affichage ---
function print_info() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

function print_success() {
  echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

function print_error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1" >&2
  exit 1
}

# --- 1. Vérification et Installation des Prérequis ---
print_info "Vérification et installation des prérequis pour Ubuntu..."

# Met à jour les paquets
sudo apt-get update -y

# Installe Git s'il n'est pas présent
if ! command -v git &> /dev/null; then
  print_info "Git n'est pas installé. Installation en cours..."
  sudo apt-get install git -y
  print_success "Git a été installé."
else
  print_info "Git est déjà installé."
fi

# Installe NVM (Node Version Manager) et Node.js s'ils ne sont pas présents
# S'assure que NVM est chargé s'il est déjà installé
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  print_info "NVM est déjà installé."
else
  print_info "NVM n'est pas installé. Installation en cours..."
  # Utilise curl pour télécharger et exécuter le script d'installation de NVM
  sudo apt-get install curl -y
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  
  # Recharge la configuration du shell pour utiliser NVM immédiatement
  . "$NVM_DIR/nvm.sh"
  . "$NVM_DIR/bash_completion"
  
  print_success "NVM a été installé."
fi


# Installe et utilise la version de Node.js spécifiée
if ! nvm ls | grep -q "v${NODE_VERSION}"; then
    print_info "Installation de Node.js version ${NODE_VERSION}..."
    nvm install ${NODE_VERSION}
fi
nvm use ${NODE_VERSION}
print_success "Utilisation de Node.js $(node -v) et npm $(npm -v)."
echo ""

# --- 2. Clonage ou mise à jour du dépôt ---
if [ -d "$PROJECT_DIR" ]; then
  print_info "Le dossier du projet '$PROJECT_DIR' existe déjà."
  cd "$PROJECT_DIR"
  print_info "Mise à jour du dépôt avec les derniers changements..."
  git pull
else
  print_info "Clonage du dépôt depuis $REPO_URL..."
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi
print_success "Le dépôt est à jour."
echo ""

# --- 3. Configuration du frontend ---
print_info "Configuration de l'application frontend..."
cd "$CLIENT_DIR"

if [ ! -d "node_modules" ]; then
  print_info "Installation des dépendances frontend (npm install)..."
  npm install
  print_success "Dépendances installées."
else
  print_info "Les dépendances sont déjà installées."
fi

if [ ! -f ".env" ]; then
  print_info "Création du fichier d'environnement .env..."
  echo "VITE_API_BASE_URL=$API_URL" > .env
  print_success "Fichier .env créé avec l'URL de l'API : $API_URL"
else
  print_info "Le fichier .env existe déjà."
fi
echo ""

# --- 4. Lancement de l'application ---
print_success "Configuration terminée !"
print_info "Lancement du serveur de développement (npm run dev)..."
echo "Pour exposer le serveur sur le réseau, Vite pourrait nécessiter l'option --host."
echo "Lancement avec 'npm run dev -- --host'..."
echo "L'application sera accessible via l'adresse IP de votre serveur sur le port 5173."
echo "Appuyez sur CTRL+C pour arrêter le serveur."
echo ""

# L'option --host permet à Vite d'être accessible depuis l'extérieur du serveur
npm run dev -- --host