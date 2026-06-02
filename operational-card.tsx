/*
|--------------------------------------------------------------------------
| MODULE: operational-card.tsx
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Base operational card component.
|
|--------------------------------------------------------------------------
*/

'use client';

export function OperationalCard({

    children,

    className = ''

}) {

    return (

        <div
            className={`
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
                shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
                ${className}
            `}
        >

            {children}

        </div>
    );
}