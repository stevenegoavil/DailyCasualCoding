// SPDX-License-Identifier: UNLICENSED
pragma solidity >= 0.4.22 < 0.9.0;

contract c_garden {
    
    //establish ownership of the contract with modifier to address contract rules
    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    //Garden slot limits then struct rules of the plot, assigned to the plots in mapping
    uint8 public constant max_slots = 11;
    struct Plot {
        address primary;
        address friend;
    }
    mapping(uint8 => Plot) public plots;

    //Fee and gate access/ how many people allowed per plot
    uint256 public monthlyFee;
    mapping(address => uint256) public paidUntil;
    uint8 public constant keys_per_memeber = 2;

    //events
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event MonthPaid(address indexed account, uint256 newPaidUntil);
    event Withdrawn(address indexed to, uint256 amount);

    //event MonthlyFeeChanged(uint256 oldFee, uint256 newFee); ommitted for now, there is no function yet

    event PlotAssigned(uint8 indexed slot, address indexed primary);
    event PlotRevoked(uint8 indexed slot, address indexed previousPrimary);
    event FriendAdded(uint8 indexed slot, address indexed friend);
    event FriendRemoved(uint8 indexed slot, address indexed previousFriend);

    //Constructor

    constructor(
        uint8[] memory _initialSlots,
        address[] memory _primaries,
        address[] memory _friends,
        uint256 _monthlyFee
    ) {
        require(
            _initialSlots.length == _primaries.length &&
                _primaries.length == _friends.length,
            "array length mismatch"
        );
        owner = msg.sender;
        monthlyFee = _monthlyFee;

        for (uint256 i =0; i < _initialSlots.length; i++){
            uint8 s = _initialSlots[i];
            _requireValidSlot(s);
            require(plots[s].primary == address(0), "slot already used");
            plots[s].primary = _primaries[i];
            plots[s].friend = _friends[i];
            emit PlotAssigned(s, _primaries[i]);
            if (_friends[i] != address(0)) emit FriendAdded(s, _friends[i]);
        }
    }

    //Views

    function hasGateAccess(address user) public view returns (bool) {
        return paidUntil[user] >= block.timestamp;
    }

    function getKeyCount(address user) external view returns (uint8) {
        require(hasGateAccess(user), "no active access");
        return keys_per_memeber;
    }

    // Administration actions (auth)

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
    function assignPlot(uint8 slot, address newPrimary) external onlyOwner {
        _requireValidSlot(slot);
        require(newPrimary != address(0), "zero primary");
        require(plots[slot].primary == address(0), "slot occupied");
        plots[slot].primary = newPrimary;
        emit PlotAssigned(slot, newPrimary);
    }
    function revokePlot(uint8 slot) external onlyOwner {
        _requireValidSlot(slot);
        address prev = plots[slot].primary;
        require(prev != address(0), "slot empty");
        if (plots[slot].friend != address(0)) {
            emit FriendRemoved(slot, plots[slot].friend);
        }
        plots[slot] = Plot({primary: address(0), friend: address(0)});
        emit PlotRevoked(slot, prev);
    }
    // Members Actions (by slot primary only!)
    function addFriend(uint8 slot, address friendAddr) external {
        _requireValidSlot(slot);
        require(plots[slot].primary == msg.sender, "not plot owner");
        require(friendAddr != address(0), "zero friend");
        require(plots[slot].friend == address(0), "friend exists");
        plots[slot].friend = friendAddr;
        emit FriendAdded(slot, friendAddr);
    }
    function removeFriend(uint8 slot) external {
        _requireValidSlot(slot);
        require(plots[slot].primary == msg.sender, "not plot owner");
        address prev = plots[slot].friend;
        require(prev != address(0), "no friend");
        plots[slot].friend = address(0);
        emit FriendRemoved(slot, prev);
    }
    //payments
    function payForMonth() external payable {
        require(monthlyFee > 0, "fee unset");
        require(msg.value == monthlyFee, "wrong amount");
        uint256 start = paidUntil[msg.sender] > block.timestamp
            ? paidUntil[msg.sender]
            : block.timestamp;
        paidUntil[msg.sender] = start + 30 days;
        emit MonthPaid(msg.sender, paidUntil[msg.sender]);
    }
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero to");
        require(amount <= address(this).balance, "insufficient balance");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "withdraw failed");
        emit Withdrawn(to, amount);
    }
    //internals
    function _requireValidSlot(uint8 s) internal pure {
        require(s >= 1 && s <= max_slots, "bad slot");
    }

    receive() external payable {
        revert("send via payForMonth");
    }

}
