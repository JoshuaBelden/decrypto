import "./styles.scss"

const Lobby = ({ gameContext, gameInstance, onJoinTeam, onReady: onPlayerReady }) => {
  const currentPlayer = gameInstance.players.find(player => player.playerId === gameContext.playerId)

  const currentPlayersTeam = () => {
    return gameInstance.teams.find(team =>
      team.playerIds.includes(gameContext.playerId)
    )
  }

  const joinTeam = teamName => {
    onJoinTeam(teamName)
  }

  const playerReady = () => {
    onPlayerReady()
  }

  return (
    <div className="lobby">
      <h1>Lobby - {gameInstance.gameId}</h1>
      {currentPlayer.ready && <p>Waiting for other players...</p>}
      {!currentPlayer.ready && <button onClick={playerReady}>Ready</button>}
      {gameInstance.teams &&
        gameInstance.teams.map(team => (
          <div key={team.name}>
            <h2>{team.name} Team</h2>
            {currentPlayersTeam() !== team && (
              <button onClick={() => joinTeam(team.name)}>join</button>
            )}
            <div>
              <ul>
                {team.playerIds.map(playerId => {
                  const player = gameInstance.players.find(
                    player => player.playerId === playerId
                  )
                  return (
                    <li key={playerId}>
                      {player.playerName}
                      {player.ready && " - ready"}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ))}
    </div>
  )
}

export default Lobby
