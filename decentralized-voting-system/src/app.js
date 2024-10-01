let web3;
let contract;
let account;

// Connect the user's wallet (MetaMask)
async function connectWallet() {
  if (window.ethereum) {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      account = (await web3.eth.getAccounts())[0];
      console.log("Connected account:", account);

      document.getElementById("voting-section").style.display = "block";
      await initContract();
      await loadProposals();
      await updateVoteTable(); // Update the table with current votes
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Error connecting to MetaMask. Please try again.");
    }
  } else {
    alert("MetaMask not detected! Please install MetaMask to use this Dapp.");
  }
}

// Initialize the smart contract using the ABI and deployed address
async function initContract() {
  try {
    const response = await fetch("/Voting.json");
    const contractData = await response.json();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = contractData.networks[networkId];

    if (!deployedNetwork) {
      throw new Error(`No deployed network found for network ID ${networkId}.`);
    }

    contract = new web3.eth.Contract(contractData.abi, deployedNetwork.address);
    console.log("Smart contract initialized:", contract);
  } catch (error) {
    console.error("Error initializing contract:", error);
    alert(
      "Error initializing the contract. Please make sure the contract is deployed and you're connected to the correct network."
    );
  }
}

// Load the proposals from the smart contract and display them
async function loadProposals() {
  try {
    const count = await contract.methods.getProposalsCount().call();
    let proposalsDiv = document.getElementById("proposals");
    proposalsDiv.innerHTML = ""; // Clear existing proposals

    for (let i = 0; i < count; i++) {
      const proposal = await contract.methods.getProposal(i).call();
      const button = document.createElement("button");
      button.innerText = `${proposal[0]} - Votes: ${proposal[1]}`;
      button.addEventListener("click", function () {
        vote(i);
      });
      proposalsDiv.appendChild(button);
      proposalsDiv.appendChild(document.createElement("br"));
    }

    await updateVoteTable(); // Update the table after loading proposals
  } catch (error) {
    console.error("Error loading proposals:", error);
  }
}

// Cast a vote for the selected proposal
async function vote(proposalIndex) {
  try {
    await contract.methods.vote(proposalIndex).send({ from: account });
    await loadProposals(); // Reload proposals to update vote counts
  } catch (error) {
    console.error("Error casting vote:", error);
  }
}

// Update the vote table with data from the smart contract
async function updateVoteTable() {
  try {
    const count = await contract.methods.getProposalsCount().call();
    let voteTableBody = document.getElementById("voteTableBody");
    voteTableBody.innerHTML = ""; // Clear existing table rows

    // Fetch proposals and their vote counts and populate the table
    for (let i = 0; i < count; i++) {
      const proposal = await contract.methods.getProposal(i).call();

      // Create a new table row
      let row = document.createElement("tr");
      let proposalCell = document.createElement("td");
      let voteCountCell = document.createElement("td");

      // Fill the row with proposal name and vote count
      proposalCell.innerText = proposal[0];
      voteCountCell.innerText = proposal[1];

      // Append cells to the row
      row.appendChild(proposalCell);
      row.appendChild(voteCountCell);

      // Append row to the table body
      voteTableBody.appendChild(row);
    }
  } catch (error) {
    console.error("Error updating vote table:", error);
  }
}

// Handle proposal submission
document
  .getElementById("proposal-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const proposalInput = document.getElementById("proposal-input").value;

    try {
      await contract.methods.proposeIdea(proposalInput).send({ from: account });
      document.getElementById("proposal-input").value = ""; // Clear the input field after submission
      await loadProposals(); // Reload proposals and update the table after a new proposal is added
    } catch (error) {
      console.error("Error proposing idea:", error);
      alert("Error proposing idea. Please try again.");
    }
  });

// Attach event listener to "Connect Wallet" button when the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("connect-wallet")
    .addEventListener("click", connectWallet);
});
