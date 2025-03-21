import Game from "./game.js"
import { fail } from "./lib/result.js"

const REQUEST_TYPE = {
  JOIN_GAME: "joinGame",
  JOIN_TEAM: "joinTeam",
}

const handleRequest = (request, socket, gameInstances) => {
  try {
    const gameId = requireField("gameId", request, socket)
    const gameInstance = createGameInstance(gameInstances, gameId)
    const playerId = requireField("playerId", request, socket)
    const playerName = requireField("playerName", request, socket)

    let result

    switch (request?.type) {
      case REQUEST_TYPE.JOIN_GAME:
        result = gameInstance.joinGame(playerId, playerName, socket)
        break
      case REQUEST_TYPE.JOIN_TEAM:
        const teamName = requireField("teamName", request, socket)
        result = gameInstance.joinTeam(playerId, teamName)
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
  } catch (error) {
    console.error(`Socket message error: ${error}`)
  }
}

const createGameInstance = (gameInstances, gameId) => {
  if (gameInstances.has(gameId)) return gameInstances.get(gameId)

  const gameInstance = Game(gameId)
  gameInstances.set(gameId, gameInstance)
  return gameInstance
}

const requireField = (field, request, socket) => {
  if (request[field]) return request[field]

  replyWithError(socket, `Missing required field: ${field}`)
  throw new Error("Missing required field")
}

const broadcastGameUpdate = gameInstance => {
  gameInstance.players.forEach(player => {
    player.socket.send(
      JSON.stringify({
        gameInstance: {
          ...gameInstance,
          players: gameInstance.players.map(player => ({
            playerId: player.playerId,
            playerName: player.playerName,
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
