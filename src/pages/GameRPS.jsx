import React, { useState } from "react";
import { FaHandRock, FaHandPaper, FaHandScissors } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";

const choices = ["ROCK", "PAPER", "SCISSORS"];

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: "0x2a5735c8235E203ab7302291E46734538D497663",
});

const GameRPS = () => {
  const [playerVal, setPlayerVal] = useState(null);
  const [computerVal, setComputerVal] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [compScore, setCompScore] = useState(0);
  const [message, setMessage] = useState("Make your move!");
  const [gameOver, setGameOver] = useState(false);
  const { mutate: sendTransaction } = useSendTransaction();

  const handlePlayerVictory = async () => {
    // Here you define the parameters for the transaction
    const from = import.meta.env.VITE_CREATOR_ADDRESS;  // Replace with the sender's address
    const to = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";  // Replace with the recipient's address
    const id = 2;                    // Replace with the NFT token ID you want to transfer
    const amount = 1;                // The amount of NFTs to transfer
    const data = "0x";              // Additional data (can be empty)

    try {
      const transaction = prepareContractCall({
        contract,
        method: "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
        params: [from, to, id, amount, data],
      });

      await sendTransaction(transaction);
      console.log("Transaction initiated successfully");
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };
  
  

  // Determine winner
  const logic = (player, computer) => {
    if (player === computer) return 0;
    if (
      (player === "ROCK" && computer === "SCISSORS") ||
      (player === "SCISSORS" && computer === "PAPER") ||
      (player === "PAPER" && computer === "ROCK")
    ) {
      return 1;
    }
    return -1;
  };

  // Handle user choice
  const decision = (playerChoice) => {
    if (gameOver) return;

    const compChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = logic(playerChoice, compChoice);

    setPlayerVal(playerChoice);
    setComputerVal(compChoice);

    if (result === 1) {
      setPlayerScore(playerScore + 1);
      setMessage("🎉 You Win!");
    } else if (result === -1) {
      setCompScore(compScore + 1);
      setMessage("😢 You Lose!");
    } else {
      setMessage("🤝 It's a Tie!");
    }

    // Check if either player has reached 5 points
    if (playerScore + 1 === 5) {
      setMessage("🏆 You won the game! Congratulations! your special NFT is on the way ;)");
      setGameOver(true);
      handlePlayerVictory(); // Trigger custom function when player wins
    } else if (compScore + 1 === 5) {
      setMessage("💻 Computer won the game! Better luck next time.");
      setGameOver(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[86.3vh] bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">🪨📄✂️ Rock, Paper, Scissors</h1>

      {/* Choices Buttons */}
      <div className="flex gap-6 mb-6">
        <button
          // onClick={() => decision("ROCK")}
          onClick={() => handlePlayerVictory()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg transition shadow-md"
          disabled={gameOver}
        >
          <FaHandRock className="text-2xl" /> Rock
        </button>
        <button
          onClick={() => decision("PAPER")}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-lg transition shadow-md"
          disabled={gameOver}
        >
          <FaHandPaper className="text-2xl" /> Paper
        </button>
        <button
          onClick={() => decision("SCISSORS")}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-lg transition shadow-md"
          disabled={gameOver}
        >
          <FaHandScissors className="text-2xl" /> Scissors
        </button>
      </div>

      {/* Game Result */}
      <div className="text-center bg-gray-800 p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{message}</h2>
        <p className="text-xl">👤 Your Choice: <span className="font-bold text-blue-400">{playerVal || "?"}</span></p>
        <p className="text-xl">🤖 Computer's Choice: <span className="font-bold text-red-400">{computerVal || "?"}</span></p>
        <hr className="my-4 border-gray-600" />
        <h2 className="text-2xl font-semibold text-green-400">🏆 Your Score: {playerScore}</h2>
        <h2 className="text-2xl font-semibold text-red-400">💻 Computer Score: {compScore}</h2>
      </div>

      {/* Animated Modal for Final Result */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg shadow-2xl p-8 w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-4xl relative"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                onClick={() => setGameOver(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 font-bold text-2xl"
              >
                ✕
              </button>
              <h2 className="text-4xl font-bold text-center text-white mb-4">{message}</h2>
              <div className="flex flex-col items-center">
                <h3 className="text-xl text-white mb-4">Final Score:</h3>
                <p className="text-2xl text-green-400">Your Score: {playerScore}</p>
                <p className="text-2xl text-red-400">Computer Score: {compScore}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameRPS;
