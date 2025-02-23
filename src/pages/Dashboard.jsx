import { useEffect, useState } from "react";
import { useActiveWallet } from "thirdweb/react";
import { getOwnedNFTs } from "thirdweb/extensions/erc1155";
import { defineChain, getContract } from "thirdweb";
import { motion, AnimatePresence } from "framer-motion";
import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

export default function Profile() {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNft, setSelectedNft] = useState(null);
  const [error, setError] = useState(null);

  const walletInfo = useActiveWallet();
  const chain = defineChain(walletInfo?.getChain()?.id ?? 11155111);
  const walletAddress = walletInfo?.getAccount()?.address ?? "0x";

  const contract = getContract({
    address: "0x2a5735c8235E203ab7302291E46734538D497663",
    chain,
    client,
  });

  useEffect(() => {
    if (walletAddress !== "0x") {
      const fetchNfts = async () => {
        try {
          setError(null);
          const fetchedNFTs = await getOwnedNFTs({
            contract,
            start: 0,
            count: 10,
            address: walletAddress,
          });
          setNfts(fetchedNFTs);
        } catch (error) {
          console.error("Error fetching NFTs:", error);
          setError("Failed to fetch NFTs. Please make sure you're connectd to the correct network.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchNfts();
    }
  }, [walletAddress]);

  const formatIpfsUrl = (url) => {
    if (!url) return "";
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  };

  const handleCardClick = (nft) => {
    setSelectedNft(nft);
  };

  const handleClose = () => {
    setSelectedNft(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen w-[100vw] flex flex-col items-center bg-gray-500 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center font-medieval">
        Your NFT Collection
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div>
          <motion.div
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <motion.div
              className="border-t-4 border-blue-500 rounded-full w-16 h-16"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </motion.div>
          <h1 className="text-3xl font-bold mb-8 text-center font-medieval">
            Loading NFTs ...
          </h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {nfts.map((nft, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col w-72 h-[400px] cursor-pointer"
              onClick={() => handleCardClick(nft)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative h-80 w-full">
                <img
                  src={formatIpfsUrl(nft.metadata.image)}
                  alt={nft.metadata.name}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
                 <h2 className="text-2xl font-bold text-center mb-4">
                    {nft.metadata.name}
                </h2>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedNft && (
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
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 font-bold text-2xl"
              >
                ✕
              </button>
              <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
                  <img
                    src={formatIpfsUrl(selectedNft.metadata.image)}
                    alt={selectedNft.metadata.name}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="flex-grow text-white font-medieval">
                  <h2 className="text-4xl font-bold mb-4">
                    {selectedNft.metadata.name}
                  </h2>
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold mb-2">Attributes:</h3>
                    <ul className="grid grid-cols-2 gap-4">
                      {selectedNft.metadata.attributes.map((attribute, index) => (
                        <li
                          key={index}
                          className="bg-white bg-opacity-10 rounded-md p-3"
                        >
                          <span className="font-bold">
                            {attribute.trait_type}:
                          </span>{" "}
                          {attribute.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-2xl">
                    Owned: {selectedNft.quantityOwned.toString()} /{" "}
                    {selectedNft.supply.toString()}
                  </p>
                  <p className="text-xl mb-6">
                    {selectedNft.metadata.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}