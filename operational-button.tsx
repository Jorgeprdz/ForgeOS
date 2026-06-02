/*
|--------------------------------------------------------------------------
| MODULE: operational-button.tsx
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Base operational button.
|
|--------------------------------------------------------------------------
*/

'use client';

export function OperationalButton({

    children,

    variant = 'primary',

    onClick

}) {

    const variants = {

        primary:
            `
                bg-white
                text-black
            `,

        secondary:
            `
                bg-zinc-900
                text-white
                border
                border-zinc-800
            `,

        ghost:
            `
                bg-transparent
                text-zinc-300
            `
    };

    return (

        <button
            onClick={onClick}

            className={`
                min-h-[48px]
                rounded-2xl
                px-5
                text-sm
                font-medium
                transition-all
                active:scale-[0.98]
                ${variants[variant]}
            `}
        >

            {children}

        </button>
    );
}