/*
|--------------------------------------------------------------------------
| MODULE: dashboard-widget-card.tsx
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Dashboard operational widget.
|
|--------------------------------------------------------------------------
*/

'use client';

export function DashboardWidgetCard({

    title,

    children

}) {

    return (

        <div
            className='
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
            '
        >

            <h3
                className='
                    text-sm
                    font-semibold
                    text-white
                '
            >
                {title}
            </h3>

            <div
                className='
                    mt-4
                '
            >
                {children}
            </div>

        </div>
    );
}