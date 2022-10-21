// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dynamic is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIdGenerator;
    Counters.Counter public tokensUnsoldCount;  

    struct Token {
        uint256 tokenId;        
        uint256 price;
        address payable owner;
        address payable seller;
        bool sold;
    }

    mapping(uint256 => Token) public tokens;

    constructor() ERC721("Dynamic", "DYN") {}

    modifier exists(uint tokenId){
        require(_exists(tokenId), "Query of nonexistent NFT");
        _;
    }

    /// @dev Function to mint a new token
    /// @notice input data needs to contain only valid/nonempty values
    function mintToken(
        string calldata tokenURI,        
        uint256 price
    ) public {
        require(bytes(tokenURI).length > 8, "Empty token uri"); // token uris on the frontend starts with "https://"
        require(price > 0, "token value too low");
        uint256 newId = tokenIdGenerator.current();
        tokenIdGenerator.increment();
        _safeMint(msg.sender, newId);
        _setTokenURI(newId, tokenURI);

        sellToken(newId, price);
    }

    /// @dev Function to send a token for sale to the market place
    function sellToken(
        uint256 tokenId,
        uint256 price
    ) public exists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Only owner can sell token");
        tokens[tokenId] = Token(
            tokenId,
            price,
            payable(address(this)),
            payable(msg.sender),
            false
        );
        tokensUnsoldCount.increment();
        _transfer(msg.sender, address(this), tokenId);
    }

    /// @dev Function to purchase a token
    function buyToken(uint256 tokenId) public payable exists(tokenId) {
        
        Token storage currentToken = tokens[tokenId];
        
        require(!currentToken.sold, "NFT isn't for sale");
        require(
            msg.sender != currentToken.seller,
            "A seller cannot but thier own token"
        );
        require(
            msg.value == currentToken.price,
            "Invalid amount of funds sent"
        );

        address payable seller = currentToken.seller;
        currentToken.sold = true;
        currentToken.owner = payable(msg.sender);
        currentToken.seller = payable(address(0));

        tokensUnsoldCount.decrement();
        _transfer(address(this), msg.sender, tokenId);

        // transfer token cost to token seller
        (bool success,) = seller.call{value: msg.value}("");
        require(success,"Transfer failed");
    }

    /// @dev Function to return all tokens a user own
    function getMyTokens() public view returns (uint256[] memory) {
        uint256 counter;
        uint256 total = tokenIdGenerator.current();
        uint256[] memory myTokens = new uint256[](balanceOf(msg.sender));

        for (uint256 i = 0; i < total; i++) {
            if(counter == balanceOf(msg.sender))break;
            if (ownerOf(i) == msg.sender) {
                myTokens[counter] = i;
                counter++;
            }
        }
        return myTokens;
    }

    /// @dev Function to return all tokens available for purchase
    function getAllMarketTokens() public view returns (Token[] memory) {
        uint256 total = tokensUnsoldCount.current();
        uint numberOfTokens = tokenIdGenerator.current();
        uint256 counter = 0;

        Token[] memory allTokens = new Token[](total);
        for (uint256 i = 0; i < numberOfTokens; ) {
            if(counter == total) break;
            if (!tokens[i].sold) {
                allTokens[counter] = tokens[i];
                counter++;
            }
            unchecked {
                ++i;
            }
        }
        return allTokens;
    }

    receive() external payable {}
}
