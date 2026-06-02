/*
|--------------------------------------------------------------------------
| MODULE: csv-parser-engine.js
|--------------------------------------------------------------------------
|
| Parser CSV.
|
|--------------------------------------------------------------------------
*/

export async function parsearCSV({

    file

}) {

    const text =
        await file.text();

    const lines =
        text.split('\n');

    /*
    |--------------------------------------------------------------------------
    | Headers
    |--------------------------------------------------------------------------
    */

    const headers =

        lines[0]

        .split(',')

        .map(

            item =>
                item.trim()
        );

    /*
    |--------------------------------------------------------------------------
    | Rows
    |--------------------------------------------------------------------------
    */

    const rows =

        lines

        .slice(1)

        .map(

            line => {

                const values =
                    line.split(',');

                const row = {};

                headers.forEach(

                    (header, index) => {

                        row[header] =
                            values[index];
                    }
                );

                return row;
            }
        );

    return {

        headers,

        totalRows:
            rows.length,

        rows
    };
}