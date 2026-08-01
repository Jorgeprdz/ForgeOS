# FORGE CARTERA — Pages Runtime Asset Hotfix 001

## Problema reproducido

La ruta pública Material 3 de Cartera resolvía correctamente `?nav=cartera`, pero al hidratar la sesión intentaba importar:

```text
/ForgeOS/supabase-runtime.js
```

El módulo existía en el repositorio, pero no en el artefacto publicado por GitHub Pages. La aceptación anterior servía el repositorio completo con `python -m http.server`, por lo que no reproducía la frontera real de publicación.

## Causa raíz

El generador de Pages publicaba la carpeta Material 3, Reporting, Smart Widgets y FES, pero no la clausura transitiva de módulos JavaScript utilizada por `cartera-module.js`.

```text
LOCAL_REPOSITORY_RUNTIME=AVAILABLE
PAGES_ARTIFACT_RUNTIME=INCOMPLETE
SUPABASE_CONNECTION_FAILURE=MODULE_ASSET_404
AUTHENTICATION_FAILURE=NO
DATABASE_FAILURE=NO_EVIDENCE
```

## Reparación

El generador existente ahora:

1. parte de los entrypoints productivos de Cartera;
2. descubre recursivamente todos los imports locales relativos;
3. rechaza imports faltantes, no JavaScript, fuera del repositorio o dependencias desde `docs/`;
4. copia cada módulo conservando exactamente su ruta relativa bajo `docs/`;
5. verifica identidad byte a byte;
6. crea un manifiesto determinista;
7. agrega los archivos generados al índice temporal para que `git ls-files` los incluya en `_site`;
8. mantiene una sola fuente canónica y no compromete duplicados generados.

## Entrypoints

```text
supabase-runtime.js
memory-manager.js
state-manager.js
cartera.js
Cartera 030D
Cartera 040D
Cartera 050D
Cartera 060D
Cartera 070D
Cartera 080D
Cartera 090D
Cartera 100D
```

## Límites

```text
SUPABASE_SCHEMA_MUTATION=NO
SUPABASE_DATA_MUTATION=NO
ACCOUNT_MUTATION=NO
AUTH_CREDENTIAL_MUTATION=NO
PRODUCT_UI_BEHAVIOR_MUTATION=NO
CARTERA_DOMAIN_MUTATION=NO
DEMO_MODE=NOT_INCLUDED
MAIN_MUTATION=NO
MERGE_AUTHORIZATION=NOT_GRANTED
```

## Aceptación requerida

```text
GENERATOR_SYNTAX=PASS
DEPENDENCY_CLOSURE=PASS
GENERATED_BYTE_IDENTITY=PASS
GENERATED_PATHS_STAGED=PASS
SUPABASE_RUNTIME_PUBLIC_ASSET=PASS
CARTERA_RUNTIME_PUBLIC_ASSET=PASS
ENHANCER_ENTRYPOINTS_PUBLIC=PASS
PAGES_DEPLOYMENT=PENDING_CONTROLLED_MERGE
LIVE_AUTHENTICATED_CARTERA=PENDING_POSTMERGE
```

## Estado

```text
TASK_1=CARTERA_PAGES_SUPABASE_RUNTIME_FIX
IMPLEMENTATION=COMPLETE
PR_ACCEPTANCE=PENDING
MERGED=NO
NEXT=RUN_NATIVE_PR_ACCEPTANCE
```
