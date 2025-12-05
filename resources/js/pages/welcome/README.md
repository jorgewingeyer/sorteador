# Welcome Page - Arquitectura Modular

## 📁 Estructura de Archivos

```
resources/js/pages/welcome/
├── welcome.tsx                 # Componente principal (composición)
├── welcome.css                 # Estilos y animaciones
├── types.ts                    # Interfaces TypeScript
├── hooks/
│   └── useRaffle.ts           # Lógica de negocio del sorteo
└── components/
    ├── index.ts               # Barrel exports
    ├── Confetti.tsx           # Efecto de confetti
    ├── DrawButton.tsx         # Botón de sorteo
    ├── WinnerCard.tsx         # Tarjeta de ganador
    ├── InfoCard.tsx           # Tarjeta informativa
    ├── Header.tsx             # Navegación superior
    ├── LotteryTitle.tsx       # Logo y títulos
    └── Footer.tsx             # Pie de página
```

## 🎯 Principios Aplicados

### SOLID

#### **S - Single Responsibility Principle (SRP)**
Cada componente tiene una única responsabilidad:
- `Confetti.tsx`: Solo muestra el efecto visual de confetti
- `DrawButton.tsx`: Solo renderiza el botón de sorteo
- `WinnerCard.tsx`: Solo muestra la información del ganador
- `Header.tsx`: Solo maneja la navegación
- `useRaffle.ts`: Solo maneja la lógica del sorteo

#### **O - Open/Closed Principle (OCP)**
Los componentes están abiertos para extensión pero cerrados para modificación:
- Puedes agregar nuevos componentes sin modificar los existentes
- Los props permiten personalización sin cambiar el código interno

#### **L - Liskov Substitution Principle (LSP)**
Los componentes pueden ser reemplazados por implementaciones alternativas sin romper la funcionalidad.

#### **I - Interface Segregation Principle (ISP)**
Cada componente recibe solo los props que necesita:
```tsx
// DrawButton solo necesita onClick e isDrawing
interface DrawButtonProps {
    onClick: () => void;
    isDrawing: boolean;
}

// Header solo necesita autenticación y registro
interface HeaderProps {
    isAuthenticated: boolean;
    canRegister: boolean;
}
```

#### **D - Dependency Inversion Principle (DIP)**
Los componentes dependen de abstracciones (interfaces), no de implementaciones concretas.

### DRY (Don't Repeat Yourself)

#### Antes (código duplicado):
```tsx
<div className="bg-white/80 rounded-xl p-4 border border-yellow-300">
    <p className="text-gray-600 text-xs uppercase">DNI</p>
    <p className="text-gray-900 text-xl font-bold">{dni}</p>
</div>
<div className="bg-white/80 rounded-xl p-4 border border-yellow-300">
    <p className="text-gray-600 text-xs uppercase">Teléfono</p>
    <p className="text-gray-900 text-xl font-bold">{phone}</p>
</div>
```

#### Ahora (componente reutilizable):
```tsx
function InfoItem({ label, value }: InfoItemProps) {
    return (
        <div className="bg-white/80 rounded-xl p-4 border border-yellow-300">
            <p className="text-gray-600 text-xs uppercase">{label}</p>
            <p className="text-gray-900 text-xl font-bold">{value}</p>
        </div>
    );
}

// Uso
<InfoItem label="DNI" value={dni} />
<InfoItem label="Teléfono" value={phone} />
```

## 📊 Métricas de Mejora

| Métrica | Antes | Ahora | Mejora |
|---------|-------|-------|--------|
| **Líneas por archivo** | 430 | 87 | -80% |
| **Componentes** | 1 monolítico | 9 modulares | +800% |
| **Reutilización** | Baja | Alta | ✅ |
| **Testabilidad** | Difícil | Fácil | ✅ |
| **Mantenibilidad** | Baja | Alta | ✅ |

## 🔧 Componentes

### 1. **useRaffle** (Custom Hook)
```tsx
const { isDrawing, winner, showConfetti, handleDraw } = useRaffle();
```
**Responsabilidad**: Encapsular toda la lógica del sorteo
**Beneficios**: 
- Separación lógica/presentación
- Fácil de testear
- Reutilizable

