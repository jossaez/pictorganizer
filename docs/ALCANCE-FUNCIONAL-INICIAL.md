# PICTORGANIZER — Documento de Alcance Funcional Inicial

**Versión:** 1.0  
**Fecha:** 3 de junio de 2026  
**Estado:** Borrador base para diseño técnico  
**Alcance:** Fase 1 — Uso doméstico familiar  

---

## Tabla de contenidos

1. [Visión del producto](#1-visión-del-producto)
2. [Objetivos](#2-objetivos)
3. [Usuarios](#3-usuarios)
4. [Casos de uso](#4-casos-de-uso)
5. [Problemas que resuelve](#5-problemas-que-resuelve)
6. [Funcionalidades incluidas](#6-funcionalidades-incluidas)
7. [Funcionalidades excluidas](#7-funcionalidades-excluidas)
8. [Priorización funcional](#8-priorización-funcional)
9. [Riesgos](#9-riesgos)
10. [Decisiones abiertas](#10-decisiones-abiertas)
11. [Recomendaciones para la fase de arquitectura técnica](#11-recomendaciones-para-la-fase-de-arquitectura-técnica)

---

## 1. Visión del producto

### 1.1 Declaración de visión

**PICTORGANIZER** es una agenda visual inteligente diseñada para ayudar a familias con niños o personas con Trastorno del Espectro Autista (TEA) a organizar rutinas, anticipar actividades y fomentar la autonomía mediante una experiencia visual sencilla basada en pictogramas, fotografías personalizadas, horarios, rutinas y refuerzos positivos.

### 1.2 Propuesta de valor

| Para quién | Qué ofrece | Por qué importa |
|------------|------------|-----------------|
| Persona con TEA | Una agenda clara de «qué toca ahora» y «qué viene después» | Reduce ansiedad e incertidumbre ante lo desconocido |
| Padres / cuidadores | Herramienta de configuración y seguimiento sin complejidad clínica | Facilita la organización familiar y el refuerzo de hábitos |
| Familia en conjunto | Un punto de referencia visual compartido del día a día | Disminuye la dependencia de recordatorios verbales repetitivos |

### 1.3 Contexto y alcance de la fase

- **Entorno objetivo:** hogar y uso familiar.
- **Dispositivos:** móvil y tablet (Android e iOS en fases posteriores de decisión técnica).
- **Modelo de uso:** una familia, uno o varios perfiles en el mismo dispositivo o dispositivos del hogar.
- **Fuera de alcance en esta fase:** colegios, asociaciones, terapeutas, centros especializados, entornos clínicos, modelos B2B o profesionales.

### 1.4 Principios de diseño del producto

Estos principios deben guiar todas las decisiones funcionales y de experiencia:

1. **Simplicidad extrema en modo niño:** pocas acciones, elementos grandes, lenguaje mínimo.
2. **Anticipación sobre sorpresa:** siempre mostrar el presente, el inmediato futuro y, cuando sea posible, lo que viene más tarde.
3. **Consistencia visual:** pictogramas, fotos y colores como anclajes de reconocimiento.
4. **Refuerzo positivo sin presión:** celebrar logros sin rankings, competición ni castigos.
5. **Utilizable desde el día uno:** onboarding con rutinas base preconfiguradas.
6. **Separación clara de roles:** modo niño (consulta y completar) vs. modo adulto (configuración).
7. **Accesibilidad cognitiva:** tiempos visuales, estados claros, transiciones predecibles.

---

## 2. Objetivos

### 2.1 Objetivo principal

Crear una aplicación sencilla, visual, intuitiva y accesible que permita a las familias estructurar el día a día de una persona con TEA mediante agendas visuales, rutinas configurables, actividades programadas, anticipación de tareas y seguimiento del progreso.

### 2.2 Objetivos de impacto (outcomes)

| Objetivo | Indicador orientativo (fase posterior) |
|----------|----------------------------------------|
| Reducir la incertidumbre | La persona consulta la app antes de preguntar verbalmente «¿qué toca?» |
| Reducir ansiedad ante cambios de rutina | Anticipación visible de actividades futuras en menos de 2 toques |
| Favorecer autonomía personal | Completar actividades de forma independiente con refuerzo positivo |
| Facilitar organización familiar | Padres configuran rutinas semanales en menos de 15 minutos |
| Mejorar anticipación de actividades | Vista AHORA / DESPUÉS / MÁS TARDE disponible como pantalla o sección principal |
| Reforzar hábitos y rutinas saludables | Progreso diario y semanal visible para cuidadores |

### 2.3 Objetivos funcionales de la fase 1

1. Permitir crear y gestionar perfiles familiares independientes.
2. Ofrecer onboarding guiado que deje la app operativa en la primera sesión.
3. Proporcionar biblioteca de rutinas preconfiguradas por categorías.
4. Mostrar agenda visual diaria como pantalla principal del usuario con TEA.
5. Soportar creación, edición y eliminación de actividades con recurrencias.
6. Implementar vistas de anticipación y temporizador visual.
7. Aplicar refuerzo positivo al completar actividades.
8. Mostrar progreso diario y semanal a cuidadores.
9. Diferenciar modo niño y modo adulto con acceso restringido a configuración.
10. Adaptar la experiencia a móvil y tablet.

### 2.4 Criterios de éxito de la fase 1 (definición de «listo»)

- Una familia puede completar el onboarding y tener una agenda del día siguiente funcional.
- Una persona con TEA puede identificar la actividad actual y la siguiente sin ayuda verbal.
- Un cuidador puede crear una actividad recurrente y asignarle pictograma o foto en menos de 3 minutos.
- El progreso del día es visible para el cuidador sin exportar datos.
- No se requiere conexión a servicios externos para el uso básico (decisión técnica pendiente sobre modo offline).

---

## 3. Usuarios

### 3.1 Personas (personas-arquetipo)

#### Persona A — Usuario con TEA (consulta)

| Atributo | Descripción |
|----------|-------------|
| Edad típica | Infancia, adolescencia o adulto con necesidades de apoyo visual |
| Necesidades | Saber qué ocurre ahora y después; completar tareas con refuerzo claro |
| Frustraciones | Cambios imprevistos, demasiado texto, interfaces complejas, muchos botones |
| Habilidades digitales | Básicas; uso guiado o autónomo según perfil |
| Frecuencia de uso | Varias veces al día (mañana, transiciones, noche) |

#### Persona B — Cuidador / padre / madre (configuración)

| Atributo | Descripción |
|----------|-------------|
| Rol | Configura rutinas, revisa progreso, adapta la agenda a cambios familiares |
| Necesidades | Rapidez al configurar, plantillas reutilizables, visión del cumplimiento |
| Frustraciones | Apps demasiado clínicas, curva de aprendizaje alta, poca flexibilidad |
| Habilidades digitales | Medias-altas |
| Frecuencia de uso | Diaria (ajustes puntuales) y semanal (planificación) |

### 3.2 Roles del sistema

| Rol | Descripción | Permisos principales |
|-----|-------------|----------------------|
| **Usuario consulta (modo niño)** | Persona con TEA | Ver agenda, anticipación, completar actividades, recibir refuerzo |
| **Cuidador (modo adulto)** | Padre, madre o apoyo | CRUD de actividades y rutinas, perfiles, pictogramas, fotos, estadísticas |
| **Sistema** | Lógica interna | Calcular actividades del día, estados, temporizadores, recurrencias |

> **Nota de alcance:** No hay autenticación multiusuario ni cuentas separadas en fase 1. El «modo adulto» se protegerá mediante mecanismo de acceso restringido (PIN, patrón u otro — ver decisiones abiertas).

### 3.3 Escenarios de uso típicos

- Mañana entre semana: rutina de despertar, vestirse, desayuno, salida al colegio.
- Tarde: actividades de ocio, merienda, tareas de higiene.
- Fin de semana: rutinas distintas con horarios flexibles.
- Día excepcional: cita médica o salida; actividad única insertada en la agenda.
- Varios hijos en la misma familia: perfiles independientes con agendas y colores propios.

---

## 4. Casos de uso

### 4.1 Convenciones

- **Actor principal:** quien inicia la acción.
- **Precondiciones:** estado necesario antes del caso de uso.
- **Postcondiciones:** estado del sistema tras completarlo.
- Los identificadores `CU-XX` facilitan trazabilidad con historias de usuario y pruebas.

---

### CU-01 — Primer uso: completar onboarding

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador |
| **Precondiciones** | App instalada; primera apertura |
| **Flujo principal** | 1. Crear perfil → 2. Introducir nombre → 3. Elegir foto o avatar → 4. Indicar tipo de dispositivo → 5. Seleccionar rutinas base → 6. Configurar horarios principales → 7. Finalizar |
| **Postcondiciones** | Perfil creado; agenda inicial generada; app lista para uso inmediato |
| **Alternativas** | Omitir foto (usar avatar por defecto); seleccionar solo una rutina base |
| **Excepciones** | Sin permisos de cámara/galería → continuar con avatar |

---

### CU-02 — Crear perfil familiar adicional

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador (modo adulto) |
| **Precondiciones** | Acceso a modo adulto |
| **Flujo principal** | Abrir gestión de perfiles → Crear nuevo → Nombre, foto/avatar, color → Guardar |
| **Postcondiciones** | Nuevo perfil con agenda y estadísticas independientes |

---

### CU-03 — Seleccionar perfil activo

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador o usuario consulta |
| **Precondiciones** | Existen uno o más perfiles |
| **Flujo principal** | Elegir perfil desde selector → La agenda y anticipación muestran datos del perfil seleccionado |
| **Postcondiciones** | Perfil activo persistido para la sesión |

---

### CU-04 — Consultar agenda del día

| Campo | Detalle |
|-------|---------|
| **Actor** | Usuario consulta (modo niño) |
| **Precondiciones** | Perfil activo; existen actividades para la fecha |
| **Flujo principal** | Abrir app → Ver fecha, lista de actividades ordenadas por hora con pictograma/foto, título, estado e hora de inicio |
| **Postcondiciones** | Usuario informado del plan del día |
| **Alternativas** | Día sin actividades → mensaje amigable y sugerencia de contactar al cuidador |

---

### CU-05 — Navegar entre días

| Campo | Detalle |
|-------|---------|
| **Actor** | Usuario consulta o cuidador |
| **Precondiciones** | Perfil activo |
| **Flujo principal** | Deslizar o usar controles → Ver ayer / hoy / mañana / otros días |
| **Postcondiciones** | Agenda actualizada para la fecha seleccionada |

---

### CU-06 — Ver anticipación (AHORA / DESPUÉS / MÁS TARDE)

| Campo | Detalle |
|-------|---------|
| **Actor** | Usuario consulta |
| **Precondiciones** | Actividades programadas para hoy |
| **Flujo principal** | Acceder a vista de anticipación → Ver actividad actual, siguiente y posterior |
| **Postcondiciones** | Reducción de incertidumbre sobre transiciones |
| **Reglas** | Si no hay actividad actual, AHORA muestra estado «descanso» o «sin actividad»; DESPUÉS muestra la próxima |

---

### CU-07 — Completar actividad

| Campo | Detalle |
|-------|---------|
| **Actor** | Usuario consulta |
| **Precondiciones** | Actividad en estado pendiente o en curso |
| **Flujo principal** | Marcar actividad como completada → Mostrar refuerzo positivo (carita, estrella, mensaje, animación) → Actualizar progreso |
| **Postcondiciones** | Actividad marcada completada; estadísticas actualizadas |
| **Alternativas** | Deshacer completado (solo modo adulto o ventana breve — decisión abierta) |

---

### CU-08 — Consultar temporizador visual

| Campo | Detalle |
|-------|---------|
| **Actor** | Usuario consulta |
| **Precondiciones** | Actividad en curso o próxima con hora definida |
| **Flujo principal** | Ver tiempo restante de actividad actual o tiempo hasta inicio de la siguiente |
| **Postcondiciones** | Usuario con referencia temporal visual no invasiva |

---

### CU-09 — Crear actividad

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador (modo adulto) |
| **Precondiciones** | Acceso modo adulto; perfil seleccionado |
| **Flujo principal** | Nueva actividad → Título, descripción opcional, categoría, hora inicio/fin, pictograma o foto, recurrencia, perfil → Guardar |
| **Postcondiciones** | Actividad visible en agenda según recurrencia |

---

### CU-10 — Editar o eliminar actividad

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador |
| **Precondiciones** | Actividad existente |
| **Flujo principal** | Seleccionar actividad → Editar campos o eliminar → Confirmar |
| **Postcondiciones** | Agenda actualizada; en actividades recurrentes, definir si afecta solo a una instancia o a la serie (decisión abierta) |

---

### CU-11 — Aplicar rutina desde biblioteca

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador |
| **Precondiciones** | Modo adulto; biblioteca disponible |
| **Flujo principal** | Elegir rutina preconfigurada (ej. mañana, noche) → Ajustar horarios si necesario → Asignar a perfil y días → Confirmar |
| **Postcondiciones** | Conjunto de actividades creadas en bloque |

---

### CU-12 — Gestionar pictogramas y fotos

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador |
| **Precondiciones** | Modo adulto |
| **Flujo principal** | Seleccionar pictograma de biblioteca interna o subir fotografía personalizada → Asociar a actividad o rutina |
| **Postcondiciones** | Recurso visual disponible para actividades del perfil |

---

### CU-13 — Revisar progreso diario y semanal

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador |
| **Precondiciones** | Historial de actividades completadas |
| **Flujo principal** | Abrir sección progreso → Ver completadas/pendientes/porcentaje del día; evolución semanal y días destacados |
| **Postcondiciones** | Cuidador informado para ajustar rutinas |

---

### CU-14 — Acceder a modo adulto

| Campo | Detalle |
|-------|---------|
| **Actor** | Cuidador |
| **Precondiciones** | Mecanismo de acceso configurado |
| **Flujo principal** | Solicitar acceso restringido → Validar → Mostrar funciones de configuración |
| **Postcondiciones** | Sesión en modo adulto hasta bloqueo o cierre |
| **Excepciones** | Acceso incorrecto → permanecer en modo niño |

---

### CU-15 — Usar app en tablet (vista ampliada)

| Campo | Detalle |
|-------|---------|
| **Actor** | Usuario consulta o cuidador |
| **Precondiciones** | App en tablet |
| **Flujo principal** | Interfaz muestra más información simultánea; vista semanal disponible |
| **Postcondiciones** | Mejor aprovechamiento del espacio sin cambiar la lógica de negocio |

---

### 4.2 Matriz resumida actor × caso de uso

| Caso de uso | Usuario consulta | Cuidador |
|-------------|:----------------:|:--------:|
| CU-01 Onboarding | — | ✓ |
| CU-04 Agenda diaria | ✓ | ✓ |
| CU-06 Anticipación | ✓ | ✓ |
| CU-07 Completar actividad | ✓ | — |
| CU-09 Crear actividad | — | ✓ |
| CU-11 Rutina biblioteca | — | ✓ |
| CU-13 Progreso | — | ✓ |
| CU-14 Modo adulto | — | ✓ |

---

## 5. Problemas que resuelve

| Problema | Manifestación en el día a día | Cómo lo aborda PICTORGANIZER |
|----------|-------------------------------|------------------------------|
| Falta de estructura diaria | Días impredecibles, dificultad para seguir secuencias | Agenda visual ordenada por horas y rutinas preconfiguradas |
| Dificultad para anticipar actividades | Preguntas repetidas, ansiedad antes de transiciones | Vista AHORA / DESPUÉS / MÁS TARDE y navegación entre días |
| Dependencia de recordatorios verbales | Cuidador debe repetir instrucciones constantemente | Soporte visual persistente accesible en un toque |
| Resistencia a cambios de actividad | Crisis o bloqueos en transiciones | Temporizador visual y anticipación de la siguiente actividad |
| Dificultad para consolidar hábitos | Rutinas se abandonan | Recurrencias, refuerzo positivo y seguimiento de progreso |
| Necesidad de apoyo visual constante | Texto o instrucciones verbales insuficientes | Pictogramas, fotos personalizadas y diseño iconográfico |
| Seguimiento difícil para padres | No hay visibilidad clara del cumplimiento | Progreso diario/semanal y estados de actividades |

---

## 6. Funcionalidades incluidas

### Módulo 1 — Perfiles familiares

**Descripción:** Gestión de uno o varios perfiles independientes dentro del hogar.

**Atributos por perfil:**

| Campo | Obligatorio | Descripción |
|-------|:-----------:|-------------|
| Nombre | Sí | Identificación del perfil |
| Fotografía | No | Imagen personal del usuario |
| Avatar alternativo | No | Sustituto si no hay foto |
| Color principal | Sí | Identidad visual del perfil en la UI |
| Configuración propia | — | Preferencias asociadas al perfil |
| Agenda propia | — | Actividades y rutinas del perfil |
| Estadísticas propias | — | Progreso aislado por perfil |

**Reglas de negocio:**

- Mínimo un perfil para usar la aplicación.
- Eliminar perfil implica eliminar agenda y estadísticas asociadas (con confirmación).
- Solo un perfil activo visible en modo niño a la vez.

---

### Módulo 2 — Onboarding inicial

**Descripción:** Asistente guiado en la primera apertura.

**Pasos:**

1. Crear perfil
2. Introducir nombre
3. Seleccionar fotografía o avatar
4. Seleccionar móvil o tablet (adaptación de layout)
5. Elegir rutinas base desde biblioteca
6. Configurar horarios principales
7. Finalizar configuración

**Criterios de aceptación:**

- El usuario llega a una agenda poblada al terminar el asistente.
- Cada paso es omitible solo donde se indique (foto/avatar).
- El onboarding no se repite en aperturas posteriores salvo reinicio explícito.

---

### Módulo 3 — Biblioteca de rutinas

**Descripción:** Conjunto inicial de rutinas preconfiguradas por categoría.

**Rutinas ejemplo:**

| Rutina | Actividades incluidas |
|--------|----------------------|
| Mañana | Despertarse, Vestirse, Desayunar, Lavarse dientes |
| Noche | Cena, Ducha, Pijama, Dormir |

**Categorías:**

Alimentación · Higiene · Colegio · Trabajo · Médico · Compras · Transporte · Ocio · Descanso

**Comportamiento:**

- Rutinas aplicables en bloque a un perfil.
- Actividades generadas editables individualmente tras aplicar la rutina.
- Cada actividad de plantilla incluye pictograma sugerido (biblioteca interna).

---

### Módulo 4 — Agenda visual diaria

**Descripción:** Pantalla principal para la persona con TEA.

**Elementos visibles:**

- Fecha actual
- Lista de actividades ordenadas por hora
- Pictograma o fotografía
- Título de actividad
- Estado (pendiente, en curso, completada, omitida*)
- Hora de inicio

\* *Estado «omitida» sujeto a decisión abierta.*

**Estados de actividad (propuesta):**

| Estado | Criterio |
|--------|----------|
| Pendiente | Antes de hora de inicio |
| En curso | Entre hora inicio y fin |
| Completada | Marcada por el usuario |
| Pasada sin completar | Fin de ventana temporal superado sin completar |

---

### Módulo 5 — Navegación entre días

**Descripción:** Consulta de agenda en distintas fechas.

**Capacidades:**

- Ver ayer, hoy, mañana
- Desplazamiento continuo entre días (calendario o swipe)
- Indicador visual del día seleccionado

---

### Módulo 6 — Gestión de actividades

**Descripción:** CRUD de actividades asociadas a un perfil.

**Campos de actividad:**

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Título | Texto corto | Sí |
| Descripción | Texto largo | No |
| Categoría | Enum (biblioteca) | Sí |
| Hora inicio | Hora | Sí |
| Hora fin | Hora | Recomendado |
| Pictograma | Recurso | Uno de pictograma/foto |
| Fotografía personalizada | Imagen | Uno de pictograma/foto |
| Recurrencia | Regla | Sí (única por defecto) |
| Perfil asociado | Referencia | Sí |

---

### Módulo 7 — Recurrencias

**Descripción:** Patrones de repetición de actividades.

| Tipo | Comportamiento |
|------|----------------|
| Actividad única | Solo en fecha seleccionada |
| Diaria | Todos los días |
| Laborables | Lunes a viernes |
| Semanal | Mismo día de la semana |
| Personalizada | Selección explícita de días (L, M, X, J, V, S, D) |

**Reglas:**

- Una actividad recurrente genera instancias por día en la agenda.
- Cambios en serie vs. instancia única deben estar definidos en decisión abierta.

---

### Módulo 8 — Anticipación

**Descripción:** Vista dedicada para reducir incertidumbre.

**Secciones:**

| Sección | Contenido |
|---------|-----------|
| **AHORA** | Actividad en curso o mensaje equivalente |
| **DESPUÉS** | Próxima actividad pendiente |
| **MÁS TARDE** | Actividad posterior a DESPUÉS |

**Acceso:** Pantalla propia o sección destacada en home (decisión UX abierta).

---

### Módulo 9 — Temporizador visual

**Descripción:** Representación del tiempo restante o hasta próximo evento.

**Requisitos:**

- Visual (barra, reloj simplificado o similar)
- Comprensible sin lectura numérica obligatoria
- Poco invasivo (no modal permanente)
- Dos modos: tiempo restante de actividad actual / tiempo hasta siguiente actividad

---

### Módulo 10 — Refuerzo positivo

**Descripción:** Feedback al completar una actividad.

**Elementos:**

- Carita feliz
- Estrella
- Mensaje positivo configurable o rotatorio
- Animación suave

**Restricciones explícitas:**

- Sin rankings
- Sin competición entre perfiles
- Sin penalizaciones visuales por no completar

---

### Módulo 11 — Progreso

**Descripción:** Panel de seguimiento para cuidadores.

**Progreso diario:**

- Actividades completadas
- Actividades pendientes
- Porcentaje completado

**Progreso semanal:**

- Evolución día a día
- Días con mayor cumplimiento
- Tendencias simples (ej. barras por día)

**Alcance:** Solo visualización; sin exportación PDF en fase 1.

---

### Módulo 12 — Modo niño

**Descripción:** Experiencia simplificada para usuario con TEA.

**Permitido:**

- Consultar agenda
- Ver actividad actual
- Ver próximas actividades
- Completar actividades
- Recibir refuerzo positivo
- Ver anticipación y temporizador

**No permitido:**

- Crear, editar o eliminar actividades
- Gestionar perfiles
- Ver estadísticas detalladas
- Acceder a configuración

---

### Módulo 13 — Modo adulto

**Descripción:** Vista avanzada tras acceso restringido.

**Permitido:**

- CRUD de actividades
- Gestión de rutinas y biblioteca
- Gestión de pictogramas y fotos
- Gestión de perfiles
- Revisión de progreso
- Configuración general de la app

---

### Módulo 14 — Adaptación a dispositivo

| Aspecto | Móvil | Tablet |
|---------|-------|--------|
| Orientación | Vertical preferente | Vertical y horizontal |
| Densidad | Tarjetas grandes, una columna | Más columnas / split view |
| Navegación | Mínima, iconos grandes | Barra lateral o tabs opcionales |
| Vista exclusiva tablet | — | Vista semanal de actividades |
| Onboarding | Pregunta tipo de dispositivo | Idem |

---

## 7. Funcionalidades excluidas

Las siguientes capacidades **no forman parte de la fase 1** y no deben diseñarse ni implementarse en el alcance inicial:

| Área | Exclusión |
|------|-----------|
| Inteligencia artificial | Sugerencias automáticas, generación de rutinas por IA |
| Chatbot | Asistente conversacional |
| Integraciones externas | Calendarios Google/Apple, APIs de terceros |
| Sincronización multiusuario | Cuentas en la nube compartidas entre dispositivos/familiares remotos |
| Entornos profesionales | Colegios, terapeutas, asociaciones, centros clínicos |
| Informes clínicos | Informes para profesionales sanitarios |
| Marketplace | Tienda de pictogramas o rutinas de pago |
| Monetización | Pagos, suscripciones, compras in-app |
| Comunicación | Videollamadas, mensajería |
| Portal web | Panel profesional en navegador |
| Gamificación avanzada | Rankings, logros competitivos, puntos entre usuarios |
| Notificaciones push complejas | Campanas configurables avanzadas (evaluar en fase 2) |
| Multiidioma avanzado | Más allá de español inicial (evaluar en fase 2) |
| Accesibilidad de plataforma extendida | Wearables, widgets de sistema (evaluar en fase 2) |

---

## 8. Priorización funcional

Se utiliza método **MoSCoW** para la fase 1.

### Must Have (imprescindible para MVP)

| ID | Funcionalidad | Justificación |
|----|---------------|---------------|
| M1 | Perfiles básicos (nombre, color, foto/avatar) | Base multiusuario familiar |
| M2 | Onboarding completo | App usable día 1 |
| M3 | Agenda visual diaria | Core del producto |
| M4 | Crear/editar/eliminar actividades | Configuración mínima viable |
| M5 | Recurrencias básicas (única, diaria, laborables, semanal) | Rutinas reales |
| M6 | Biblioteca de rutinas mañana/noche | Valor inmediato |
| M7 | Modo niño / modo adulto con bloqueo | Separación de roles |
| M8 | Completar actividad + refuerzo positivo | Bucle principal del usuario |
| M9 | Vista anticipación AHORA/DESPUÉS/MÁS TARDE | Diferenciador clave |
| M10 | Pictogramas integrados básicos | Soporte visual esencial |

### Should Have (importante, puede acortarse si hay presión)

| ID | Funcionalidad | Justificación |
|----|---------------|---------------|
| S1 | Navegación entre días | Planificación y revisión |
| S2 | Temporizador visual | Apoyo en transiciones |
| S3 | Progreso diario | Utilidad para cuidadores |
| S4 | Fotografías personalizadas | Personalización del hogar |
| S5 | Categorías completas en biblioteca | Organización |
| S6 | Adaptación layout tablet | Target device |
| S7 | Progreso semanal | Tendencias para padres |

### Could Have (deseable si hay tiempo)

| ID | Funcionalidad |
|----|---------------|
| C1 | Recurrencia personalizada por días |
| C2 | Vista semanal en tablet |
| C3 | Mensajes positivos personalizables |
| C4 | Deshacer completado de actividad |
| C5 | Estados avanzados (omitida, pospuesta) |

### Won't Have (esta fase)

Todo lo listado en [sección 7](#7-funcionalidades-excluidas).

### Roadmap sugerido por iteraciones

```text
Iteración 1 (MVP núcleo)
├── Perfiles + onboarding
├── Agenda diaria + actividades + recurrencias básicas
├── Modo niño/adulto
└── Completar + refuerzo positivo

Iteración 2 (anticipación y seguimiento)
├── Vista AHORA/DESPUÉS/MÁS TARDE
├── Temporizador visual
├── Navegación entre días
└── Progreso diario

Iteración 3 (riqueza y dispositivos)
├── Biblioteca completa de categorías
├── Fotos personalizadas
├── Progreso semanal
└── Optimización tablet + vista semanal
```

---

## 9. Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación propuesta |
|----|--------|:------------:|:-------:|----------------------|
| R1 | Complejidad excesiva en configuración aleja a familias | Media | Alto | Onboarding guiado, rutinas preconfiguradas, valores por defecto sensatos |
| R2 | Modo adulto insuficientemente protegido | Media | Medio | Definir mecanismo de acceso robusto pero simple (PIN) |
| R3 | Sobrecarga visual para usuarios con TEA | Media | Alto | Tests con familias; modo niño minimalista; opción reducir animaciones |
| R4 | Recurrencias mal implementadas generan agendas incorrectas | Media | Alto | Reglas de negocio explícitas; casos de prueba de borde (cambio horario, festivos) |
| R5 | Expectativa de sincronización multi-dispositivo | Alta | Medio | Comunicar claramente alcance fase 1; documentar como fase 2 |
| R6 | Falta de pictogramas adecuados culturalmente | Baja | Medio | Biblioteca ampliable; fotos personalizadas como alternativa |
| R7 | Uso sin conexión en hogares con conectividad limitada | Media | Medio | Decidir arquitectura offline-first en fase técnica |
| R8 | Confusión entre perfiles en dispositivo compartido | Baja | Medio | Indicador visual claro de perfil activo; confirmación al cambiar |
| R9 | Dependencia de permisos de cámara/galería | Media | Bajo | Avatares y pictogramas siempre disponibles como fallback |
| R10 | Scope creep hacia uso clínico o escolar | Media | Alto | Documento de alcance como contrato; revisión formal de cambios |

---

## 10. Decisiones abiertas

Estas decisiones deben resolverse antes o durante el diseño técnico y UX.

| ID | Decisión | Opciones | Recomendación inicial |
|----|----------|----------|----------------------|
| D1 | Mecanismo de acceso modo adulto | PIN numérico / patrón / pregunta secreta / biometría del cuidador | PIN numérico 4–6 dígitos |
| D2 | Almacenamiento de datos | Solo local / local + backup opcional en nube | Local-first en MVP; nube en fase 2 |
| D3 | Plataformas fase 1 | Solo Android / solo iOS / ambas (cross-platform) | Evaluar React Native o Flutter vs. nativo según equipo |
| D4 | Edición de actividades recurrentes | Solo instancia / instancia o serie / reglas híbridas | Diálogo «solo este día / todos» al editar |
| D5 | Zona horaria y cambio de hora | Automático del sistema | Heredar del SO |
| D6 | Idioma inicial | Solo español (España) / español neutro / multiidioma | Español; textos neutros LATAM/España |
| D7 | Festivos y días especiales | Ignorar / calendario manual / integración futura | Laborables excluyen sábado-domingo; festivos en fase 2 |
| D8 | Notificaciones | Sin push / recordatorios locales simples | Recordatorios locales opcionales en iteración 2 |
| D9 | Ubicación de anticipación | Pantalla dedicada / sección en home / ambas | Sección destacada en home + pantalla dedicada accesible |
| D10 | Comportamiento sin actividades | Pantalla vacía / sugerencia al cuidador / actividad libre genérica | Ilustración amigable + CTA oculto para adultos |
| D11 | Límite de perfiles | Sin límite / límite práctico (ej. 6) | Sin límite técnico; UX optimizada para 1–4 |
| D12 | Tamaño biblioteca pictogramas | Pack mínimo (~50) / pack amplio (~200+) | Mínimo 80–100 pictogramas categorizados |
| D13 | Política de privacidad de fotos | Solo dispositivo / cifrado local | Solo dispositivo; sin subida a servidor en fase 1 |
| D14 | Accesibilidad | Tamaño fuente configurable / alto contraste / reducir movimiento | Incluir reducir animaciones y tamaño de tarjetas |
| D15 | Deshacer completado | Permitido en modo adulto / no permitido | Permitido solo en modo adulto |

---

## 11. Recomendaciones para la fase de arquitectura técnica

### 11.1 Enfoque arquitectónico sugerido

1. **Arquitectura por capas clara:** presentación (modo niño/adulto), dominio (actividades, recurrencias, perfiles), persistencia local.
2. **Modelo de datos centrado en instancias:** una entidad `ActividadPlantilla` (regla recurrente) y `ActividadInstancia` (ocurrencia concreta en una fecha) simplifica agenda, completados y progreso.
3. **Motor de recurrencias aislado:** componente testeable que genere instancias para un rango de fechas.
4. **Feature flags por iteración:** anticipación, temporizador y progreso semanal pueden activarse progresivamente.

### 11.2 Modelo de datos preliminar (entidades)

```text
Perfil
├── id, nombre, foto, avatarId, color, createdAt

ActividadPlantilla (serie)
├── id, perfilId, titulo, descripcion, categoria
├── horaInicio, horaFin
├── pictogramaId | fotoUri
├── reglaRecurrencia (tipo + diasSemana + fechaFin opcional)

ActividadInstancia (ocurrencia)
├── id, plantillaId?, perfilId, fecha
├── titulo, ... (snapshot o referencia)
├── estado (pendiente | enCurso | completada | pasada)
├── completadaAt?

RutinaBiblioteca
├── id, nombre, categoria, actividades[] (plantillas embebidas)

ProgresoDiario (calculado o materializado)
├── perfilId, fecha, total, completadas

ConfiguracionApp
├── onboardingCompletado, tipoDispositivo, pinAdultoHash, perfilActivoId
```

### 11.3 Stack tecnológico (a evaluar)

| Criterio | Opciones | Notas |
|----------|----------|-------|
| Cross-platform | Flutter, React Native | Un solo código para móvil/tablet |
| Persistencia | SQLite (drift/sqflite), Realm | Relaciones y consultas por fecha |
| Estado UI | Provider, Riverpod, Bloc | Modo niño/adulto como estados globales |
| Imágenes | Almacenamiento en filesystem app | Fotos no salen del dispositivo en fase 1 |
| Tests | Unit tests motor recurrencias + widget tests agenda | Prioridad en lógica de fechas |

### 11.4 Requisitos no funcionales (NFR)

| Categoría | Requisito |
|-----------|-----------|
| Rendimiento | Agenda del día carga en < 1 s en dispositivos mid-range |
| Disponibilidad offline | 100 % funcionalidad consulta y completar sin red |
| Seguridad | PIN modo adulto hasheado; fotos en sandbox de la app |
| Accesibilidad | Soporte TalkBack/VoiceOver en elementos clave; contraste WCAG AA donde aplique |
| Mantenibilidad | Separación modo niño/adulto en módulos de navegación |
| Privacidad | Sin analytics invasivos; cumplimiento RGPD si hay datos personales |
| Escalabilidad futura | Modelo preparado para sync en nube sin rediseño total |

### 11.5 Entregables recomendados de la siguiente fase

1. **Documento de arquitectura técnica** (diagramas C4, decisiones ADR).
2. **Modelo de datos detallado** con diagrama ER.
3. **Wireframes de baja fidelidad** modo niño (agenda, anticipación, completar).
4. **Wireframes modo adulto** (CRUD actividad, rutinas, progreso).
5. **Especificación del motor de recurrencias** con casos de prueba.
6. **Inventario de pictogramas** por categoría.
7. **Plan de pruebas con familias** (prototipo clickable o beta cerrada).

### 11.6 Orden de trabajo sugerido

```text
1. Resolver decisiones abiertas D1–D5 y D13
2. Modelo de datos + motor de recurrencias
3. Prototipo UX modo niño (agenda + completar)
4. Modo adulto + onboarding
5. Anticipación + temporizador
6. Progreso + tablet
7. QA accesibilidad y pruebas con usuarios
```

---

## Anexos

### A. Glosario

| Término | Definición |
|---------|------------|
| TEA | Trastorno del Espectro Autista |
| Pictograma | Icono visual estandarizado que representa una actividad |
| Rutina | Conjunto ordenado de actividades habituales |
| Instancia | Ocurrencia concreta de una actividad en una fecha |
| Modo niño | Interfaz simplificada para usuario con TEA |
| Modo adulto | Interfaz de configuración para cuidadores |

### B. Referencias de inspiración (no vinculantes)

- Agendas visuales y pictogramas ARASAAC
- Principios de diseño para autismo (predictibilidad, claridad, refuerzo positivo)
- Apps de rutinas visuales existentes en el mercado (análisis competitivo pendiente)

### C. Control de cambios del documento

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-06-03 | — | Versión inicial de alcance funcional |

---

*Este documento constituye la base acordada para iniciar diseño UX, arquitectura técnica e implementación de PICTORGANIZER fase 1.*
