import Game from "../lib/game.js"

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

    it ("should not allow a player to ready if they're not on a team", () => {
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
})