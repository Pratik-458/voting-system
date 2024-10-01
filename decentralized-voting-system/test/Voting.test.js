const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
  let votingInstance;

  before(async () => {
    votingInstance = await Voting.deployed();
  });

  // Test 1: Initial state of proposals
  it("should initialize with three default proposals", async () => {
    const proposalCount = await votingInstance.getProposalsCount();
    assert.equal(
      proposalCount.toNumber(),
      3,
      "Initial proposals count should be 3"
    );

    const proposal1 = await votingInstance.getProposal(0);
    assert.equal(
      proposal1.name,
      "Proposal 1: Increase Funding for Public Education",
      "Proposal 1 name mismatch"
    );

    const proposal2 = await votingInstance.getProposal(1);
    assert.equal(
      proposal2.name,
      "Proposal 2: Implement Universal Healthcare",
      "Proposal 2 name mismatch"
    );

    const proposal3 = await votingInstance.getProposal(2);
    assert.equal(
      proposal3.name,
      "Proposal 3: Support Renewable Energy Initiatives",
      "Proposal 3 name mismatch"
    );
  });

  // Test 2: Proposing a new idea
  it("should allow users to propose a new idea", async () => {
    await votingInstance.proposeIdea("Proposal 4: Free College Tuition", {
      from: accounts[1],
    });

    const proposalCount = await votingInstance.getProposalsCount();
    assert.equal(
      proposalCount.toNumber(),
      4,
      "Proposal count should be 4 after proposing a new idea"
    );

    const newProposal = await votingInstance.getProposal(3);
    assert.equal(
      newProposal.name,
      "Proposal 4: Free College Tuition",
      "New proposal name mismatch"
    );
  });

  // Test 3: Voting on a proposal
  it("should allow voting on a proposal", async () => {
    await votingInstance.vote(0, { from: accounts[2] });

    const proposal = await votingInstance.getProposal(0);
    assert.equal(
      proposal.voteCount.toNumber(),
      1,
      "Proposal 1 vote count should be 1 after voting"
    );
  });

  // Test 4: Preventing double voting
  it("should prevent users from voting more than once", async () => {
    try {
      await votingInstance.vote(0, { from: accounts[2] }); // Same account tries to vote again
      assert.fail(
        "The same account was able to vote twice, but it shouldn't be allowed"
      );
    } catch (error) {
      assert.include(
        error.message,
        "You have already voted",
        "Expected 'You have already voted' error"
      );
    }

    const proposal = await votingInstance.getProposal(0);
    assert.equal(
      proposal.voteCount.toNumber(),
      1,
      "Proposal 1 vote count should still be 1 after attempted double voting"
    );
  });
});
