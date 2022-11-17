// constants.js
import { ethers } from "ethers";
import contract from "./contracts/VoicePlatform.json";
const CONTRACT_ADDRESS = "0x021f361ba35516c883C592eD4f44851D8679Cc34";
const ABI = contract.abi;
const ETHERS =  ethers ;

export { CONTRACT_ADDRESS, ABI, ETHERS };