// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "hardhat/console.sol";
// import "./Token.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";        // ✅ 6th HW instruction

contract DAO {
    address owner;          //address type
    // Token public token;     //SC Token type      // ❌ removed because of 6th HW instruction         // ❌ single source of truth  
    IERC20  public immutable token;             // 🟢 the ERC-20 the DAO will hold  // ✅ 6th HW instruction    // ✅ single source of truth
    uint256 public quorum;  //uint256 type

    struct Proposal {               // --- can put mapping in struct
        uint256 id;
        string name;
        uint256 amount;
        address payable recipient;
        // uint256 votes;
        uint256 upvotes;    // ✅ upvotes
        uint256 downvotes;  // ✅ downvotes
        bool finalized;
        string description;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    // mapping(address => mapping(uint256 => bool)) votes;
    mapping(address => mapping(uint256 => bool)) public hasVoted;   // ✅ KEPT: Vote tracking to prevent double-voting

     // ✅ UPDATED: Added support flag to event
    event Propose(
        uint id,
        uint256 amount,
        address recipient,
        address creator,
        string description
    );
    event Vote(uint256 id, address investor, bool support); // ✅ updated
    event Finalize(uint256 id);

    constructor(IERC20 _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
    }

    // Allow SC to receive ether
    receive() external payable {}

    modifier onlyInvestor() {
        require(
            token.balanceOf(msg.sender) > 0,
            "must be token holder"
        );
        _;
    }

    function createProposal(
        string memory _name,
        uint256 _amount,
        address payable _recipient,
        string memory _description
    ) external onlyInvestor {
        // require(address(this).balance >= _amount);                    // ❌ removed because of 6th HW instruction
        require(token.balanceOf(address(this)) >= _amount);              // ✅ check DAO token treasury

        proposalCount++;

        // Create a proposal

        proposals[proposalCount] = Proposal(
            proposalCount,
            _name,
            _amount,
            _recipient,
            0,  // ✅ upvotes - this didnt change.. there was only one zero
            0,  // ✅ downvotes
            false,
            _description
        );

        emit Propose(
            proposalCount,
            _amount,
            _recipient,
            msg.sender,
            _description
        );
    }


    // ✅ UPDATED: Vote can now be for or against
    function vote(uint256 _id, bool support) external onlyInvestor {
        // Fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];

        // Don't let investors vote twice
        require(!hasVoted[msg.sender][_id], "already voted");

        // update votes
        // proposal.votes += token.balanceOf(msg.sender);
        uint256 votingPower = token.balanceOf(msg.sender);

        if (support) {
            proposal.upvotes += votingPower;    // ✅ vote FOR
        } else {
            proposal.downvotes += votingPower;  // ✅ vote AGAINST
        }

        hasVoted[msg.sender][_id] = true;

        // Track that user has voted
        // votes[msg.sender][_id] = true;

        // Emit an event
        emit Vote(_id, msg.sender, support); // ✅ include direction
    }

    // ✅ CHANGED: Only `upvotes` are counted toward quorum
    function finalizeProposal(uint256 _id) external onlyInvestor {
        // Fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];

        // Ensure proposal is not already finalized
        require(proposal.finalized == false, "proposal already finalized");

        // Mark proposal as finalized
        proposal.finalized = true;

        // Check that proposal has enough votes
        // require(proposal.votes >= quorum, "must reach quorum to finalize proposal");
         // ✅ CHANGED: Only upvotes count toward quorum
        require(proposal.upvotes >= quorum, "must reach quorum of upvotes to finalize proposal"); // --- % upvotes > downvotes% to meet the quorum 50%


        // Check that SC has enough Ether
        // require(address(this).balance >= proposal.amount);           // ❌ removed because of 6th HW instruction
        require(token.balanceOf(address(this)) >= proposal.amount, "DAO lacks tokens"); // ✅ token check


        // Transfer the funds to recipient
        // proposal.recipient.transfer(proposal.amount);    
        // (bool sent, ) = proposal.recipient.call{value: proposal.amount}("");                // ❌ removed because of 6th HW instruction     // ETH transfer
        // require(sent);                                                                      // ❌ removed because of 6th HW instruction
        token.transfer(proposal.recipient, proposal.amount);                            // ✅ token payout ✅ 6th HW instruction

        // Emit event
        emit Finalize(_id);
    }
    
}
