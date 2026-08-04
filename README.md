---
id: laboratorio-guardia-sigilo
titulo: Laboratorio Guardia de Sigilo
tipo: indice
audiencia: estudiante
acceso: publico
version: 2
---

# Laboratorio Guardia de Sigilo

Proyecto canónico de PIAPC 2026 para aplicar desarrollo agéntico e inteligencia artificial de videojuegos.

## Estado

H0, H1 y H2 implementados: escenario base, repositorio preparado para agentes y navegación observable mediante BFS y A*. El seguimiento de rutas y la percepción se incorporan en H3.

## Ejecución

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

Validación completa:

```bash
npm run validate
```

En la escena:

- WASD o flechas: mover al jugador.
- Clic: elegir un destino para el guardia.
- Espacio: comparar BFS y A*.
- R: reiniciar el escenario.

## Propósito

Construir un juego 2D cenital mínimo donde un guardia:

- patrulla puntos definidos;
- percibe al jugador mediante visión y sonido;
- conserva una última posición conocida;
- navega mediante A*;
- sigue caminos sin mezclar búsqueda y locomoción;
- decide mediante una máquina de estados;
- expone telemetría suficiente para comprender y probar su conducta.

El proyecto no busca producir un videojuego comercial. Es un entorno de experimentación controlado, reproducible y apto para personas y agentes de desarrollo.

## Documentos

- [Especificación del producto](specs/01-producto.md)
- [Especificación pedagógica](specs/02-pedagogica.md)
- [Arquitectura](docs/arquitectura.md)
- [Hitos](docs/hitos.md)
- [Contrato para proyectos alternativos](docs/contrato-proyecto-alternativo.md)
- [Decisiones técnicas](docs/decisiones-tecnicas.md)
- [Auditoría H1](docs/auditoria-h1.md)
- [Permisos recomendados](docs/permisos-recomendados.md)
- [Registro de intervención](docs/plantillas/registro-intervencion.md)
- [Evidencia de pruebas](docs/plantillas/evidencia-pruebas.md)

## Tecnología de referencia

- Phaser con TypeScript.
- Vite para desarrollo y compilación.
- Vitest para pruebas de dominio.
- Node.js 22 o superior.
- npm y archivo de bloqueo para instalaciones reproducibles.

El estudiante puede adoptar Unity u otro entorno si cumple el contrato de equivalencia.

## Restricción principal

La lógica de navegación, percepción y decisión no dependerá de Phaser. El motor será un adaptador de entrada, tiempo, colisiones y representación visual.
