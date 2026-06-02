/*
|--------------------------------------------------------------------------
| Objection Battle Engine
|--------------------------------------------------------------------------
*/

const OBJECTIONS = {

    caro: {

        emotional:
`
Entiendo totalmente.
Normalmente cuando alguien siente eso,
es porque quiere asegurarse
de tomar una buena decisión.
`,

        logical:
`
La mayoría de las personas
no buscan lo más barato,
buscan lo más sólido
cuando ocurre un problema real.
`,

        close:
`
¿Te parece si te enseño
cómo funciona realmente?
`
    },

    pensarlo: {

        emotional:
`
Claro,
es una decisión importante.
`,

        logical:
`
Normalmente ayuda mucho
resolver primero todas las dudas.
`,

        close:
`
¿Hay algo específico
que quieras analizar?
`
    }
};

export function resolverObjecion(

    key = 'pensarlo'

) {

    const obj =
        OBJECTIONS[key]
        || OBJECTIONS.pensarlo;

    return {

        full:
`
${obj.emotional}

${obj.logical}

${obj.close}
            `.trim(),

        ...obj
    };
}