---
id: laboratorio-guardia-sigilo-arquitectura
titulo: Arquitectura del laboratorio Guardia de Sigilo
tipo: referencia
audiencia: estudiante
acceso: publico
version: 1
---

# Arquitectura propuesta

## Principio

El dominio no depende de Phaser. Phaser traduce entradas y presenta resultados.

```text
Phaser / navegador
      ↓ adaptadores
aplicación y simulación
      ↓
dominio puro TypeScript
```

## Estructura objetivo

```text
guardia-sigilo/
├── AGENTS.md
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── public/
├── specs/
├── docs/
├── src/
│   ├── domain/
│   │   ├── navigation/
│   │   ├── perception/
│   │   ├── behavior/
│   │   ├── telemetry/
│   │   └── model/
│   ├── application/
│   │   └── simulation/
│   ├── game/
│   │   ├── scenes/
│   │   ├── adapters/
│   │   └── presentation/
│   └── main.ts
└── tests/
    ├── navigation/
    ├── perception/
    └── behavior/
```

## Reglas de dependencia

- `domain/` no importa Phaser, DOM ni APIs de navegador.
- `application/` coordina casos de uso y depende del dominio.
- `game/` depende de Phaser, aplicación y dominio.
- Presentación no decide comportamiento.
- Tiempo, aleatoriedad y entrada se inyectan o modelan explícitamente.
- Las pruebas de dominio no crean un juego Phaser.

## Contratos principales

### Navegación

Entrada: grafo, inicio, objetivo, costos y heurística.

Salida: `success`, `path`, `totalCost`, `expandedNodes`, `maximumFrontier` y error explícito.

### Percepción

Entrada: observador, objetivo, geometría y evento sonoro.

Salida: observaciones; no modifica directamente el estado de conducta.

### Comportamiento

Entrada: estado actual, observaciones, memoria de trabajo y tiempo.

Salida: transición y acción deseada.

### Telemetría

Eventos estructurados con tiempo, estado anterior, evento, estado nuevo y causa.

## Comandos objetivo

```text
npm run dev
npm run build
npm run typecheck
npm run test
npm run test:run
npm run validate
```

`validate` debe ejecutar tipos, pruebas y compilación sin requerir interacción.
