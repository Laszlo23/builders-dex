// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal Square NFT surface (HoodStreet CCFF00). We do not wrap or upgrade it.
interface ISquares {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getTokenBoundAccount(uint256 tokenId) external view returns (address);
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title ActivationRegistry — overlay for CCFF00 Squares on Robinhood Chain 4663
/// @notice Reads ownerOf / TBA. Never transfers the NFT. Activate then park.
contract ActivationRegistry {
    ISquares public immutable squares;
    address public founder;
    uint256 public constant UNPARK_COOLDOWN = 7 days;
    uint256 public constant MAX_PER_WALLET = 3;

    struct Record {
        address owner;
        address tba;
        uint64 activatedAt;
        uint64 parkedAt;
        uint64 unparkUnlockAt;
    }

    mapping(uint256 => Record) public records;
    mapping(address => uint256) public parkedCount;
    uint256 public parkedSupply;

    event Activated(uint256 indexed tokenId, address indexed owner, address tba, uint64 at);
    event Parked(uint256 indexed tokenId, address indexed owner, uint64 at);
    event UnparkRequested(uint256 indexed tokenId, uint64 unlockAt);
    event Unparked(uint256 indexed tokenId, address indexed owner);

    constructor(address squareNft) {
        require(squareNft != address(0), "nft");
        squares = ISquares(squareNft);
        founder = msg.sender;
    }

    function setFounder(address next) external {
        require(msg.sender == founder, "auth");
        require(next != address(0), "zero");
        founder = next;
    }

    function tbaOf(uint256 tokenId) public view returns (address) {
        address stored = records[tokenId].tba;
        if (stored != address(0)) return stored;
        return squares.getTokenBoundAccount(tokenId);
    }

    function isParked(uint256 tokenId, address who) public view returns (bool) {
        Record storage r = records[tokenId];
        if (r.parkedAt == 0 || r.activatedAt == 0) return false;
        address live = squares.ownerOf(tokenId);
        return live == who && live == r.owner;
    }

    function isActivated(uint256 tokenId, address who) public view returns (bool) {
        Record storage r = records[tokenId];
        if (r.activatedAt == 0) return false;
        address live = squares.ownerOf(tokenId);
        return live == who && live == r.owner;
    }

    function activate(uint256 tokenId) external {
        _clearIfTransferred(tokenId);
        address owner = squares.ownerOf(tokenId);
        require(owner == msg.sender, "owner");
        Record storage r = records[tokenId];
        require(r.activatedAt == 0, "already");
        address tba = squares.getTokenBoundAccount(tokenId);
        require(tba != address(0), "tba");
        r.owner = owner;
        r.tba = tba;
        r.activatedAt = uint64(block.timestamp);
        r.parkedAt = 0;
        r.unparkUnlockAt = 0;
        emit Activated(tokenId, owner, tba, r.activatedAt);
    }

    function park(uint256 tokenId) external {
        _clearIfTransferred(tokenId);
        address owner = squares.ownerOf(tokenId);
        require(owner == msg.sender, "owner");
        Record storage r = records[tokenId];
        require(r.activatedAt != 0, "activate");
        require(r.parkedAt == 0, "parked");
        require(parkedCount[owner] < MAX_PER_WALLET, "cap");
        r.owner = owner;
        r.parkedAt = uint64(block.timestamp);
        r.unparkUnlockAt = 0;
        unchecked {
            parkedCount[owner] += 1;
            parkedSupply += 1;
        }
        emit Parked(tokenId, owner, r.parkedAt);
    }

    function requestUnpark(uint256 tokenId) external {
        _clearIfTransferred(tokenId);
        address owner = squares.ownerOf(tokenId);
        require(owner == msg.sender, "owner");
        Record storage r = records[tokenId];
        require(r.parkedAt != 0, "park");
        require(r.unparkUnlockAt == 0, "pending");
        r.unparkUnlockAt = uint64(block.timestamp + UNPARK_COOLDOWN);
        emit UnparkRequested(tokenId, r.unparkUnlockAt);
    }

    function unpark(uint256 tokenId) external {
        _clearIfTransferred(tokenId);
        address owner = squares.ownerOf(tokenId);
        require(owner == msg.sender, "owner");
        Record storage r = records[tokenId];
        require(r.parkedAt != 0, "park");
        require(r.unparkUnlockAt != 0 && block.timestamp >= r.unparkUnlockAt, "cool");
        _dropPark(r, owner);
        emit Unparked(tokenId, owner);
    }

    function _clearIfTransferred(uint256 tokenId) internal {
        Record storage r = records[tokenId];
        if (r.activatedAt == 0) return;
        address live = squares.ownerOf(tokenId);
        if (live == r.owner) return;
        if (r.parkedAt != 0) {
            _dropPark(r, r.owner);
        }
        r.owner = live;
        r.activatedAt = 0;
        r.tba = squares.getTokenBoundAccount(tokenId);
    }

    function _dropPark(Record storage r, address owner) internal {
        if (parkedCount[owner] > 0) {
            unchecked {
                parkedCount[owner] -= 1;
            }
        }
        if (parkedSupply > 0) {
            unchecked {
                parkedSupply -= 1;
            }
        }
        r.parkedAt = 0;
        r.unparkUnlockAt = 0;
    }
}

/// @title StallVault — parked Squares take a stall in an inspected catalog launch
/// @notice First stall is Aura Share (keccak256("p5")). No NFT wrap.
contract StallVault {
    ActivationRegistry public immutable registry;
    ISquares public immutable squares;
    address public founder;

    mapping(bytes32 => bool) public allowed;
    mapping(uint256 => bytes32) public stallOf;
    mapping(bytes32 => uint256) public stallCount;

    event StallAllowed(bytes32 indexed projectKey, bool open);
    event Stalled(uint256 indexed tokenId, bytes32 indexed projectKey, address owner);
    event StallExited(uint256 indexed tokenId, bytes32 indexed projectKey, address owner);

    constructor(address registryAddr) {
        require(registryAddr != address(0), "reg");
        registry = ActivationRegistry(registryAddr);
        squares = registry.squares();
        founder = msg.sender;
        bytes32 aura = keccak256("p5");
        allowed[aura] = true;
        emit StallAllowed(aura, true);
    }

    function setFounder(address next) external {
        require(msg.sender == founder, "auth");
        require(next != address(0), "zero");
        founder = next;
    }

    function setAllowed(bytes32 projectKey, bool open) external {
        require(msg.sender == founder, "auth");
        allowed[projectKey] = open;
        emit StallAllowed(projectKey, open);
    }

    function takeStall(uint256 tokenId, bytes32 projectKey) external {
        _clearIfUnparked(tokenId);
        require(registry.isParked(tokenId, msg.sender), "park");
        require(allowed[projectKey], "project");
        require(stallOf[tokenId] == bytes32(0), "stalled");
        stallOf[tokenId] = projectKey;
        unchecked {
            stallCount[projectKey] += 1;
        }
        emit Stalled(tokenId, projectKey, msg.sender);
    }

    function exitStall(uint256 tokenId) external {
        bytes32 key = stallOf[tokenId];
        require(key != bytes32(0), "none");
        address live = squares.ownerOf(tokenId);
        require(live == msg.sender, "owner");
        stallOf[tokenId] = bytes32(0);
        if (stallCount[key] > 0) {
            unchecked {
                stallCount[key] -= 1;
            }
        }
        emit StallExited(tokenId, key, live);
    }

    function _clearIfUnparked(uint256 tokenId) internal {
        bytes32 key = stallOf[tokenId];
        if (key == bytes32(0)) return;
        address live = squares.ownerOf(tokenId);
        if (registry.isParked(tokenId, live)) return;
        stallOf[tokenId] = bytes32(0);
        if (stallCount[key] > 0) {
            unchecked {
                stallCount[key] -= 1;
            }
        }
        emit StallExited(tokenId, key, live);
    }
}

/// @title FeeSplitter — fee dust to parked Square TBAs only
/// @notice No idle-token emissions. Boost is BUILD locked from the TBA after the token address is set.
contract FeeSplitter {
    ActivationRegistry public immutable registry;
    ISquares public immutable squares;
    address public founder;
    address public buildToken;

    uint256 public accRewardPerWeight;
    uint256 public totalWeight;
    mapping(uint256 => uint256) public weightOf;
    mapping(uint256 => uint256) public debt;
    mapping(uint256 => uint256) public pending;
    mapping(uint256 => uint256) public lockedBuild;
    mapping(uint256 => bool) public inPool;

    uint256 public constant UNIT = 1e18;

    event Notified(address indexed from, uint256 amount, uint256 acc);
    event Claimed(uint256 indexed tokenId, address tba, uint256 amount);
    event Locked(uint256 indexed tokenId, uint256 amount, address tba);
    event Unlocked(uint256 indexed tokenId, uint256 amount, address tba);
    event BuildTokenSet(address token);

    constructor(address registryAddr) {
        require(registryAddr != address(0), "reg");
        registry = ActivationRegistry(registryAddr);
        squares = registry.squares();
        founder = msg.sender;
    }

    function setFounder(address next) external {
        require(msg.sender == founder, "auth");
        require(next != address(0), "zero");
        founder = next;
    }

    function setBuildToken(address token) external {
        require(msg.sender == founder, "auth");
        require(buildToken == address(0), "set");
        require(token != address(0), "zero");
        buildToken = token;
        emit BuildTokenSet(token);
    }

    receive() external payable {
        notify();
    }

    function notify() public payable {
        require(msg.value > 0, "zero");
        require(totalWeight > 0, "none");
        accRewardPerWeight += (msg.value * UNIT) / totalWeight;
        emit Notified(msg.sender, msg.value, accRewardPerWeight);
    }

    function boostWeight(uint256 tokenId) public view returns (uint256) {
        uint256 extra = lockedBuild[tokenId];
        if (extra > UNIT) extra = UNIT;
        return UNIT + extra;
    }

    function earned(uint256 tokenId) external view returns (uint256) {
        uint256 w = weightOf[tokenId];
        if (w == 0) return pending[tokenId];
        return pending[tokenId] + (w * accRewardPerWeight) / UNIT - debt[tokenId];
    }

    function sync(uint256 tokenId) public {
        address live = squares.ownerOf(tokenId);
        bool parked = registry.isParked(tokenId, live);
        if (parked && !inPool[tokenId]) {
            uint256 w = boostWeight(tokenId);
            weightOf[tokenId] = w;
            totalWeight += w;
            inPool[tokenId] = true;
            debt[tokenId] = (w * accRewardPerWeight) / UNIT;
            return;
        }
        if (!parked && inPool[tokenId]) {
            _settle(tokenId);
            totalWeight -= weightOf[tokenId];
            weightOf[tokenId] = 0;
            inPool[tokenId] = false;
            debt[tokenId] = 0;
        }
    }

    function lock(uint256 tokenId, uint256 amount) external {
        require(buildToken != address(0), "token");
        require(amount > 0, "amt");
        address tba = registry.tbaOf(tokenId);
        require(msg.sender == tba, "tba");
        require(registry.isParked(tokenId, squares.ownerOf(tokenId)), "park");
        require(IERC20(buildToken).transferFrom(tba, address(this), amount), "xfer");
        sync(tokenId);
        lockedBuild[tokenId] += amount;
        if (inPool[tokenId]) _reweight(tokenId);
        emit Locked(tokenId, amount, tba);
    }

    function unlock(uint256 tokenId) external {
        require(buildToken != address(0), "token");
        address live = squares.ownerOf(tokenId);
        require(live == msg.sender, "owner");
        uint256 amount = lockedBuild[tokenId];
        require(amount > 0, "none");
        address tba = registry.tbaOf(tokenId);
        require(tba.code.length > 0, "tba");
        lockedBuild[tokenId] = 0;
        sync(tokenId);
        if (inPool[tokenId]) _reweight(tokenId);
        require(IERC20(buildToken).transfer(tba, amount), "xfer");
        emit Unlocked(tokenId, amount, tba);
    }

    function claim(uint256 tokenId) external {
        address live = squares.ownerOf(tokenId);
        require(live == msg.sender, "owner");
        sync(tokenId);
        _settle(tokenId);
        uint256 amt = pending[tokenId];
        require(amt > 0, "dust");
        pending[tokenId] = 0;
        address tba = registry.tbaOf(tokenId);
        require(tba.code.length > 0, "tba");
        (bool ok, ) = payable(tba).call{value: amt}("");
        require(ok, "pay");
        emit Claimed(tokenId, tba, amt);
    }

    function _settle(uint256 tokenId) internal {
        uint256 w = weightOf[tokenId];
        if (w == 0) return;
        pending[tokenId] += (w * accRewardPerWeight) / UNIT - debt[tokenId];
        debt[tokenId] = (w * accRewardPerWeight) / UNIT;
    }

    function _reweight(uint256 tokenId) internal {
        _settle(tokenId);
        uint256 oldW = weightOf[tokenId];
        uint256 newW = boostWeight(tokenId);
        if (newW >= oldW) totalWeight += newW - oldW;
        else totalWeight -= oldW - newW;
        weightOf[tokenId] = newW;
        debt[tokenId] = (newW * accRewardPerWeight) / UNIT;
    }
}
