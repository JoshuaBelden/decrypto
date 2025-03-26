export const REQUEST_TYPE = {
  JOIN_GAME: "joinGame",
  JOIN_TEAM: "joinTeam",
  ADD_BOTS: "addBots",
  PLAYER_READY: "playerReady",
  SUBMIT_CLUES: "submitClues",
  SUBMIT_INTERCEPT_GUESS: "submitInterceptGuess",
  SUBMIT_DECODE_GUESS: "submitDecodeGuess",
  SUBMIT_READY_FOR_NEXT_ROUND: "submitReadyForNextRound",
}

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
