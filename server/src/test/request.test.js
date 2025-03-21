import handleRequest from "../lib/handleRequest.js"

describe("handleRequest", () => {
  describe("when joining a game", () => {
    it("should handle a joinGame request", () => {
      // ARRANGE
      const request = {
        type: "joinGame",
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()
      const gameInstance = {
        joinGame: jest.fn(() => ({ success: true })),
      }
      gameInstances.set("game1", gameInstance)

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(gameInstance.joinGame).toHaveBeenCalledWith(
        "player1",
        "Player One",
        socket
      )
      expect(socket.send).not.toHaveBeenCalled()
    })

    it("should validate the required field: gameId", () => {
      // ARRANGE
      const request = {
        type: "joinGame",
        playerId: "player1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          error: "Missing required field: gameId",
        })
      )
    })

    it("should validate the required field: playerId", () => {
      // ARRANGE
      const request = {
        type: "joinGame",
        gameId: "game1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          error: "Missing required field: playerId",
        })
      )
    })

    it("should validate the required field: playerName", () => {
      // ARRANGE
      const request = {
        type: "joinGame",
        gameId: "game1",
        playerId: "player1",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          error: "Missing required field: playerName",
        })
      )
    })
  })

  describe("when joining a team", () => {
    it("should handle a joinTeam request", () => {
      // ARRANGE
      const request = {
        type: "joinTeam",
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
        teamName: "Team One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()
      const gameInstance = {
        joinTeam: jest.fn(() => ({ success: true })),
      }
      gameInstances.set("game1", gameInstance)

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(gameInstance.joinTeam).toHaveBeenCalledWith("player1", "Team One")
      expect(socket.send).not.toHaveBeenCalled()
    })

    it("should validate the required field: teamName", () => {
      // ARRANGE
      const request = {
        type: "joinTeam",
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          error: "Missing required field: teamName",
        })
      )
    })
  })

  describe("when a player is ready", () => {
    it("should handle a playerReady request", () => {
      // ARRANGE
      const request = {
        type: "playerReady",
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
        ready: true,
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()
      const gameInstance = {
        playerReady: jest.fn(() => ({ success: true })),
      }
      gameInstances.set("game1", gameInstance)

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(gameInstance.playerReady).toHaveBeenCalledWith("player1", true)
      expect(socket.send).not.toHaveBeenCalled()
    })

    it("should validate the required field: ready", () => {
      // ARRANGE
      const request = {
        type: "playerReady",
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          error: "Missing required field: ready",
        })
      )
    })
  })

  describe("when the request type is unknown", () => {
    it("should reply with an error", () => {
      // ARRANGE
      const request = {
        type: "unknown",
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          error: "Unknown request type: 'unknown'",
        })
      )
    })

    it("should reply with an error when the type is missing", () => {
      // ARRANGE
      const request = {
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          error: "Messages require a 'type'.",
        })
      )
    })
  })
})
