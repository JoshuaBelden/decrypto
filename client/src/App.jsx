import { useCallback, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { REQUEST_TYPE, GAME_PHASE } from "./lib/constants"
import Socket from "./lib/socket"
import Join from "./components/join"
import Lobby from "./components/lobby"
import Round from "./components/round"

const App = () => {
  const [connection, setConnection] = useState()
  const [connectionError, setConnectionError] = useState()
  const [gameContext, setGameContext] = useState({})
  const [gameInstance, setGameInstance] = useState()

  const onConnected = useCallback(() => {
    console.debug("[decrypto] connected to server")

    if (!gameContext.gameId) throw new Error("gameId has not been set")

    const { gameId, playerId, playerName } = gameContext
    connection.send(REQUEST_TYPE.JOIN_GAME, { gameId, playerId, playerName })

    connection.send(REQUEST_TYPE.ADD_BOTS, { gameId, playerId })

    console.debug("[decrypto] join_game request sent")
  }, [gameContext, connection])

  const onResponse = useCallback(response => {
    if (response.error) {
      setConnectionError(response.error)
      console.error("[decrypto] server error received: ", response.error)
      return
    } else {
      setConnectionError()
    }

    setGameInstance(response.gameInstance)
    console.debug("[decrypto] response received: ", response)
  }, [])

  const onDisconnected = useCallback(() => {
    console.debug("[decrypto] connection disconnected")
  }, [])

  const onError = useCallback(error => {
    setConnectionError(error)
    console.error("[decrypto] connection error received: ", error)
  }, [])

  const onJoin = (gameId, playerName) => {
    const playerId = localStorage.getItem("playerId") || uuidv4()
    if (!localStorage.getItem("playerId")) {
      localStorage.setItem("playerId", playerId)
    }

    setGameContext({
      gameId,
      playerId,
      playerName,
    })
    console.debug("[decrypto] game context set: ", {
      gameId,
      playerId,
      playerName,
    })
  }

  const onJoinTeam = teamName => {
    const { gameId, playerId } = gameContext
    connection.send(REQUEST_TYPE.JOIN_TEAM, { gameId, playerId, teamName })
    console.debug("[decrypto] join_team request sent: ", {
      gameId,
      playerId,
      teamName,
    })
  }

  const onPlayerReady = () => {
    const { gameId, playerId } = gameContext
    connection.send(REQUEST_TYPE.PLAYER_READY, {
      gameId,
      playerId,
      ready: true,
    })
    console.debug("[decrypto] player_ready request sent: ", {
      gameId,
      playerId,
    })
  }

  useEffect(() => {
    setConnection(Socket())
    console.debug("[decrypto] connection initialized")
  }, [])

  useEffect(() => {
    const { gameId, playerId, playerName } = gameContext
    if (!gameId) return
    if (!connection) return

    connection.connect(
      gameId,
      playerId,
      playerName,
      onConnected,
      onResponse,
      onDisconnected,
      onError
    )
    console.debug("[decrypto] connection requested")
  }, [
    gameContext,
    connection,
    onConnected,
    onResponse,
    onDisconnected,
    onError,
  ])

  return (
    <div className="app-container">
      {!gameInstance && <Join onJoin={onJoin} />}
      {gameInstance && gameInstance.currentPhase === GAME_PHASE.LOBBY && (
        <Lobby
          gameContext={gameContext}
          gameInstance={gameInstance}
          onJoinTeam={onJoinTeam}
          onReady={onPlayerReady}
        />
      )}
      {gameInstance &&
        gameInstance.currentPhase !== GAME_PHASE.LOBBY &&
        !gameInstance.currentPhase !== GAME_PHASE.OVER && (
          <Round gameContext={gameContext} gameInstance={gameInstance} />
        )}

      {connectionError && (
        <div className="app-container__error">
          <p>{connectionError}</p>
        </div>
      )}
    </div>
  )
}

export default App
