/*
|--------------------------------------------------------------------------
| MODULE: command-search-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Smart command search engine.
|
|--------------------------------------------------------------------------
*/

export function buscarComandos({

    query,

    commands = []
}) {

    if (!query) {

        return commands;
    }

    const normalizedQuery =
        query
            .toLowerCase()
            .trim();

    return commands.filter((command) => {

        const labelMatch =
            command.label
                .toLowerCase()
                .includes(normalizedQuery);

        const commandMatch =
            command.command
                .toLowerCase()
                .includes(normalizedQuery);

        const keywordMatch =
            command.keywords.some((keyword) =>
                keyword.includes(normalizedQuery)
            );

        return (
            labelMatch ||
            commandMatch ||
            keywordMatch
        );
    });
}