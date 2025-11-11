// SPDX-License-Identifier: MIT
pragma solidity >= 0.4.22 < 0.9.0;

contract click_counter {
    address public slim_jim; //owner
    uint256 public count;

    constructor() {
      slim_jim = msg.sender;
    }
    modifier auth() {
      require(msg.sender == slim_jim, "Only Slim can use the counter!!");
      _;
    }

      // this is for security function for a specific wallet, going to need to use private key in contract
      // this will insure slim gym is always a specfic person. Perhaps we can also make sim jim particular 
      // where he only uses his own clicker which will need its own serial testnet.
    function increase_by_1() public auth {
        count += 1;
        
        
    }
    function decrease_by_1() public auth {
        require(count >0, "Count is too small, ooo Slim Jim does not like!!");
        count -=1;
        
        
    }
    



}