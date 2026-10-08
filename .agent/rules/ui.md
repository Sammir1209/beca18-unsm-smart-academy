# UI & Design System Rules

## Estética "EdTech Premium"
- Paleta intencional y sobria: Fondo oscuro elegante (`#0B0F19`, `#111827`, `#1F2937`) con toques de acento de alta precisión (Esmeralda para aciertos y Beca 18, Índigo/Azul real para UNSM, Ámbar para alertas pedagógicas).
- Tipografía moderna y legible: Inter / Plus Jakarta Sans para interfaces, Fira Code o JetBrains Mono para expresiones matemáticas y códigos de pregunta.
- Sin saturación de efectos: Cero exceso de glassmorphism, cero animaciones distractoras, cero diseño infantilizado.
- Arquitectura Responsiva:
  - Desktop: Sidebar de navegación modular con colapso ergonómico.
  - Mobile: Barra de navegación inferior (BottomNav) + Drawer contextual.

## Componentes Obligatorios
- `AppShell`: Contenedor principal con Header informativo y estado offline/online.
- `QuestionCard`: Soporte para enunciados formateados, renderizado de fórmulas, alternativas claras accesibles por teclado (teclas A, B, C, D, E).
- `QuestionNavigator`: Matriz de navegación por número de pregunta con estados (Respondida, Dudosa, Sin responder, Actual).
- `TimerWidget`: Temporizador con alerta visual de últimos 10 minutos y sincronización con LocalStorage.
- `KnowledgeHeatmap`: Mapa de calor por cursos y temas con gradiente de dominio (0% a 100%).
- `EmptyState` y `LoadingSkeleton`: Siempre presentes, sin parpadeos de pantalla en blanco.
