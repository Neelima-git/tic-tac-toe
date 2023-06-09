<script setup>
import { ref, computed } from "vue";
import io from "socket.io-client";

//Declare a variable which talks with server
const socket = io("http://localhost:3000");

// Create a reactive reference to track the current player and the game board
const player = ref("x");
const board = ref([
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
]);

// Helper function to calculate the winner based on the current state of the game board
const calculateWinner = (squares) => {
  // List of all possible winning combinations
  const lines = [
    //rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    //cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    //diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];
  // Check each winning combination to see if a player has won
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    //checks if the player symbol at position a is not null (squares[a]) and if it is equal to the symbols at positions b and c (squares[b] and squares[c]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; // Return the winning player's symbol
    }
  }
  return null; // If no player has won, return null
};

// Create a computed reference to track the winner or draw based on the current game board
const winner = computed(() => {
  /* The flat() method concatenates sub-array elements.
  const myArr = [[1,2],[3,4],[5,6]];
  const newArr = myArr.flat();
` console.log(newArr) // 1,2,3,4,5,6
  */
  const flatBoard = board.value.flat();
  const emptyCells = flatBoard.filter((cell) => cell === "");
  const winningPlayer = calculateWinner(flatBoard);

  if (emptyCells.length === 0 && !winningPlayer) {
    return "It's Draw";
  } else {
    return winningPlayer;
  }
});

// Function to make a move on the game board
const makeMove = (x, y, opponentMarked) => {
  //emit event to send the board position to server
  if(!opponentMarked){
    socket.emit("markTile", x, y);
  }

  if (winner.value) return; // If a player has already won, do not allow any more moves

  if (board.value[x][y] !== "") return; // If the selected cell is already occupied, do not allow a move

  board.value[x][y] = player.value; // Update the game board with the player's symbol
  player.value = player.value === "X" ? "O" : "X"; // Switch to the other player's turn
};

// Function to reset the game board to its initial state
const resetGame = () => {
  board.value = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  player.value = "X"; // Reset the first player to 'X'
};

socket.on("markTile", (x, y) => {
  console.log("received in vue", x, y);
  makeMove(x,y, true)
});
</script>

<!-- HTML template to display the Tic Tac Toe game and allow players to interact with it -->
<template>
  <main class="pt-8 text-center bg-blue-300 bg-opacity-70 min-h-screen">
    <h1 class="mb-8 text-3xl font-bold uppercase">Tic Tac Toe</h1>
    <h3 class="my-4">Player {{ player }}'s turn</h3>
    <div class="flex flex-col items-center mb-8">
      <!-- generate the board -->
      <div v-for="(row, x) in board" :key="x" class="flex">
        <div
          v-for="(cell, y) in row"
          :key="y"
          @click="makeMove(x, y)"
          :class="`border border-blue-800 w-24 h-24 bg-blue-400 hover:bg-blue-300 flex items-center justify-center material-icons-outlined text-4xl cursor-pointer rounded-lg bg-opacity-50 border border-gray-100 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 ${
            cell === 'X' ? 'text-pink-800' : 'text-blue-800'
          }`"
        >
          {{ cell === "X" ? "close" : cell === "O" ? "circle" : "" }}
        </div>
      </div>
    </div>

    <div class="text-center">
      <!-- show winner or draw message -->
      <h2 v-if="winner === 'Draw'" class="text-6xl font-bold mb-8">Draw!</h2>
      <h2 v-else-if="winner" class="text-6xl font-bold mb-8">
        Player '{{ winner }}' wins!
      </h2>
      <!-- reset button -->
      <button
        @click="resetGame"
        class="px-4 py-2 bg-pink-700 text-gray rounded uppercase font-bold hover:bg-pink-600 duration-300"
      >
        Reset
      </button>
    </div>
  </main>
</template>

<style scoped></style>
