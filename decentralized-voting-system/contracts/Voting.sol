pragma solidity 0.5.16;

contract Voting {
    struct Proposal {
        string name;
        uint voteCount;
    }

    address public owner;
    mapping(address => bool) public hasVoted;
    Proposal[] public proposals;
    uint public constant MAX_PROPOSALS = 10;

    event ProposalAdded(string proposalName);
    event Voted(address indexed voter, uint indexed proposalIndex);

    constructor() public {
        owner = msg.sender;
        // Initialize with some default proposals (optional)
        proposals.push(
            Proposal({
                name: "Proposal 1: Increase Funding for Public Education",
                voteCount: 0
            })
        );
        proposals.push(
            Proposal({
                name: "Proposal 2: Implement Universal Healthcare",
                voteCount: 0
            })
        );
        proposals.push(
            Proposal({
                name: "Proposal 3: Support Renewable Energy Initiatives",
                voteCount: 0
            })
        );
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can execute this.");
        _;
    }

    function proposeIdea(string calldata proposalName) external {
        require(
            proposals.length < MAX_PROPOSALS,
            "Maximum number of proposals reached."
        );
        proposals.push(Proposal({name: proposalName, voteCount: 0}));
        emit ProposalAdded(proposalName);
    }

    function vote(uint proposalIndex) public {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(proposalIndex < proposals.length, "Invalid proposal index.");

        proposals[proposalIndex].voteCount += 1;
        hasVoted[msg.sender] = true;

        emit Voted(msg.sender, proposalIndex);
    }

    function getProposal(
        uint proposalIndex
    ) public view returns (string memory name, uint voteCount) {
        Proposal storage proposal = proposals[proposalIndex];
        return (proposal.name, proposal.voteCount);
    }

    function getProposalsCount() public view returns (uint) {
        return proposals.length;
    }
}
