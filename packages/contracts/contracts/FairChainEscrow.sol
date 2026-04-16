// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FairChainEscrow
 * @dev Milestone-based escrow and product tracking/registration contract for FairChain.
 * It does not accept actual ERC20 tokens natively yet (we are using Razorpay off-chain bridging for MVP payment flows), 
 * but acts as an on-chain registry for contract creation, milestone release events, and product tracking.
 * It can be extended to hold ERC20 later if fully on-chain settlement is desired.
 */
contract FairChainEscrow {
    struct ProductContract {
        string contractId;
        string ipfsCid; // Meta-data of the contract & product info
        address creator;
        uint256 createdAt;
        bool isCompleted;
    }

    struct MilestoneEvent {
        string contractId;
        uint256 milestoneIndex;
        uint256 timestamp;
    }

    // Mapping from contractId to the on-chain contract details
    mapping(string => ProductContract) public productContracts;
    
    // Reverse mapping to keep track of total contracts created (optional array for iterating later if needed)
    string[] public allContractIds;

    // Events
    event ContractRegistered(string indexed contractId, address indexed creator, string ipfsCid, uint256 timestamp);
    event MilestoneReleased(string indexed contractId, uint256 indexed milestoneIndex, uint256 timestamp);
    event EscrowSettled(string indexed contractId, uint256 timestamp);
    event EscrowRefunded(string indexed contractId, uint256 timestamp);

    /**
     * @dev Register a new product contract on the blockchain
     */
    function registerContract(string memory _contractId, string memory _ipfsCid) external {
        require(productContracts[_contractId].creator == address(0), "Contract ID already exists");
        
        productContracts[_contractId] = ProductContract({
            contractId: _contractId,
            ipfsCid: _ipfsCid,
            creator: msg.sender,
            createdAt: block.timestamp,
            isCompleted: false
        });

        allContractIds.push(_contractId);

        emit ContractRegistered(_contractId, msg.sender, _ipfsCid, block.timestamp);
    }

    /**
     * @dev Release a specific milestone
     */
    function releaseMilestone(string memory _contractId, uint256 _milestoneIndex) external {
        require(productContracts[_contractId].creator != address(0), "Contract does not exist");
        require(productContracts[_contractId].isCompleted == false, "Contract already completed");
        
        emit MilestoneReleased(_contractId, _milestoneIndex, block.timestamp);
    }

    /**
     * @dev Release all remaining milestones and complete the escrow
     */
    function releaseAll(string memory _contractId) external {
        require(productContracts[_contractId].creator != address(0), "Contract does not exist");
        require(productContracts[_contractId].isCompleted == false, "Contract already completed");
        
        productContracts[_contractId].isCompleted = true;

        emit EscrowSettled(_contractId, block.timestamp);
    }

    /**
     * @dev Process a refund (if disputed or canceled before completion)
     */
    function refund(string memory _contractId) external {
        require(productContracts[_contractId].creator != address(0), "Contract does not exist");
        require(productContracts[_contractId].isCompleted == false, "Contract already completed");

        productContracts[_contractId].isCompleted = true; // Mark completed so it can't be released later

        emit EscrowRefunded(_contractId, block.timestamp);
    }

    /**
     * @dev Read all contract IDs
     */
    function getAllContractIds() external view returns (string[] memory) {
        return allContractIds;
    }
}
