# Gestionnaire d'Association Sportive - ASH

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/tanstack--query-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)

Application web complète pour la gestion des membres, des activités et des sessions de l'Association Sportive Houra (ASH). Ce projet fournit une interface administrateur robuste et une expérience utilisateur fluide pour les membres.

## 🚀 Fonctionnalités Clés

### Pour les Visiteurs

- **Pages Publiques :** Consultation des pages d'accueil, "À propos", et de la liste des activités.
- **Inscription et Connexion :** Création de compte et authentification des utilisateurs.

### Pour les Membres Authentifiés

- **Tableau de Bord Personnel :** Accès à un espace personnel.
- **Gestion des Inscriptions :**
  - Inscription aux sessions disponibles.
  - Consultation et désinscription de ses propres sessions (`Mon Planning`).
- **Expérience Mobile :** Fonctionnalité "Tirer pour rafraîchir" sur les listes pour une mise à jour facile.

### Pour les Administrateurs

- **Gestion Complète des Membres (CRUD) :**
  - Liste des membres avec **pagination**, **recherche** et **tri**.
  - **Modification des rôles** (membre, coach, admin) directement depuis la liste.
  - **Suppression** de membres avec dialogue de confirmation.
  - **Exportation** de la liste complète des membres au format **CSV**.
- **Gestion Complète des Activités (CRUD) :**
  - Création, lecture, mise à jour et suppression des activités sportives.
- **Gestion des Sessions :**
  - Création de nouvelles sessions d'entraînement liées aux activités.
- **Journal d'Audit :**
  - Suivi et consultation de toutes les actions administratives (créations, modifications, suppressions) pour une traçabilité complète.

## 🛠️ Pile Technologique

### Frontend

- **Framework :** React
- **Langage :** TypeScript
- **Gestion de Données Asynchrones :** TanStack Query (React Query) pour la mise en cache, les mises à jour optimistes et la synchronisation des données.
- **Routage :** React Router
- **Styling :** Tailwind CSS
- **Composants UI :** Basé sur shadcn/ui
- **Notifications :** React Hot Toast
- **Export CSV :** PapaParse
- **Expérience Mobile :** React Pull to Refresh

### Backend (Architecture Implicite)

- API RESTful avec authentification par token.
- Base de données relationnelle (par exemple, PostgreSQL, MySQL).
- Système de rôles (RBAC) pour la gestion des autorisations.

## ⚙️ Installation et Lancement

Pour lancer le projet en local, suivez ces étapes.

### Prérequis

- Node.js (version 18.x ou supérieure)
- npm ou yarn

### 1. Cloner le Dépôt

```bash
git clone https://github.com/Salim-Younsi/typescript-ash.git
cd typescript-ash
```

### 2. Installer les Dépendances

Naviguez dans le dossier du client et installez les paquets nécessaires.

```bash
cd client
npm install
```

### 3. Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du dossier `client` en vous basant sur le fichier `.env.example` (s'il existe).

```
VITE_API_BASE_URL=http://localhost:3001
```

Assurez-vous que l'URL de l'API correspond à celle de votre serveur backend.

### 4. Lancer le Serveur de Développement

```bash
npm run dev
```

L'application devrait maintenant être accessible à l'adresse `http://localhost:5173` (ou un autre port si celui-ci est occupé).

## 📁 Structure du Projet

```
client/
├── public/
└── src/
    ├── api/           # Services pour les appels API (logique extraite)
    ├── components/    # Composants React réutilisables (UI)
    ├── hooks/         # Hooks personnalisés (ex: useAuth)
    ├── pages/         # Composants de page principaux et vues
    │   ├── dashboard/ # Pages du tableau de bord admin/membre
    │   └── ...
    ├── types/         # Interfaces et types TypeScript partagés
    ├── App.tsx        # Configuration du routage principal
    └── main.tsx       # Point d'entrée de l'application React
```

---

*Ce README a été généré et structuré par Gemini Code Assist.*