#!/bin/bash

# ==============================================================================
# Script d'installation et de lancement local pour l'application ASH
# ==============================================================================

# Arrête le script si une commande échoue
set -e

# --- Configuration ---
REPO_URL="https://github.com/ysalim152/typescript-ash.git"
PROJECT_DIR="typescript-ash"
CLIENT_DIR="client"
API_URL="http://localhost:3001" # URL par défaut de l'API backend

# --- Fonctions d'aide pour l'affichage ---
function print_info() {
  # Bleu pour les informations
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

function print_success() {
  # Vert pour les succès
  echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

function print_error() {
  # Rouge pour les erreurs
  echo -e "\033[1;31m[ERROR]\033[0m $1" >&2
  exit 1
}

# --- 1. Vérification des prérequis ---
print_info "Vérification des prérequis..."

command -v git >/dev/null 2>&1 || print_error "Git n'est pas installé. Veuillez l'installer pour continuer."
command -v node >/dev/null 2>&1 || print_error "Node.js n'est pas installé. Veuillez l'installer pour continuer."
command -v npm >/dev/null 2>&1 || print_error "npm n'est pas installé. Veuillez l'installer pour continuer."

print_success "Tous les prérequis sont satisfaits."
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

# Installation des dépendances si le dossier node_modules n'existe pas
if [ ! -d "node_modules" ]; then
  print_info "Installation des dépendances frontend (npm install)..."
  npm install
  print_success "Dépendances installées."
else
  print_info "Les dépendances sont déjà installées. Passage à l'étape suivante."
fi

# Création du fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
  print_info "Création du fichier d'environnement .env..."
  echo "VITE_API_BASE_URL=$API_URL" > .env
  print_success "Fichier .env créé avec l'URL de l'API : $API_URL"
else
  print_info "Le fichier .env existe déjà. Aucune modification apportée."
fi
echo ""

# --- 4. Lancement de l'application ---
print_success "Configuration terminée !"
print_info "Lancement du serveur de développement (npm run dev)..."
echo "L'application sera bientôt disponible sur http://localhost:5173"
echo "Appuyez sur CTRL+C pour arrêter le serveur."
echo ""

npm run dev
