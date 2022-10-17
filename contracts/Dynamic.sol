// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dynamic is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIdGenerator;
    Counters.Counter public tokensUnsoldCount;
    Counters.Counter public tokensSoldCount;    

    struct Token {
        uint256 tokenId;        
        uint256 price;
        address payable owner;
        address payable seller;
        bool sold;
    }

    mapping(uint256 => Token) public tokens;

    constructor() ERC721("Dynamic", "DYN") {}

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

        sellToken(newId, price);
    }

    // Function to send a token for sale to the market place
    function sellToken(
        uint256 tokenId,
        uint256 price
    ) public {
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

    // Function to purchase a token
    function buyToken(uint256 tokenId) public payable {
        uint256 tokenCost = tokens[tokenId].price;
        require(
            msg.sender != tokens[tokenId].seller,
            "A seller cannot but thier own token"
        );
        require(
            msg.value >= tokenCost,
            "Invalid amount of funds sent"
        );

        address payable seller = tokens[tokenId].seller;
        tokens[tokenId].sold = true;
        tokens[tokenId].owner = payable(msg.sender);
        tokens[tokenId].seller = payable(address(0));

        tokensSoldCount.increment();
        _transfer(address(this), msg.sender, tokenId);

        // transfer token cost to token seller
        seller.transfer(tokenCost);
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
        return !tokens[tokenId].sold;
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
