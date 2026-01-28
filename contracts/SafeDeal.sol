// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SafeDeal is ERC721URIStorage, Ownable {

    // --- 1. Structures de Données ---
    enum State { AVAILABLE, LOCKED, RELEASED }

    struct Item {
        uint256 id;
        string name;            
        string itemType;        
        uint256 value;          
        State state;
        address payable seller;
        address payable buyer;
        string ipfsHash;
        uint256 lockedUntil;  
        
        address[] previousOwners; 
        uint256 createdAt;
        uint256 lastTransferAt;
    }

    uint256 public itemCount; 

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public cooldowns; 

    // --- Constantes (Règles Métier) ---
    uint256 public constant MAX_PER_USER = 4;
    

    uint256 public constant COOLDOWN_TIME = 5 minutes; 
    

    uint256 public constant LOCK_TIME = 10; 

    event ItemCreated(uint256 indexed tokenId, uint256 price);
    event ItemBought(uint256 indexed tokenId, address buyer);
    event ItemReleased(uint256 indexed tokenId, address newOwner);

    constructor() ERC721("SafeDeal", "SAFE") Ownable(msg.sender) {}

    // --- 2. Créer une annonce ---
    function createItem(
        string memory _name, 
        string memory _type, 
        uint256 _price, 
        string memory _ipfsHash
    ) public returns (uint256) {
        // 1. Vérification de la limite de possession (Exigence PDF)
        require(balanceOf(msg.sender) < MAX_PER_USER, "Limite atteinte (Max 4 items)");
        
        // 2. Vérification du Cooldown (Exigence PDF)
        require(block.timestamp >= cooldowns[msg.sender] + COOLDOWN_TIME, "Cooldown actif: Veuillez patienter");

        uint256 newItemId = itemCount; 

        items[newItemId] = Item({
            id: newItemId,
            name: _name,
            itemType: _type,
            value: _price,
            state: State.AVAILABLE,
            seller: payable(msg.sender),
            buyer: payable(address(0)),
            ipfsHash: _ipfsHash,
            lockedUntil: 0,

            previousOwners: new address[](0),
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp
        });

        // 3. Mise à jour du Cooldown (IMPORTANT: Décommenté)
        cooldowns[msg.sender] = block.timestamp; 
        
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _ipfsHash);

        itemCount++; 
        emit ItemCreated(newItemId, _price);
        
        return newItemId;
    }

    // --- 3. Acheter (Séquestre) ---
    function purchaseItem(uint256 _itemId) external payable {
        Item storage item = items[_itemId];

        require(_itemId < itemCount, "L'article n'existe pas");
        require(item.state == State.AVAILABLE, "Pas disponible");
        require(msg.value == item.value, "Montant incorrect (Envoyez le prix exact)");
        require(msg.sender != item.seller, "Vendeur ne peut pas acheter");

        item.buyer = payable(msg.sender);
        item.state = State.LOCKED;
        item.lockedUntil = block.timestamp + LOCK_TIME; 

        cooldowns[msg.sender] = block.timestamp;

        emit ItemBought(_itemId, msg.sender);
    }

    // --- 4. Valider Réception (Tiers de confiance) ---
    function confirmReceipt(uint256 _itemId) external {
        Item storage item = items[_itemId];

        require(_itemId < itemCount, "L'article n'existe pas");
        require(msg.sender == item.buyer, "Seul l'acheteur peut valider");
        require(item.state == State.LOCKED, "L'article n'est pas en attente de validation");
        require(block.timestamp >= item.lockedUntil, "Periode de blocage non terminee");

        // 1. Paiement du vendeur
        item.seller.transfer(item.value);

        // 2. Transfert NFT (Propriété)
        _transfer(item.seller, item.buyer, _itemId);

        // 3. Gestion de l'historique (Exigence PDF)
        // On accède explicitement au membre storage
        item.previousOwners.push(item.seller); 
        
        item.lastTransferAt = block.timestamp; // Mise à jour date transfert

        // 4. Mise à jour État -> RELEASED
        item.state = State.RELEASED;
        
        // 5. Swap des rôles
        address oldSeller = item.seller;
        item.seller = payable(item.buyer); 
        item.buyer = payable(address(0));

        emit ItemReleased(_itemId, oldSeller);
    }
}