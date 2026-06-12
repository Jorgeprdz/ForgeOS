/*
|--------------------------------------------------------------------------
| Neural Glow Engine
|--------------------------------------------------------------------------
|
| Controla estados visuales IA:
| - idle
| - thinking
| - warning
| - success
|
|--------------------------------------------------------------------------
*/

export function obtenerGlowState({

    thinking = false,

    warning = false,

    success = false

}) {

    if (warning) {

        return {

            state: 'warning',

            glow:
                'rgba(255,149,0,0.35)',

            pulse: 'fast'
        };
    }

    if (success) {

        return {

            state: 'success',

            glow:
                'rgba(52,199,89,0.30)',

            pulse: 'medium'
        };
    }

    if (thinking) {

        return {

            state: 'thinking',

            glow:
                'rgba(123,97,255,0.35)',

            pulse: 'slow'
        };
    }

    return {

        state: 'idle',

        glow:
            'rgba(79,140,255,0.15)',

        pulse: 'breathing'
    };
}