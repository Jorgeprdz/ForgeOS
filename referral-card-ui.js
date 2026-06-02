/*
|--------------------------------------------------------------------------
| MODULE: referral-card-ui.js
|--------------------------------------------------------------------------
|
| Cards visuales de referidos.
|
|--------------------------------------------------------------------------
*/

export function renderReferralCard({

    referral = {}

}) {

    return `

<div class="referral-card ${referral.temperatura}">

    <div class="referral-header">

        <h3>
            ${referral.nombre}
        </h3>

        <span class="temperature">

            ${referral.temperatura}

        </span>

    </div>

    <div class="referral-body">

        <p>
            ${referral.telefono}
        </p>

        <p>
            Status:
            ${referral.status}
        </p>

    </div>

    <div class="referral-actions">

        <button
            data-action="whatsapp"
        >
            💬
        </button>

        <button
            data-action="call"
        >
            📞
        </button>

        <button
            data-action="followup"
        >
            🔁
        </button>

    </div>

</div>
    `;
}