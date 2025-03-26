import RoundManager from "./roundManager.js"
import PhaseManager from "./phaseManager.js"
import Game from "./game.js"
import { fail } from "./result.js"

export const REQUEST_TYPE = {
  JOIN_GAME: "joinGame",
  JOIN_TEAM: "joinTeam",
  PLAYER_READY: "playerReady",
  SUBMIT_CLUES: "submitClues",
  SUBMIT_INTERCEPT_GUESS: "submitInterceptGuess",
  SUBMIT_DECODE_GUESS: "submitDecodeGuess",
  SUBMIT_READY_FOR_NEXT_ROUND: "submitReadyForNextRound",
}

const handleRequest = (request, socket, gameInstances) => {
  const gameId = requireField("gameId", request, socket)
  if (!gameId) return

  const playerId = requireField("playerId", request, socket)
  if (!playerId) return
  
  const playerName = requireField("playerName", request, socket)
  if (!playerName) return
  
  const gameInstance = createGameInstance(gameInstances, gameId)

  let result

  switch (request?.type) {
    case REQUEST_TYPE.JOIN_GAME:
      result = gameInstance.joinGame(playerId, playerName, socket)
      break
    case REQUEST_TYPE.JOIN_TEAM:
      const teamName = requireField("teamName", request, socket)
      result = gameInstance.joinTeam(playerId, teamName)
      break
    case REQUEST_TYPE.PLAYER_READY:
      const ready = requireField("ready", request, socket)
      result = gameInstance.playerReady(playerId, ready)
      break
    case REQUEST_TYPE.SUBMIT_CLUES:
      const clues = requireField("clues", request, socket)
      result = gameInstance.submitClues(playerId, clues)
      break
    case REQUEST_TYPE.SUBMIT_INTERCEPT_GUESS:
      const interceptGuess = requireField("interceptGuess", request, socket)
      if (!interceptGuess) return
      result = gameInstance.submitInterceptGuess(playerId, interceptGuess)
      break
    case REQUEST_TYPE.SUBMIT_DECODE_GUESS:
      const decodeGuess = requireField("decodeGuess", request, socket)
      if (!decodeGuess) return
      result = gameInstance.submitDecodeGuess(playerId, decodeGuess)
      break
    case REQUEST_TYPE.SUBMIT_READY_FOR_NEXT_ROUND:
      result = gameInstance.submitReadyForNextRound(playerId)
      break
    default:
      result = fail(
        !request.type
          ? "Messages require a 'type'."
          : `Unknown request type: '${request?.type}'`
      )
  }

  if (!result.success) {
    replyWithError(socket, result.errorMessage)
  } else {
    broadcastGameUpdate(gameInstance)
  }
}

const createGameInstance = (gameInstances, gameId) => {
  if (!gameInstances) throw new Error("gameInstances is required.")
  if (!gameId) throw new Error("gameId is required.")

  if (gameInstances.has(gameId)) return gameInstances.get(gameId)

  const roundManager = RoundManager()
  const phaseManager = PhaseManager(roundManager)
  const gameInstance = Game(gameId, roundManager, phaseManager)
  gameInstances.set(gameId, gameInstance)
  return gameInstance
}

const requireField = (field, request, socket) => {
  if (request[field] !== undefined) return request[field]
  replyWithError(socket, `Missing required field: ${field}`)
}

const broadcastGameUpdate = gameInstance => {
  if (!gameInstance?.players?.length) return

  gameInstance.players.forEach(player => {
    player.socket.send(
      JSON.stringify({
        gameInstance: {
          ...gameInstance,
          players: gameInstance.players.map(player => ({
            ...player,
            socket: undefined,
          })),
        },
      })
    )
  })
}

const replyWithError = (socket, errorMessage) => {
  socket.send(JSON.stringify({ error: errorMessage }))
}

export default handleRequest
