// constants.js
import { ethers } from "ethers";
import contract from "./contracts/VoicePlatform.json";
const CONTRACT_ADDRESS = "0x499A3Cd182d72cDee52Ff52C13Dc3f36D6A7372d";
const ABI = contract.abi;
const ETHERS =  ethers ;

export { CONTRACT_ADDRESS, ABI, ETHERS };