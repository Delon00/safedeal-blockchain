# 🛡️ SafeDeal - Place de Marché Décentralisée (DApp)


![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636.svg)
![Hardhat](https://img.shields.io/badge/Hardhat-v3_Beta-yellow.svg)

> **Projet 5BLOC** : Développement d'une DApp de séquestre (Escrow) sur Ethereum.

## 📖 À propos

**SafeDeal** est une application décentralisée (DApp) qui sécurise les échanges d'objets de seconde main entre particuliers. Elle remplace les tiers de confiance traditionnels par un Smart Contract autonome qui séquestre les fonds jusqu'à la validation de la réception.

[cite_start]Ce projet a été réalisé dans le cadre de l'examen 5BLOC [cite: 2, 3] et respecte l'intégralité du cahier des charges technique.

## ✨ Fonctionnalités & Règles Métiers

Le contrat intelligent intègre les contraintes suivantes pour garantir la sécurité et l'équité :

* [cite_start]**📦 Tokenisation** : Chaque objet est un NFT (ERC721) unique lié à des métadonnées IPFS[cite: 18, 29].
* [cite_start]**⛔ Limite de Possession** : Un utilisateur ne peut pas détenir plus de **4 annonces** actives simultanément[cite: 24].
* [cite_start]**⏳ Anti-Spam (Cooldown)** : Un délai de **5 minutes** est imposé entre deux actions critiques pour éviter les abus[cite: 26].
* **🔒 Séquestre (Escrow)** : Les fonds sont bloqués lors de l'achat.
* [cite_start]**🛡️ Verrouillage (TimeLock)** : Une période de sûreté de **10 minutes** est imposée après l'achat avant de pouvoir valider la réception[cite: 27].

## 🛠️ Stack Technique

* **Blockchain** : Ethereum (EVM)
* **Langage** : Solidity `0.8.20`
* **Framework** : Hardhat 3 (Beta)
* **Tests** : Ethers.js v6 & Chai

## 🚀 Installation

### 1. Prérequis
* [Node.js](https://nodejs.org/) (v18+)
* [Git](https://git-scm.com/)

### 2. Cloner le projet
```bash
git clone <URL_DU_REPO>
cd SafeDeal
npm install
```
### 3.🧪 Tests Unitaires 
Ce projet contient une suite de tests complète validant tous les scénarios nominaux et les contraintes métiers (Happy Path & Fail Cases).

Pour lancer les tests :

```Bash
npx hardhat compile
```
```Bash
npx hardhat test
```
Note : Les tests utilisent ethers.js v6 et une configuration Hardhat standard sans Ignition pour assurer la compatibilité et la rapidité d'exécution.

### 4.📦 Déploiement
Le déploiement est géré via Hardhat Ignition.

Déploiement Local
Pour tester sur un nœud local éphémère :

```Bash
npx hardhat node
```
Cela va créer 20 faux comptes avec 10 000 ETH chacun
Ouvre un DEUXIÈME terminal et déploie ton contrat sur ce nœud local :

```Bash
npx hardhat ignition deploy ignition/modules/SafeDeal.ts --network localhost
```
Déploiement sur Sepolia (Testnet)
Configurez votre clé privée :

```Bash
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```
Déployez :

```Bash
npx hardhat ignition deploy --network sepolia ignition/modules/SafeDeal.js
```
### 5.📂 Structure du Projet
```Plaintext
SafeDeal/
├── contracts/
│   └── SafeDeal.sol       # Smart Contract (Logique Métier)
├── test/
│   └── SafeDeal.js        # Tests Unitaires
├── ignition/
│   └── modules/
│       └── SafeDeal.js    # Script de déploiement
├── hardhat.config.ts      # Configuration
└── README.md              # Documentation
```
### 👥 Auteurs
Jean-Philippe Delon