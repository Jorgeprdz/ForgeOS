/*
|--------------------------------------------------------------------------
| MODULE: drag-drop-policy-zone.js
|--------------------------------------------------------------------------
|
| Zona drag & drop para pólizas.
|
|--------------------------------------------------------------------------
*/

export function inicializarDropZone({

    elementId = '',

    onFiles = () => {}

}) {

    const zone =
        document.getElementById(
            elementId
        );

    if (!zone) {

        return;
    }

    /*
    |--------------------------------------------------------------------------
    | Drag over
    |--------------------------------------------------------------------------
    */

    zone.addEventListener(

        'dragover',

        event => {

            event.preventDefault();

            zone.classList.add(
                'dragging'
            );
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Drag leave
    |--------------------------------------------------------------------------
    */

    zone.addEventListener(

        'dragleave',

        () => {

            zone.classList.remove(
                'dragging'
            );
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Drop
    |--------------------------------------------------------------------------
    */

    zone.addEventListener(

        'drop',

        event => {

            event.preventDefault();

            zone.classList.remove(
                'dragging'
            );

            const files =

                Array.from(
                    event.dataTransfer.files
                );

            onFiles(files);
        }
    );
}