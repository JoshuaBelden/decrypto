import { success, fail } from "./result.js"
import { keywords } from "../data/keywords.js"

const MIN_PLAYERS = 4
export const GAME_PHASE = {
  // Players are joining the game and selecting teams
  LOBBY: "LOBBY",

  // The game has started, teams have received their 4 keywords, and the round is beginning.
  // Encryptors are choosing their clues.
  // This phase is over when both team's encryptors have submitted 3 clues.
  // Each clue relates to the codes they received.
  MAIN_ENCRYPT: "MAIN_ENCRYPT",

  // All teams have have received the white team's encryptor's clues.
  // The black team is trying to guess the white team's codes.
  // The white team is trying to decode the white team's encrytor's clues.
  MAIN_WHITE_DECODE: "MAIN_WHITE",

  // The white team reveals the actual code and we decide if the black team
  // intercepted the code and if the white team decoded the clues.
  MAIN_WHITE_REVEAL: "MAIN_WHITE_REVEAL",

  // The white team has received the black team's encryptor's clues.
  // The white team is trying to guess the black team's codes.
  // The black team is trying to decode the black team's encrytor's clues.
  MAIN_BLACK_DECODE: "MAIN_BLACK_DECODE",

  // The black team reveals the actual code and we decide if the white team
  // intercepted the code and if the black team decoded the clues.
  MAIN_BLACK_REVEAL: "MAIN_BLACK_REVEAL",
  OVER: "OVER",
}

const Player = (playerId, playerName, socket) => {
  const ready = false
  return { playerId, playerName, ready, socket }
}

const Team = name => {
  const playerIds = []
  const currentEncryptorId = null
  return { name, playerIds, currentEncryptorId }
}

const Round = roundId => {
  const teamCodes = {
    White: [
      Math.floor(Math.random() * 4) + 1,
      Math.floor(Math.random() * 4) + 1,
      Math.floor(Math.random() * 4) + 1,
    ],
    Black: [
      Math.floor(Math.random() * 4) + 1,
      Math.floor(Math.random() * 4) + 1,
      Math.floor(Math.random() * 4) + 1,
    ],
  }

  const teamClues = {
    White: [],
    Black: [],
  }

  const teamGuesses = {
    White: [],
    Black: [],
  }

  return { roundId, teamCodes, teamClues, teamGuesses }
}

const Game = gameId => {
  const state = {
    phase: GAME_PHASE.LOBBY,
    currentRound: 0,
    rounds: [],
  }
  const players = []
  const teams = [Team("White"), Team("Black")]
  const transitionPhase = () => {
    switch (state.phase) {
      case GAME_PHASE.LOBBY:
        if (
          players.length >= MIN_PLAYERS &&
          players.every(player => player.ready)
        ) {
          setKeywords()
          setNextEncryptors()
          setNewRound()
          state.phase = GAME_PHASE.MAIN_ENCRYPT
        }
        break
      case GAME_PHASE.MAIN_ENCRYPT:
        const round = state.rounds.find(
          round => round.roundId === state.currentRound
        )
        if (
          round.teamClues.White.length === 3 &&
          round.teamClues.Black.length === 3
        ) {
          state.phase = GAME_PHASE.MAIN_WHITE
        }
        break
    }
  }

  // LOBBY METHODS
  const joinGame = (playerId, playerName, socket) => {
    if (players.some(player => player.playerId === playerId)) {
      return fail("Player is already in the game.")
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

    transitionPhase()

    return success()
  }

  // MAIN_ENCRYPT METHODS
  const setKeywords = () => {
    const whiteTeam = teams.find(team => team.name === "White")
    const blackTeam = teams.find(team => team.name === "Black")

    whiteTeam.keywords = []
    blackTeam.keywords = []

    for (let i = 0; i < 4; i++) {
      whiteTeam.keywords.push(
        keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0]
      )
      blackTeam.keywords.push(
        keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0]
      )
    }
  }

  const setNextEncryptors = () => {
    const whiteTeam = teams.find(team => team.name === "White")
    const blackTeam = teams.find(team => team.name === "Black")

    whiteTeam.currentEncryptorId = whiteTeam.playerIds[0]
    blackTeam.currentEncryptorId = blackTeam.playerIds[0]
  }

  const setNewRound = () => {
    state.currentRound++
    state.rounds.push(Round(state.currentRound))
  }

  // MAIN_WHITE METHODS
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

    const round = state.rounds.find(
      round => round.roundId === state.currentRound
    )
    round.teamClues[team.name] = [...clues]

    transitionPhase()

    return success()
  }

  return {
    gameId,
    state,
    players,
    teams,
    joinGame,
    joinTeam,
    playerReady,
    submitClues,
  }
}

export default Game
