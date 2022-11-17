// constants.js
import { ethers } from "ethers";
import contract from "./contracts/VoicePlatform.json";
const CONTRACT_ADDRESS = "0x4a28C00BD15a974DE084f514b25659915Da36c74";
const ABI = contract.abi;
const ETHERS =  ethers ;

export { CONTRACT_ADDRESS, ABI, ETHERS };