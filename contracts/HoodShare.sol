// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Builders DEX inspected share certificate — Robinhood Chain 4663
/// @notice Numbered ETH mint after off-chain Proof of Building™ review. Not equity.
contract HoodShare {
    string public constant name = "Aura Share";
    string public constant symbol = "AURASHARE";

    address public immutable founder;
    uint256 public immutable priceWei;
    uint256 public immutable maxSupply;
    uint256 public immutable maxPerWallet;

    string public baseURI;
    uint256 public totalSupply;
    bool public live;

    mapping(uint256 => address) private _owner;
    mapping(address => uint256) private _balance;
    mapping(address => mapping(address => bool)) private _operator;
    mapping(uint256 => address) private _tokenApproval;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    constructor(uint256 price, uint256 supply, uint256 perWallet, string memory uri) {
        require(price > 0 && supply > 0 && perWallet > 0, "args");
        founder = msg.sender;
        priceWei = price;
        maxSupply = supply;
        maxPerWallet = perWallet;
        baseURI = uri;
        live = true;
    }

    function mint() external payable {
        require(live, "closed");
        require(msg.value == priceWei, "price");
        require(totalSupply < maxSupply, "sold");
        require(_balance[msg.sender] < maxPerWallet, "cap");
        uint256 id = ++totalSupply;
        _owner[id] = msg.sender;
        unchecked {
            _balance[msg.sender] += 1;
        }
        emit Transfer(address(0), msg.sender, id);
    }

    function setLive(bool next) external {
        require(msg.sender == founder, "auth");
        live = next;
    }

    function setBaseURI(string calldata uri) external {
        require(msg.sender == founder, "auth");
        baseURI = uri;
    }

    function withdraw() external {
        require(msg.sender == founder, "auth");
        (bool ok, ) = payable(founder).call{value: address(this).balance}("");
        require(ok, "pay");
    }

    function ownerOf(uint256 id) public view returns (address o) {
        o = _owner[id];
        require(o != address(0), "gone");
    }

    function balanceOf(address who) external view returns (uint256) {
        require(who != address(0), "zero");
        return _balance[who];
    }

    function tokenURI(uint256 id) external view returns (string memory) {
        require(_owner[id] != address(0), "gone");
        return string(abi.encodePacked(baseURI, _toString(id)));
    }

    function approve(address spender, uint256 id) external {
        address o = ownerOf(id);
        require(msg.sender == o || _operator[o][msg.sender], "auth");
        _tokenApproval[id] = spender;
        emit Approval(o, spender, id);
    }

    function getApproved(uint256 id) external view returns (address) {
        require(_owner[id] != address(0), "gone");
        return _tokenApproval[id];
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operator[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return _operator[owner][operator];
    }

    function transferFrom(address from, address to, uint256 id) public {
        require(to != address(0), "zero");
        address o = ownerOf(id);
        require(o == from, "from");
        require(
            msg.sender == o || msg.sender == _tokenApproval[id] || _operator[o][msg.sender],
            "auth"
        );
        _tokenApproval[id] = address(0);
        unchecked {
            _balance[from] -= 1;
            _balance[to] += 1;
        }
        _owner[id] = to;
        emit Transfer(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id) external {
        transferFrom(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id, bytes calldata) external {
        transferFrom(from, to, id);
    }

    function supportsInterface(bytes4 id) external pure returns (bool) {
        return id == 0x01ffc9a7 || id == 0x80ac58cd || id == 0x5b5e139f;
    }

    function _toString(uint256 v) private pure returns (string memory) {
        if (v == 0) return "0";
        uint256 t = v;
        uint256 len;
        while (t != 0) {
            unchecked {
                len++;
                t /= 10;
            }
        }
        bytes memory buf = new bytes(len);
        while (v != 0) {
            unchecked {
                len--;
                buf[len] = bytes1(uint8(48 + (v % 10)));
                v /= 10;
            }
        }
        return string(buf);
    }
}
