import PhaseManager, {GAME_PHASE } from '../lib/phaseManager.js'
import RoundManager from "../lib/roundManager.js"

describe("PhaseManager", () => {
  it("should return the current phase", () => {
    // ARRANGE
    const roundManager = RoundManager()
    const phaseManager = PhaseManager(roundManager)

    // ACT
    const currentPhase = phaseManager.currentPhase()

    // ASSERT
    expect(currentPhase).toBe(GAME_PHASE.LOBBY)
  })
})