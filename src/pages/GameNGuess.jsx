import React, { useState } from "react";
import { ethers } from "ethers"; 
import { AnimatePresence, motion } from "framer-motion"; // Import framer-motion
import WelcomeImg from "../assets/games/guessing-game.svg";

const GameNGuess = () => {
  const [gameConfig, setGameConfig] = useState({ range: 10, attempts: 3 });
  const [gameState, setGameState] = useState({
    isStarted: false,
    numbers: [],
    hashes: [],
    timestamps: [],
    currentHashIndex: 0,
    isGameOver: false,
    score: 0,
    userGuesses: [], // Track user guesses
  });
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [revealedTimestamp, setRevealedTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);


  const simpleHash = (input) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) % 1000000007;
    }
    return hash.toString(16);
  };

  const generateNumbersAndHashes = (count, maxRange) => {
    const nums = [], hashedVals = [], timestamps = [];
    while (nums.length < count) {
      const num = Math.floor(Math.random() * maxRange) + 1;
      if (!nums.includes(num)) {
        const timestamp = Date.now().toString();
        const last4Digits = num.toString().padStart(4, "0").slice(-4);
        const hashInput = `${num}${last4Digits}${timestamp}`;
        nums.push(num);
        timestamps.push(timestamp);
        hashedVals.push(simpleHash(hashInput));
      }
    }
    return { numbers: nums, hashes: hashedVals, timestamps };
  };

  const startGame = async () => {
    if (gameConfig.range < 1 || gameConfig.attempts < 1) {
      setMessage("⚠️ Range and attempts must be positive numbers!");
      return;
    }

    if (gameConfig.attempts > gameConfig.range) {
      setMessage("⚠️ Number of attempts cannot exceed the range!");
      return;
    }

    try {
      setLoading(true);
      const { numbers, hashes, timestamps } = generateNumbersAndHashes(gameConfig.attempts, gameConfig.range);
      setGameState({
        isStarted: true,
        numbers,
        hashes,
        timestamps,
        currentHashIndex: 0,
        isGameOver: false,
        score: 0,
        userGuesses: [], // Reset user guesses
      });

      setMessage(`Guess the number for Hash #1`);
      setRevealedTimestamp(null);
      setGuess("");
    } catch (error) {
      console.error("Error starting game:", error);
      setMessage("Error starting game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = () => {
    const guessNum = parseInt(guess);
    if (!guessNum || guessNum < 1 || guessNum > gameConfig.range) {
      setMessage(`⚠️ Enter a valid number between 1 and ${gameConfig.range}`);
      return;
    }

    const { currentHashIndex, numbers, hashes, timestamps } = gameState;
    const currentNumber = numbers[currentHashIndex];
    const timestamp = timestamps[currentHashIndex];
    const last4Digits = guessNum.toString().padStart(4, "0").slice(-4);
    const guessHash = simpleHash(`${guessNum}${last4Digits}${timestamp}`);

    const updatedUserGuesses = [...gameState.userGuesses, guessNum]; // Store user guess

    if (guessHash === hashes[currentHashIndex]) {
      setGameState((prev) => ({
        ...prev,
        score: prev.score + 1,
        currentHashIndex: prev.currentHashIndex + 1,
        isGameOver: prev.currentHashIndex + 1 >= prev.hashes.length,
        userGuesses: updatedUserGuesses,
      }));

      if (currentHashIndex + 1 >= hashes.length) {
        setMessage(`🎉 Game Over! Final Score: ${gameState.score + 1}/${hashes.length}`);
      } else {
        setMessage(`✅ Correct! Try Hash #${currentHashIndex + 2}`);
      }
    } else {
      setGameState((prev) => ({
        ...prev,
        currentHashIndex: prev.currentHashIndex + 1,
        isGameOver: prev.currentHashIndex + 1 >= prev.hashes.length,
        userGuesses: updatedUserGuesses,
      }));

      if (currentHashIndex + 1 >= hashes.length) {
        setMessage(`Game Over! The number was ${currentNumber}. Final Score: ${gameState.score}/${hashes.length}`);
      } else {
        setMessage(`❌ Wrong! The number was ${currentNumber}. Try Hash #${currentHashIndex + 2}`);
      }
    }

    setRevealedTimestamp(timestamp);
    setGuess("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  return (
    <div className="h-[86.3vh] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="container mx-auto max-w-3xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        {!gameState.isStarted ? (
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold">🔍 Number Guessing Game</h1>
            <img src={WelcomeImg} alt="Guessing Game" className="w-60 my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-lg font-medium">Number Range (1 to ?)</label>
                <input
                  type="number"
                  value={gameConfig.range}
                  onChange={(e) => setGameConfig(prev => ({ ...prev, range: Math.max(1, parseInt(e.target.value) || 0) }))}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-lg font-medium">Number of rounds</label>
                <input
                  type="number"
                  value={gameConfig.attempts}
                  onChange={(e) => setGameConfig(prev => ({ ...prev, attempts: Math.max(1, parseInt(e.target.value) || 0) }))}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="1"
                />
              </div>
            </div>
            {message && <p className="text-red-500 text-center font-medium">{message}</p>}
            <br />
            <button
              onClick={startGame}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-center">🔢 Guess the Number</h1>
            <div className="space-y-6">
              <p className="text-lg text-center font-medium">{message}</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                      <th className="px-4 py-3 border border-gray-300 dark:border-gray-600">#</th>
                      <th className="px-4 py-3 border border-gray-300 dark:border-gray-600">Hash</th>
                      <th className="px-4 py-3 border border-gray-300 dark:border-gray-600">Your Guess</th>
                      <th className="px-4 py-3 border border-gray-300 dark:border-gray-600">Noise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameState.hashes.map((hash, index) => (
                      <motion.tr
                        key={index}
                        className={`text-center ${index === gameState.currentHashIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td className="px-4 py-3 border">{index + 1}</td>
                        <td className="px-4 py-3 border">{hash}</td>
                        <td className="px-4 py-3 border">{gameState.userGuesses[index] || "?"}</td>
                        <td className="px-4 py-3 border">
                          {gameState.timestamps[index] === revealedTimestamp ? (
                            <span className="text-green-500">Revealed</span>
                          ) : (
                            <span className="text-red-500">Hidden</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Guess a number (1-${gameConfig.range})`}
                className="w-full p-3 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleGuess}
                disabled={loading || gameState.isGameOver}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit Guess
              </button>
            </div>
          </div>
        )}

        {/* Animated Modal for Final Result */}
        <AnimatePresence>
          {gameState.isGameOver && (
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
                  onClick={() => setGameState(prev => ({ ...prev, isStarted: false, isGameOver: false }))}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 font-bold text-2xl"
                >
                  ✕
                </button>
                <h2 className="text-4xl font-bold text-center text-white mb-4">{message}</h2>
                <div className="flex flex-col items-center">
                  <h3 className="text-xl text-white mb-4">Final Score:</h3>
                  <p className="text-2xl text-green-400">Your Score: {gameState.score}</p>
                  <p className="text-2xl text-red-400">Total Attempts: {gameState.hashes.length}</p>
                  <button
                    onClick={() => startGame()} // Play again logic
                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Play Again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameNGuess;
