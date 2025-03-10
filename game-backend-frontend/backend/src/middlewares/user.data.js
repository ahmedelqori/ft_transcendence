
export const users = [
    {
      id: 1,
      username: "player1",
      status: "ON",
      friends: [8, 2]
    },
    {
      id: 2,
      username: "player2",
      status: "OF",
      friends: [1, 3]
    },
    {
      id: 3,
      username: "player3",
      status: "ON",
      friends: [2, 4]
    },
    {
      id: 4,
      username: "player4",
      status: "IG",
      friends: [3, 5]
    },
    {
      id: 5,
      username: "player3",
      status: "ON",
      friends: [4, 6]
    },
    {  
      id: 6,
      username: "player3",
      status: "IG",
      friends: [5, 7]
    },
    {     
      id: 7,
      username: "player3",
      status: "OF",
      friends: [6, 8]
    },    
    {  
      id: 8,
      username: "player3",
      status: "ON",
      friends: [7, 1]
    },
  ];

  export function getUserById(id) {
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;
    return users.find(user => user.id === userId) || null;
  }

  export function areFriends(playerOneId, playerTwoId){
    const playerone = users.find((user) => user.id === playerOneId)
    const playertwo = users.find((user) => user.id === playerTwoId)
    return (playerone.friends.includes(playerTwoId) && playertwo.friends.includes(playerOneId))
  }