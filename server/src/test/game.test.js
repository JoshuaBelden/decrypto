import Game, { GAME_PHASE } from "../lib/game.js"

describe("Game", () => {
  describe("joinGame", () => {
    it("should add a player to the game", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"
      const playerName = "Player One"
      const socket = { send: jest.fn() }

      // ACT
      const result = game.joinGame(playerId, playerName, socket)

      // ASSERT
      expect(result.success).toBe(true)
      expect(game.players).toHaveLength(1)
      expect(game.players[0].playerId).toBe(playerId)
      expect(game.players[0].playerName).toBe(playerName)
    })

    it("should not add a player to the game if they are already in the game", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"
      const playerName = "Player One"
      const socket = { send: jest.fn() }
      game.joinGame(playerId, playerName, socket)

      // ACT
      const result = game.joinGame(playerId, playerName, socket)

      // ASSERT
      expect(result.success).toBe(false)
      expect(game.players).toHaveLength(1)
    })
  })

  describe("joinTeam", () => {
    it("should add a player to a team", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"
      const playerName = "Player One"
      const socket = { send: jest.fn() }
      game.joinGame(playerId, playerName, socket)

      // ACT
      const result = game.joinTeam(playerId, "White")

      // ASSERT
      expect(result.success).toBe(true)
      expect(game.teams[0].playerIds).toContain(playerId)
    })

    it("should not add a player to a team if they are not in the game", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"

      // ACT
      const result = game.joinTeam(playerId, "White")

      // ASSERT
      expect(result.success).toBe(false)
    })

    it("should not add a player to a team if the team does not exist", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"
      const playerName = "Player One"
      const socket = { send: jest.fn() }
      game.joinGame(playerId, playerName, socket)

      // ACT
      const result = game.joinTeam(playerId, "Red")

      // ASSERT
      expect(result.success).toBe(false)
    })

    it("should not add a player to a team if they are already on the team", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"
      const playerName = "Player One"
      const socket = { send: jest.fn() }
      game.joinGame(playerId, playerName, socket)
      game.joinTeam(playerId, "White")

      // ACT
      const result = game.joinTeam(playerId, "White")

      // ASSERT
      expect(result.success).toBe(false)
    })

    it("should allow a player to join the other team", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"
      const playerName = "Player One"
      const socket = { send: jest.fn() }
      game.joinGame(playerId, playerName, socket)
      game.joinTeam(playerId, "White")

      // ACT
      const result = game.joinTeam(playerId, "Black")

      // ASSERT
      expect(result.success).toBe(true)
      expect(game.teams[0].playerIds).not.toContain(playerId)
      expect(game.teams[1].playerIds).toContain(playerId)
    })
  })

  describe("playerReady", () => {
    it("should set a player as ready", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"
      const playerName = "Player One"
      const socket = { send: jest.fn() }
      game.joinGame(playerId, playerName, socket)
      game.joinTeam(playerId, "White")

      // ACT
      const result = game.playerReady(playerId, true)

      // ASSERT
      expect(result.success).toBe(true)
      expect(game.players[0].ready).toBe(true)
    })

    it("should not set a player as ready if they are not in the game", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"

      // ACT
      const result = game.playerReady(playerId, true)

      // ASSERT
      expect(result.success).toBe(false)
    })

    it("should not allow a player to ready if they're not on a team", () => {
      // ARRANGE
      const game = Game("game1")
      const playerId = "player1"
      const playerName = "Player One"
      const socket = { send: jest.fn() }
      game.joinGame(playerId, playerName, socket)

      // ACT
      const result = game.playerReady(playerId, true)

      // ASSERT
      expect(result.success).toBe(false)
    })
  })

  describe("transitionPhase", () => {
    describe("lobby to main_encrypt", () => {
      it("lobby should transition to main_encrypt", () => {
        // ARRANGE
        const game = Game("game1")
        const playerId1 = "player1"
        const playerName1 = "Player One"
        const socket1 = { send: jest.fn() }
        game.joinGame(playerId1, playerName1, socket1)
        game.joinTeam(playerId1, "White")

        const playerId2 = "player2"
        const playerName2 = "Player Two"
        const socket2 = { send: jest.fn() }
        game.joinGame(playerId2, playerName2, socket2)
        game.joinTeam(playerId2, "White")

        const playerId3 = "player3"
        const playerName3 = "Player Three"
        const socket3 = { send: jest.fn() }
        game.joinGame(playerId3, playerName3, socket3)
        game.joinTeam(playerId3, "Black")

        const playerId4 = "player4"
        const playerName4 = "Player Four"
        const socket4 = { send: jest.fn() }
        game.joinGame(playerId4, playerName4, socket4)
        game.joinTeam(playerId4, "Black")

        // ACT
        game.playerReady(playerId1, true)
        game.playerReady(playerId2, true)
        game.playerReady(playerId3, true)
        const result = game.playerReady(playerId4, true)

        // ASSERT
        expect(result.success).toBe(true)
        expect(game.state.phase).toBe(GAME_PHASE.MAIN_ENCRYPT)
      })

      it("main_encrypt should have 4 keywords set per team", () => {
        // ARRANGE
        const game = Game("game1")
        const playerId1 = "player1"
        const playerName1 = "Player One"
        const socket1 = { send: jest.fn() }
        game.joinGame(playerId1, playerName1, socket1)
        game.joinTeam(playerId1, "White")

        const playerId2 = "player2"
        const playerName2 = "Player Two"
        const socket2 = { send: jest.fn() }
        game.joinGame(playerId2, playerName2, socket2)
        game.joinTeam(playerId2, "White")

        const playerId3 = "player3"
        const playerName3 = "Player Three"
        const socket3 = { send: jest.fn() }
        game.joinGame(playerId3, playerName3, socket3)
        game.joinTeam(playerId3, "Black")

        const playerId4 = "player4"
        const playerName4 = "Player Four"
        const socket4 = { send: jest.fn() }
        game.joinGame(playerId4, playerName4, socket4)
        game.joinTeam(playerId4, "Black")

        // ACT
        game.playerReady(playerId1, true)
        game.playerReady(playerId2, true)
        game.playerReady(playerId3, true)
        game.playerReady(playerId4, true)

        // ASSERT
        expect(game.teams[0].keywords).toHaveLength(4)
        expect(game.teams[1].keywords).toHaveLength(4)
      })

      it("main_encrypt should choose 1 encryptor from each team", () => {
        // ARRANGE
        const game = Game("game1")
        const playerId1 = "player1"
        const playerName1 = "Player One"
        const socket1 = { send: jest.fn() }
        game.joinGame(playerId1, playerName1, socket1)
        game.joinTeam(playerId1, "White")

        const playerId2 = "player2"
        const playerName2 = "Player Two"
        const socket2 = { send: jest.fn() }
        game.joinGame(playerId2, playerName2, socket2)
        game.joinTeam(playerId2, "White")

        const playerId3 = "player3"
        const playerName3 = "Player Three"
        const socket3 = { send: jest.fn() }
        game.joinGame(playerId3, playerName3, socket3)
        game.joinTeam(playerId3, "Black")

        const playerId4 = "player4"
        const playerName4 = "Player Four"
        const socket4 = { send: jest.fn() }
        game.joinGame(playerId4, playerName4, socket4)
        game.joinTeam(playerId4, "Black")

        // ACT
        game.playerReady(playerId1, true)
        game.playerReady(playerId2, true)
        game.playerReady(playerId3, true)
        game.playerReady(playerId4, true)

        // ASSERT
        expect(game.teams[0].currentEncryptorId).not.toBeNull()
        expect(game.teams[1].currentEncryptorId).not.toBeNull()
      })
    })

    describe("main_encrypt to main_white", () => {
      it("main_encrypt should transition to main_white", () => {
        // ARRANGE
        const game = Game("game1")
        const playerId1 = "player1"
        const playerName1 = "Player One"
        const socket1 = { send: jest.fn() }
        game.joinGame(playerId1, playerName1, socket1)
        game.joinTeam(playerId1, "White")

        const playerId2 = "player2"
        const playerName2 = "Player Two"
        const socket2 = { send: jest.fn() }
        game.joinGame(playerId2, playerName2, socket2)
        game.joinTeam(playerId2, "White")

        const playerId3 = "player3"
        const playerName3 = "Player Three"
        const socket3 = { send: jest.fn() }
        game.joinGame(playerId3, playerName3, socket3)
        game.joinTeam(playerId3, "Black")

        const playerId4 = "player4"
        const playerName4 = "Player Four"
        const socket4 = { send: jest.fn() }
        game.joinGame(playerId4, playerName4, socket4)
        game.joinTeam(playerId4, "Black")

        game.playerReady(playerId1, true)
        game.playerReady(playerId2, true)
        game.playerReady(playerId3, true)
        game.playerReady(playerId4, true)
        
        // ACT
        const whiteTeamEncryptorPlayer = game.players.find(player => player.playerId === game.teams[0].currentEncryptorId)
        game.submitClues(whiteTeamEncryptorPlayer.playerId, ["apple", "banana", "carrot"])

        const blackTeamEncryptorPlayer = game.players.find(player => player.playerId === game.teams[1].currentEncryptorId)
        game.submitClues(blackTeamEncryptorPlayer.playerId, ["dog", "elephant", "frog"])

        // ASSERT
        expect(game.state.phase).toBe(GAME_PHASE.MAIN_WHITE)
      })
    })
  })
})
