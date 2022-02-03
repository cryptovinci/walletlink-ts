import React, { useState, useCallback } from "react";
import "./App.css";
import { ethers } from "ethers";
import { ABI as contractABI } from "./ContractABI";

const provider = new ethers.providers.Web3Provider(window.ethereum);

const signer = provider.getSigner();

const contractAddress = "0x206559fC0f6B762889C107Cb1c7dFC3138CC6e85";

const contract = new ethers.Contract(contractAddress, contractABI, provider);

function App() {
  const [value, setValue] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const connectWallet = useCallback(async () => {
    // const [selectedAddress] = await window.ethereum.send("eth_requestAccounts");

    const [selectedAddress] = await window.ethereum.enable();
    setAddress(selectedAddress);
  }, []);

  //why?
  // request access to the user's MetaMask account
  async function requestAccount() {
    if (window.ethereum?.request)
      return window.ethereum.request({ method: "eth_requestAccounts" });

    throw new Error(
      "Missing install Metamask. Please access https://metamask.io/ to install extension on your browser"
    );
  }

  // call the smart contract, read the current greeting value
  const handleFetch = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
      try {
        const greeting = await contract.greet();
        alert("Greeting from contract: " + greeting);
      } catch (err) {
        console.error(`Error: ${err}`);
      }
    }
  };

  // call the smart contract, send an update
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value) return;
    if (window.ethereum) {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const transaction = await contract.setGreeting(value);
      await transaction.wait();
      handleFetch();
    }
  }

  // const handleSubmit = async () => {
  //   await requestAccount();
  //   const contract = new ethers.Contract(contractAddress, contractABI, signer);
  //   contract.setGreeting(value);
  // };

  // const handleFetch = async () => {
  //   await requestAccount();
  //   const greeting = contract.greet();
  //   alert("Greeting from contract: " + greeting);
  // };

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setValue(target.value);
  };

  if (!window.ethereum) return <div>No Wallet Detected</div>;

  if (!address) return <button onClick={connectWallet}>Connect Wallet</button>;

  return (
    <div className="App">
      <button onClick={handleFetch}>Fetch Greeting</button>
      <form onSubmit={handleSubmit}>
        <label>
          New Greeting:
          <input type="text" value={value} onChange={handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default App;
