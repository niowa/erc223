pragma solidity 0.4.24;

import "../Ownable.sol";


contract EtherStorage is Ownable {
  function withdrawEtherToUser(address _to, uint _amount) public;
}
