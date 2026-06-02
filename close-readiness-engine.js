export function calcularCloseReadiness({

    needsDiscoveryCompleted,

    proposalPresented,

    objectionsRemaining = 0,

    engagementScore = 0,

    followupCount = 0

}) {

    let score = 0;

    if (needsDiscoveryCompleted)
        score += 25;

    if (proposalPresented)
        score += 25;

    if (engagementScore >= 80)
        score += 25;

    if (followupCount >= 3)
        score += 15;

    if (objectionsRemaining === 0)
        score += 10;

    return score;
}