### 2. **Confetti**
```tsx
<Confetti show={showConfetti} />
```
**Props**: `show: boolean`
**Responsabilidad**: Renderizar efecto visual de celebración

### 3. **DrawButton**
```tsx
<DrawButton onClick={handleDraw} isDrawing={isDrawing} />
```
**Props**: `onClick, isDrawing`
**Responsabilidad**: Botón de acción principal con estados de carga

### 4. **WinnerCard**
```tsx
<WinnerCard winner={winner} />
```
**Props**: `winner: WinnerResult`
**Responsabilidad**: Mostrar información completa del ganador
**Subcomponentes**: `InfoItem` para DRY

### 5. **InfoCard**
```tsx
<InfoCard />
```
**Props**: Ninguno
**Responsabilidad**: Explicar el sistema de sorteo

### 6. **Header**
```tsx
<Header isAuthenticated={!!auth.user} canRegister={canRegister} />
```
**Props**: `isAuthenticated, canRegister`
**Responsabilidad**: Navegación superior

### 7. **LotteryTitle**
```tsx
<LotteryTitle />
```
**Props**: Ninguno
**Responsabilidad**: Logo y títulos principales

### 8. **Footer**
```tsx
<Footer />
```
**Props**: Ninguno
**Responsabilidad**: Información del pie de página

## 🎨 Estilos (welcome.css)

Todos los estilos CSS separados en archivo dedicado:
- Animaciones (`@keyframes`)
- Clases de utilidad (`.lottery-gradient`, `.pulse-gold`, etc.)
- Efectos visuales (`.text-with-stroke`, `.glass-card`, etc.)

**Beneficios**:
- Reutilización de estilos
- Mejor organización
- Fácil mantenimiento
- Reduce duplicación

## 📝 Types (types.ts)

Interfaces TypeScript centralizadas:
```tsx
export interface Participante { ... }
export interface WinnerResult { ... }
```

**Beneficios**:
- Single source of truth
- Facilita cambios de tipo
- Mejor autocompletado IDE

## 🚀 Uso

```tsx
import Welcome from '@/pages/welcome/welcome';

<Welcome canRegister={true} />
```

## 🧪 Testing

La arquitectura modular facilita el testing:

```tsx
// Test del hook
const { result } = renderHook(() => useRaffle());
await act(async () => await result.current.handleDraw());
expect(result.current.winner).toBeDefined();

// Test de componente
render(<DrawButton onClick={mockFn} isDrawing={false} />);
expect(screen.getByText('REALIZAR SORTEO')).toBeInTheDocument();
```

## 📦 Imports Limpios

Gracias al barrel export (`components/index.ts`):

```tsx
// Antes (múltiples imports)
import { Confetti } from './components/Confetti';
import { DrawButton } from './components/DrawButton';
import { WinnerCard } from './components/WinnerCard';

// Ahora (un solo import)
import { Confetti, DrawButton, WinnerCard } from './components';
```

## 🔄 Extensibilidad

Para agregar nuevas funcionalidades:

1. **Nuevo componente**: Crear en `components/` y exportar en `index.ts`
2. **Nueva lógica**: Crear nuevo hook en `hooks/`
3. **Nuevos estilos**: Agregar a `welcome.css`
4. **Nuevos tipos**: Agregar a `types.ts`

## ✅ Beneficios de la Refactorización

1. **Mejor Legibilidad**: Cada archivo tiene ~50-100 líneas
2. **Reutilización**: Componentes usables en otras páginas
3. **Mantenimiento**: Cambios aislados, sin efectos colaterales
4. **Testing**: Componentes testables de forma aislada
5. **Colaboración**: Múltiples desarrolladores pueden trabajar en paralelo
6. **Escalabilidad**: Fácil agregar nuevas features

## 🎯 Conclusión

La refactorización transforma un componente monolítico de 430 líneas en una arquitectura modular y mantenible, aplicando los principios SOLID y DRY para crear código limpio, testable y escalable.
