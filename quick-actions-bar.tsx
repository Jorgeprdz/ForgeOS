/*
|--------------------------------------------------------------------------
| MODULE: quick-actions-bar.tsx
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Fast operational actions.
|
|--------------------------------------------------------------------------
*/

'use client';

import {

    MessageCircle,
    Phone,
    Clock3

} from 'lucide-react';

const ICONS = {

    'message-circle':
        MessageCircle,

    phone:
        Phone,

    'clock-3':
        Clock3
};

export function QuickActionsBar({

    actions

}) {

    return (

        <div
            className='
                flex
                items-center
                justify-between
                gap-3
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-3
            '
        >

            {actions.map((action) => {

                const Icon =
                    ICONS[action.icon];

                return (

                    <button
                        key={action.id}
                        className='
                            flex
                            flex-1
                            flex-col
                            items-center
                            gap-1
                            rounded-xl
                            p-2
                            active:scale-95
                        '
                    >

                        <Icon
                            className='
                                h-5
                                w-5
                                text-zinc-200
                            '
                        />

                        <span
                            className='
                                text-[11px]
                                text-zinc-400
                            '
                        >
                            {action.label}
                        </span>

                    </button>
                );
            })}

        </div>
    );
}