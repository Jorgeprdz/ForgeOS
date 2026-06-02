/*
|--------------------------------------------------------------------------
| MODULE: smart-header.tsx
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Dynamic contextual operational header.
|
|--------------------------------------------------------------------------
*/

'use client';

import { Flame } from 'lucide-react';

export function SmartHeader({

    title,

    subtitle

}) {

    return (

        <div
            className='
                rounded-2xl
                border
                border-orange-500/20
                bg-orange-500/10
                p-4
            '
        >

            <div
                className='
                    flex
                    items-start
                    gap-3
                '
            >

                <Flame
                    className='
                        mt-1
                        h-5
                        w-5
                        text-orange-400
                    '
                />

                <div>

                    <p
                        className='
                            text-sm
                            font-semibold
                            text-white
                        '
                    >
                        {title}
                    </p>

                    <p
                        className='
                            mt-1
                            text-xs
                            text-zinc-400
                        '
                    >
                        {subtitle}
                    </p>

                </div>

            </div>

        </div>
    );
}