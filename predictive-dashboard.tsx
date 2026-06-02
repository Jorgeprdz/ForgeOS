/*
|--------------------------------------------------------------------------
| MODULE: predictive-dashboard.tsx
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Living predictive dashboard.
|
|--------------------------------------------------------------------------
*/

'use client';

import { DashboardWidgetCard }
    from './dashboard-widget-card';

export function PredictiveDashboard({

    widgets

}) {

    return (

        <div
            className='
                flex
                flex-col
                gap-4
            '
        >

            {widgets.map((widget) => (

                <DashboardWidgetCard
                    key={widget.type}
                    title={widget.title}
                >

                    <pre
                        className='
                            text-xs
                            text-zinc-400
                            overflow-auto
                        '
                    >
                        {
                            JSON.stringify(
                                widget.payload,
                                null,
                                2
                            )
                        }
                    </pre>

                </DashboardWidgetCard>

            ))}

        </div>
    );
}