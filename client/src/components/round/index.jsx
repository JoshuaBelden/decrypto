import "./styles.scss"

const Round = ({ gameContext, gameInstance }) => {
  const team = gameInstance.teams.find(team => team.playerIds.some(playerId => playerId === gameContext.playerId))

  const encryptor = gameInstance.players.find(player => player.playerId === team.currentEncryptorId);
  const isEncryptor = encryptor.playerId === gameContext.playerId;

  return <div className="round">
    <h2>Round {team.name}</h2>
    <div>
      Your teams Keywords
      {
        team.keywords.map((keyword, index) => <div key={index}>{index+1}: {keyword}</div>)
      }

      {!isEncryptor && <div>
        Waiting on {encryptor.playerName} to encrypt their code
        </div>}


    </div>
  </div>
}

export default Round
