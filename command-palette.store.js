/*
|--------------------------------------------------------------------------
| MODULE: command-palette.store.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Command palette global state.
|
|--------------------------------------------------------------------------
*/

import { create } from 'zustand';

export const useCommandPalette =
    create((set) => ({

        opened:
            false,

        query:
            '',

        recentCommands: [],

        open:
            () =>
                set({
                    opened: true
                }),

        close:
            () =>
                set({
                    opened: false
                }),

        setQuery:
            (query) =>
                set({
                    query
                }),

        pushRecentCommand:
            (command) =>
                set((state) => ({

                    recentCommands: [

                        command,

                        ...state.recentCommands
                    ].slice(0, 8)
                }))
    }));