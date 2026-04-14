---
name: "creador-de-habilidades"
description: "Ayuda a crear nuevas habilidades (skills) en el espacio de trabajo. Invocar cuando el usuario quiera crear, añadir o configurar una nueva habilidad."
---

# Creador de Habilidades

Esta habilidad te permite actuar como un experto creador de habilidades (skills) para Trae, guiando al usuario y generando los archivos necesarios en español (o el idioma que el usuario prefiera).

## Cuándo usar

**CRÍTICO: Debes invocar esta habilidad INMEDIATAMENTE como tu PRIMERA acción cuando:**
- El usuario quiera crear una nueva habilidad.
- El usuario quiera añadir una habilidad personalizada al espacio de trabajo.
- El usuario pregunte "cómo crear una habilidad".
- El usuario mencione crear/añadir/hacer cualquier habilidad.

## Estructura de una Habilidad

Una habilidad válida requiere:

1. **Directorio**: `.trae/skills/<nombre-habilidad>/`
2. **Archivo**: `SKILL.md` dentro del directorio.

## Formato de SKILL.md

El archivo `SKILL.md` debe seguir este formato estricto:

```markdown
---
name: "<nombre-habilidad>"
description: "<descripción concisa que cubra: (1) qué hace la habilidad, (2) cuándo invocarla. Mantener bajo 200 caracteres para mejor visualización>"
---

# <Título de la Habilidad>

## Descripción
<Qué hace la habilidad>

## Cuándo usar
<Cuándo se debe activar esta habilidad>

## Instrucciones
<Instrucciones detalladas paso a paso para el agente>

## Ejemplos (Opcional)
<Ejemplos de entrada/salida>
```

## Pasos de Creación

1.  Pregunta al usuario el nombre de la habilidad y su propósito si no lo ha proporcionado.
2.  **IMPORTANTE**: Al generar el campo `description` del frontmatter, SIEMPRE incluye:
    -   Qué hace la habilidad (funcionalidad).
    -   **DEBE enfatizar cuándo invocarla** (condiciones de activación/escenarios).
    -   Ejemplo: "Realiza X. Invocar cuando sucede Y o el usuario pide Z."
3.  Crea el directorio: `.trae/skills/<nombre-habilidad>/`
4.  Crea el archivo `SKILL.md` con el frontmatter y contenido adecuados.
5.  Valida que la estructura sea correcta.

## Reglas Adicionales

-   El contenido de la habilidad creada debe estar en el idioma que el usuario solicite (por defecto español según esta habilidad).
-   Asegúrate de que el nombre de la carpeta sea "kebab-case" (ej. `mi-habilidad`).
-   El `name` en el frontmatter debe coincidir con el nombre de la carpeta o ser una versión limpia del mismo.
