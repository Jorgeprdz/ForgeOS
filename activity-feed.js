/*
|--------------------------------------------------------------------------
| Activity Feed
|--------------------------------------------------------------------------
*/

export function renderActivityFeed(
    events = []
) {

    return `

        <div
            class="activity-feed"
        >

            ${
                events.map(event => `

                    <div
                        class="activity-item"
                    >

                        <strong>
                            ${event.title}
                        </strong>

                        <small>
                            ${event.time}
                        </small>

                    </div>

                `).join('')
            }

        </div>

    `;
}