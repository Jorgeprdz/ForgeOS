/*
|--------------------------------------------------------------------------
| MODULE: command-palette.tsx
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Operational command palette.
|
|--------------------------------------------------------------------------
*/

'use client';

import { useMemo } from 'react';

import { Search } from 'lucide-react';

import { COMMANDS }
    from './command-registry';

import { buscarComandos }
    from './command-search-engine';

import { useCommandPalette }
    from './command-palette.store';

export function CommandPalette() {

    const {

        opened,

        query,

        setQuery

    } = useCommandPalette();

    const results =
        useMemo(() => {

            return buscarComandos({

                query,

                commands:
                    COMMANDS
            });

        }, [query]);

    if (!opened) {

        return null;
    }

    return (

        <div
            className='
                fixed
                inset-0
                z-50
                bg-black/60
                backdrop-blur-sm
            '
        >

            <div
                className='
                    mx-auto
                    mt-24
                    w-[92%]
                    max-w-2xl
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    p-4
                '
            >

                <div
                    className='
                        flex
                        items-center
                        gap-3
                        border-b
                        border-zinc-800
                        pb-3
                    '
                >

                    <Search
                        className='
                            h-5
                            w-5
                            text-zinc-500
                        '
                    />

                    <input
                        autoFocus

                        value={query}

                        onChange={(e) =>
                            setQuery(
                                e.target.value
                            )
                        }

                        placeholder='Buscar comando...'

                        className='
                            w-full
                            bg-transparent
                            text-sm
                            text-white
                            outline-none
                            placeholder:text-zinc-500
                        '
                    />

                </div>

                <div
                    className='
                        mt-3
                        flex
                        flex-col
                    '
                >

                    {results.map((result) => (

                        <button
                            key={result.id}

                            className='
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                p-3
                                text-left
                                hover:bg-zinc-900
                            '
                        >

                            <div>

                                <p
                                    className='
                                        text-sm
                                        text-white
                                    '
                                >
                                    {result.label}
                                </p>

                                <p
                                    className='
                                        mt-1
                                        text-xs
                                        text-zinc-500
                                    '
                                >
                                    {result.command}
                                </p>

                            </div>

                        </button>
                    ))}

                </div>

            </div>

        </div>
    );
}