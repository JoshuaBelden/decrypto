import { success, fail } from "./result.js"
import { keywords } from "../data/keywords.js"

const MIN_PLAYERS = 4
export const GAME_PHASE = {
  // Players are joining the game and selecting teams
  LOBBY: "LOBBY",

  // Players have joined teams, teams have received their 4 keywords and encryptors have been selected.
  // Encryptors now need to submit their clues.
  MAIN_ENCRYPT: "MAIN_ENCRYPT",

  // Encryptors have submitted their clues.
  // Players now need to intercept the other team's clues by submitting guesses.
  MAIN_INTERCEPT: "MAIN_INTERCEPT",

  // Players have submitted their intercepts.
  // Players now need to decode their encryptor's clues.
  MAIN_DECODE: "MAIN_DECODE",

  // All guesses have been submitted.
  // Time to determine the score for the round.
  MAIN_REVEAL: "MAIN_REVEAL",

  OVER: "OVER",
}

const Player = (playerId, playerName, socket) => {
  const ready = false
  return { playerId, playerName, ready, socket }
}

const Team = name => {
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

  const teamInterceptGuesses = {
    White: [],
    Black: [],
  }

  const teamDecodeGuesses = {
    White: [],
    Black: [],
  }

  const teamPlayersReadyForNextRound = {
    White: [],
    Black: [],
  }

  return {
    roundId,
    teamCodes,
    teamClues,
    teamInterceptGuesses,
    teamDecodeGuesses,
    teamPlayersReadyForNextRound,
  }
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
    const round = state.rounds.find(
      round => round.roundId === state.currentRound
    )

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
        if (
          round.teamClues.White.length === 3 &&
          round.teamClues.Black.length === 3
        ) {
          state.phase = GAME_PHASE.MAIN_INTERCEPT
        }
        break
      case GAME_PHASE.MAIN_INTERCEPT:
        if (
          round.teamInterceptGuesses.White.length === 3 &&
          round.teamInterceptGuesses.Black.length === 3
        ) {
          state.phase = GAME_PHASE.MAIN_DECODE
        }
        break
      case GAME_PHASE.MAIN_DECODE:
        if (
          round.teamDecodeGuesses.White.length === 3 &&
          round.teamDecodeGuesses.Black.length === 3
        ) {
          const gameOver = determineScore()
          if (gameOver) {
            state.phase = GAME_PHASE.OVER
          } else {
            setNextEncryptors()
            setNewRound()
            state.phase = GAME_PHASE.MAIN_REVEAL
          }
        }
        break
      case GAME_PHASE.MAIN_REVEAL:
        if (
          round.teamPlayersReadyForNextRound.White.every(Boolean) &&
          round.teamPlayersReadyForNextRound.Black.every(Boolean)
        ) {
          state.phase = GAME_PHASE.MAIN_ENCRYPT
        }
        break
    }
  }

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

  const submitInterceptGuess = (teamName, guess) => {
    const team = teams.find(team => team.name === teamName)
    const round = state.rounds.find(
      round => round.roundId === state.currentRound
    )
    round.teamInterceptGuesses[team.name] = [...guess]

    transitionPhase()

    return success()
  }

  const submitDecodeGuess = (teamName, guess) => {
    const team = teams.find(team => team.name === teamName)
    const round = state.rounds.find(
      round => round.roundId === state.currentRound
    )
    round.teamDecodeGuesses[team.name] = [...guess]

    transitionPhase()

    return success()
  }

  const submitReadyForNextRound = playerId => {
    const player = players.find(player => player.playerId === playerId)
    if (!player) {
      return fail("Player is not in the game.")
    }

    const team = teams.find(team =>
      team.playerIds.some(id => id === playerId)
    )
    if (!team) {
      return fail("Player must be on a team to be ready for the next round.")
    }

    const round = state.rounds.find(
      round => round.roundId === state.currentRound
    )
    round.teamPlayersReadyForNextRound[team.name].push(playerId)

    transitionPhase()

    return success()
  }

  const determineScore = () => {
    const round = state.rounds.find(
      round => round.roundId === state.currentRound
    )

    const whiteTeam = teams.find(team => team.name === "White")
    const blackTeam = teams.find(team => team.name === "Black")

    const whiteIntercepted = arraysAreEqual(
      round.teamInterceptGuesses.White,
      round.teamCodes.Black
    )
    const whiteMiscommunicated = !arraysAreEqual(
      round.teamDecodeGuesses.White,
      round.teamCodes.White
    )
    const blackIntercepted = arraysAreEqual(
      round.teamInterceptGuesses.Black,
      round.teamCodes.White
    )
    const balckMiscommunicated = !arraysAreEqual(
      round.teamDecodeGuesses.Black,
      round.teamCodes.Black
    )

    if (whiteIntercepted) {
      whiteTeam.intercepts++
    }

    if (whiteMiscommunicated) {
      whiteTeam.miscommunications++
    }

    if (blackIntercepted) {
      blackTeam.intercepts++
    }

    if (balckMiscommunicated) {
      blackTeam.miscommunications++
    }

    return (
      whiteTeam.intercepts >= 2 ||
      whiteTeam.miscommunications >= 2 ||
      blackTeam.intercepts >= 2 ||
      blackTeam.miscommunications >= 2
    )
  }

  const arraysAreEqual = (a, b) => {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
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
    submitInterceptGuess,
    submitDecodeGuess,
    submitReadyForNextRound,
  }
}

export default Game
