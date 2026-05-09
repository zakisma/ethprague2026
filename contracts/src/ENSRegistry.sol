pragma solidity ^0.8.20;

/// @title Mock ENS Registry for Arbitrum L2
/// @notice Issues subdomains like "project.prooffund.eth" to approved devs
contract ENSRegistry {
    address public immutable platform;
    
    // Mapping from project name to developer address
    mapping(string => address) public subdomains;

    event SubdomainMinted(string subdomain, address indexed owner);

    constructor() {
        platform = msg.sender;
    }

    /// @notice Mint a subdomain (e.g., "uniswap" -> "uniswap.prooffund.eth")
    function mintSubdomain(string calldata projectName, address developer) external {
        require(msg.sender == platform, "Only Platform (AI) can mint ENS");
        require(subdomains[projectName] == address(0), "Name already taken");
        
        subdomains[projectName] = developer;
        
        string memory fullDomain = string(abi.encodePacked(projectName, ".prooffund.eth"));
        emit SubdomainMinted(fullDomain, developer);
    }
    
    function resolveName(string calldata projectName) external view returns (address) {
        return subdomains[projectName];
    }
}
