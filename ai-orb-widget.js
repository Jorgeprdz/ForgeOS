/*
|--------------------------------------------------------------------------
| AI Orb Widget
|--------------------------------------------------------------------------
*/

export function renderAIOrb({

    mood = 'idle'

}) {

    return `

        <div
            class="
                ai-orb
                ai-orb-${mood}
            "
        >

            <div
                class="orb-core"
            ></div>

        </div>

    `;
}