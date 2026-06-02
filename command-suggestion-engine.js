/*
|--------------------------------------------------------------------------
| MODULE: command-suggestion-engine.js
|--------------------------------------------------------------------------
|
| Smart command suggestions.
|
|--------------------------------------------------------------------------
*/

export function sugerirComandos({

    query = ''

}) {

    const commands = [

        '/whatsapp',
        '/renewals',
        '/followups',
        '/new-policy',
        '/call',
        '/income',
        '/risk'
    ];

    return commands.filter(

        command =>

            command.includes(
                query.toLowerCase()
            )
    );
}