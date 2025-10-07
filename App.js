import React, { useState } from "react";
import "./App.css";

function App() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [winner, setWinner] = useState("");

  const handleWinner = () => {
    if (!player1 || !player2) {
      setWinner("Please enter both player names!");
      return;
    }
    const random = Math.random() < 0.5 ? player1 : player2;
    setWinner(`🏆 Winner: ${random}!`);
  };

  return (
    <div className="container">
      <h1> Winner Finder</h1>
      <input
        type="text"
        placeholder="Enter Player 1"
        value={player1}
        onChange={(e) => setPlayer1(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Player 2"
        value={player2}
        onChange={(e) => setPlayer2(e.target.value)}
      />
      <button onClick={handleWinner}>Winner</button>
      {winner && <h2 className="result">{winner}</h2>}
    </div>
  );
}

export default App;
