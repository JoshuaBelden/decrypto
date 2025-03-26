import { REQUEST_TYPE } from "../lib/constants.js"
import handleRequest from "../lib/handleRequest.js"

describe("handleRequest", () => {
  describe("when joining a game", () => {
    it("should handle a joinGame request", () => {
      // ARRANGE
      const request = {
        type: REQUEST_TYPE.JOIN_GAME,
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
        type: REQUEST_TYPE.JOIN_GAME,
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
        type: REQUEST_TYPE.JOIN_GAME,
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
        type: REQUEST_TYPE.JOIN_GAME,
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
        type: REQUEST_TYPE.JOIN_TEAM,
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
        type: REQUEST_TYPE.JOIN_TEAM,
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

  describe("when adding bots", () => {
    it("should handle an addBots request", () => {
      // ARRANGE
      const request = {
        type: REQUEST_TYPE.ADD_BOTS,
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()
      const gameInstance = {
        addBots: jest.fn(() => ({ success: true })),
      }
      gameInstances.set("game1", gameInstance)

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(gameInstance.addBots).toHaveBeenCalled()
      expect(socket.send).not.toHaveBeenCalled()
    })
  })

  describe("when a player is ready", () => {
    it("should handle a playerReady request", () => {
      // ARRANGE
      const request = {
        type: REQUEST_TYPE.PLAYER_READY,
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
        type: REQUEST_TYPE.PLAYER_READY,
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

  describe("when submitting clues", () => {
    it("should handle a submitClues request", () => {
      // ARRANGE
      const request = {
        type: REQUEST_TYPE.SUBMIT_CLUES,
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
        clues: ["clue1", "clue2", "clue3"],
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()
      const gameInstance = {
        submitClues: jest.fn(() => ({ success: true })),
      }
      gameInstances.set("game1", gameInstance)

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(gameInstance.submitClues).toHaveBeenCalledWith("player1", [
        "clue1",
        "clue2",
        "clue3",
      ])
      expect(socket.send).not.toHaveBeenCalled()
    })
  })

  describe("when submitting an intercept guess", () => {
    it("should handle a submitInterceptGuess request", () => {
      // ARRANGE
      const request = {
        type: REQUEST_TYPE.SUBMIT_INTERCEPT_GUESS,
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
        interceptGuess: [1, 2, 3],
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()
      const gameInstance = {
        submitInterceptGuess: jest.fn(() => ({ success: true })),
      }
      gameInstances.set("game1", gameInstance)

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(gameInstance.submitInterceptGuess).toHaveBeenCalledWith(
        "player1",
        [1, 2, 3]
      )
      expect(socket.send).not.toHaveBeenCalled()
    })
  })

  describe("when submitting a decode guess", () => {
    it("should handle a submitDecodeGuess request", () => {
      // ARRANGE
      const request = {
        type: REQUEST_TYPE.SUBMIT_DECODE_GUESS,
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
        decodeGuess: [1, 2, 3],
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()
      const gameInstance = {
        submitDecodeGuess: jest.fn(() => ({ success: true })),
      }
      gameInstances.set("game1", gameInstance)

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(gameInstance.submitDecodeGuess).toHaveBeenCalledWith(
        "player1",
        [1, 2, 3]
      )
      expect(socket.send).not.toHaveBeenCalled()
    })
  })

  describe("when submitting ready for next round", () => {
    it("should handle a submitReadyForNextRound request", () => {
      // ARRANGE
      const request = {
        type: REQUEST_TYPE.SUBMIT_READY_FOR_NEXT_ROUND,
        gameId: "game1",
        playerId: "player1",
        playerName: "Player One",
      }
      const socket = { send: jest.fn() }
      const gameInstances = new Map()
      const gameInstance = {
        submitReadyForNextRound: jest.fn(() => ({ success: true })),
      }
      gameInstances.set("game1", gameInstance)

      // ACT
      handleRequest(request, socket, gameInstances)

      // ASSERT
      expect(gameInstance.submitReadyForNextRound).toHaveBeenCalledWith(
        "player1"
      )
      expect(socket.send).not.toHaveBeenCalled()
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
