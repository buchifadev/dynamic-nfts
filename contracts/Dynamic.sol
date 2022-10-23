// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Dynamic is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIdGenerator;
    Counters.Counter public tokensUnsoldCount;
    Counters.Counter public tokensSoldCount;    

    struct Token {
        uint256 tokenId;        
        uint256 price;
        address payable owner;
        bool forSale;
    }

    mapping(uint256 => Token) public tokens;

    constructor() ERC721("Dynamic", "DYN") {}

    modifier onlyOwner(uint tokenId){
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _;
    }

    // Function to mint a new token
    function mintToken(
        string calldata tokenURI,        
        uint256 price
    ) public {
        require(price > 0, "token value too low");
        uint256 newId = tokenIdGenerator.current();
        tokenIdGenerator.increment();

        _safeMint(msg.sender, newId);
        _setTokenURI(newId, tokenURI);
    }

    // Function to send a token for sale to the market place
    function sellToken(
        uint256 tokenId,
        uint256 price
    ) public onlyOwner(tokenId){
        tokens[tokenId] = Token(
            tokenId,
            price,
            payable(msg.sender),
            true
        );
        tokensUnsoldCount.increment();
        _transfer(msg.sender, address(this), tokenId);
    }

    // Function to purchase a token
    function buyToken(uint256 tokenId) public payable {
        require(tokens[tokenId].forSale, "token Not For Sale");

        uint256 tokenCost = tokens[tokenId].price;
        require(
            msg.sender != tokens[tokenId].owner,
            "Owner cannot but thier own token"
        );
        require(
            msg.value >= tokenCost,
            "Invalid amount of funds sent"
        );

        address payable oldOwner = tokens[tokenId].owner;

        tokens[tokenId].forSale = false;
        tokens[tokenId].owner = payable(msg.sender);


        tokensSoldCount.increment();
        _transfer(address(this), msg.sender, tokenId);

        // transfer token cost to token seller
        oldOwner.transfer(tokenCost);
    }

    function cancelSale(uint tokenId) public onlyOwner(tokenId){
        tokens[tokenId].forSale = false;
        _transfer(address(this), msg.sender, tokenId);
    }

    // Function to return all tokens a user own
    function getMyTokens() public view returns (uint256[] memory) {
        uint256 counter;
        uint256 total = tokenIdGenerator.current();
        uint256[] memory myTokens = new uint256[](balanceOf(msg.sender));

        for (uint256 i = 0; i < total; i++) {
            if (ownerOf(i) == msg.sender) {
                myTokens[counter] = i;
                counter++;
            }
        }
        return myTokens;
    }

    // Function to check if a token still available for sale
    function tokenInMarket(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Invalid token ID");
        return !tokens[tokenId].forSale;
    }

    // Function to return all tokens available for purchase
    function getAllMarketTokens() public view returns (Token[] memory) {
        uint256 total = tokensUnsoldCount.current() - tokensSoldCount.current();
        uint256 counter = 0;

        Token[] memory allTokens = new Token[](total);
        for (uint256 i = 0; i < tokenIdGenerator.current(); ) {
            if (tokenInMarket(i)) {
                allTokens[counter] = tokens[i];
                counter++;
            }
            ++i;
        }
        return allTokens;
    }

    receive() external payable {}
}
