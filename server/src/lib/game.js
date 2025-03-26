import { success, fail } from "./result.js"
import { keywords } from "../data/keywords.js"

const Player = (playerId, playerName, socket, isBot = false) => {
  if (!playerId) throw new Error("Player requires a player ID.")
  if (!playerName) throw new Error("Player requires a player name.")

  const ready = false
  return { playerId, playerName, ready, socket }
}

const Team = name => {
  if (!name) throw new Error("Team requires a name.")

  const playerIds = []
  const keywords = []
  const currentEncryptorId = null
  const intercepts = 0
  const miscommunications = 0
  return {
    name,
    playerIds,
    keywords,
    currentEncryptorId,
    intercepts,
    miscommunications,
  }
}

const Game = (gameId, phaseManager, roundManager) => {
  if (!gameId) throw new Error("Game requires a game ID.")
  if (!phaseManager) throw new Error("Game requires a phase manager.")
  if (!roundManager) throw new Error("Game requires a round manager.")

  const players = []
  const teams = [Team("White"), Team("Black")]

  const joinGame = (playerId, playerName, socket) => {
    if (players.some(player => player.playerId === playerId)) {
      const player = players.find(player => player.playerId === playerId)
      player.playerName = playerName
      player.socket = socket
      return success()
    }

    players.push(Player(playerId, playerName, socket))
    return success()
  }

  const joinTeam = (playerId, teamName) => {
    const player = players.find(player => player.playerId === playerId)
    if (!player) {
      return fail("You must join a game before joining a team.")
    }

    const team = teams.find(team => team.name === teamName)
    if (!team) {
      return fail(`Team ${teamName} does not exist.`)
    }

    if (team.playerIds.some(id => id === playerId)) {
      return fail("Player is already on the team.")
    }

    // Remove the player from all teams and then re-add them to the correct team
    teams.forEach(team => {
      team.playerIds = team.playerIds.filter(id => id !== playerId)
    })
    team.playerIds.push(player.playerId)

    return success()
  }

  const addBots = () => {
    const botIds = ["bot1", "bot2", "bot3", "bot4"]
    const botNames = ["Alice", "Bob", "Charlie", "David"]

    botIds.forEach((botId, index) => {
      if (players.find(player => player.playerId === botId)) {
        return
      }

      const bot = Player(botId, botNames[index], null, true)
      bot.ready = true
      players.push(bot)
      joinTeam(botId, index % 2 === 0 ? "White" : "Black")
    })

    return success()
  }

  const playerReady = (playerId, ready) => {
    const player = players.find(player => player.playerId === playerId)
    if (!player) {
      return fail("Player is not in the game.")
    }

    const onTeam = teams.find(team =>
      team.playerIds.some(id => id === playerId)
    )
    if (!onTeam) {
      return fail("Player must be on a team to be ready.")
    }

    player.ready = ready

    phaseManager.transition(players, teams)

    return success()
  }

  const submitClues = (encryptorId, clues) => {
    const player = players.find(player => player.playerId === encryptorId)
    if (!player) {
      return fail("Player is not in the game.")
    }

    const team = teams.find(team =>
      team.playerIds.some(id => id === encryptorId)
    )
    if (!team) {
      return fail("Player must be on a team to submit clues.")
    }

    if (team.currentEncryptorId !== encryptorId) {
      return fail("Player is not the current encryptor.")
    }

    const currentRound = roundManager.currentRound()
    currentRound.teamClues[team.name] = [...clues]

    phaseManager.transition(players, teams)

    return success()
  }

  const submitInterceptGuess = (teamName, guess) => {
    const team = teams.find(team => team.name === teamName)
    const currentRound = roundManager.currentRound()
    currentRound.teamInterceptGuesses[team.name] = [...guess]

    phaseManager.transition(players, teams)

    return success()
  }

  const submitDecodeGuess = (teamName, guess) => {
    const team = teams.find(team => team.name === teamName)
    const currentRound = roundManager.currentRound()
    currentRound.teamDecodeGuesses[team.name] = [...guess]

    phaseManager.transition(players, teams)

    return success()
  }

  const submitReadyForNextRound = playerId => {
    const player = players.find(player => player.playerId === playerId)
    if (!player) {
      return fail("Player is not in the game.")
    }

    const team = teams.find(team => team.playerIds.some(id => id === playerId))
    if (!team) {
      return fail("Player must be on a team to be ready for the next round.")
    }

    const currentRound = roundManager.currentRound()
    currentRound.teamPlayersReadyForNextRound[team.name].push(playerId)

    phaseManager.transition(players, teams)

    return success()
  }

  return {
    gameId,
    players,
    teams,
    joinGame,
    joinTeam,
    addBots,
    playerReady,
    submitClues,
    submitInterceptGuess,
    submitDecodeGuess,
    submitReadyForNextRound,
    phaseManager,
    roundManager,
  }
}

export default Game
