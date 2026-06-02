/*
|--------------------------------------------------------------------------
| MODULE: operational-shell.store.ts
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Operational UX brain.
|
| Controls:
| - operational state
| - overlays
| - quick actions
| - contextual UI behavior
|
|--------------------------------------------------------------------------
*/

import { create } from 'zustand';

export const useOperationalShell =
    create((set) => ({

        mode:
            'dashboard',

        smartHeader:
            null,

        overlays: {

            commandPalette:
                false,

            quickNote:
                false,

            followupDrawer:
                false
        },

        quickActions: [

            {
                id: 'whatsapp',

                label: 'WhatsApp',

                icon: 'message-circle',

                command: '/whatsapp'
            },

            {
                id: 'call',

                label: 'Call',

                icon: 'phone',

                command: '/call'
            },

            {
                id: 'followup',

                label: 'Followup',

                icon: 'clock-3',

                command: '/followup'
            }
        ],

        floatingAction: {

            label:
                'Continue Followup',

            command:
                '/continue-followup',

            icon:
                'sparkles'
        },

        setMode:
            (mode) =>
                set({
                    mode
                }),

        setSmartHeader:
            (smartHeader) =>
                set({
                    smartHeader
                }),

        toggleOverlay:
            (overlay) =>
                set((state) => ({

                    overlays: {

                        ...state.overlays,

                        [overlay]:
                            !state.overlays[overlay]
                    }
                }))
    }));