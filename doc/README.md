# Sistema de Sorteo Aleatorio - Guía Rápida

## 🎯 Resumen

Sistema web para realizar sorteos aleatorios completamente justos y verificables entre participantes registrados.

## 🚀 Inicio Rápido

### 1. Poblar Base de Datos con Participantes de Prueba

```bash
php artisan db:seed --class=ParticipantesSeeder
```

Esto creará:
- 1 sorteo de ejemplo
- 20 participantes con datos realistas

### 2. Acceder al Sistema

Abre tu navegador y ve a:
```
http://localhost:8000
```

O si estás usando Herd:
```
http://sorteador.test
```

### 3. Realizar un Sorteo

1. Haz clic en el botón grande **"🎲 Realizar Sorteo"**
2. Espera unos segundos mientras se procesa
3. ¡Observa la animación de confetti y el ganador!

## 📁 Archivos Principales

### Frontend
- **Interfaz**: `resources/js/pages/welcome/welcome.tsx`

### Backend
- **Acción**: `app/Actions/Sorteo/RealizarSorteo.php`
- **Controlador**: `app/Http/Controllers/SorteoController.php`
- **Ruta API**: `/api/sorteo/realizar` (POST)

### Documentación
- **Documentación Técnica Completa**: `doc/SISTEMA_SORTEO_ALEATORIO.md`

## 🔍 Ver Logs de Sorteos

Los sorteos se registran automáticamente en:
```
storage/logs/laravel.log
```

Para ver los últimos sorteos realizados:
```bash
tail -f storage/logs/laravel.log | grep "Sorteo realizado"
```

## 🎨 Características de la Interfaz

- ✨ Gradientes animados
- 🎊 Efecto confetti al ganar
- 💎 Glassmorphism moderno
- 📱 Diseño responsive
- ⚡ Animaciones fluidas

## 🔐 Seguridad

- Algoritmo criptográficamente seguro (`random_int()`)
- Protección CSRF en todas las peticiones
- Logging completo para auditoría

## 📊 Agregar Más Participantes

### Manualmente (vía Tinker)

```bash
php artisan tinker
```

```php
$sorteo = App\Models\Sorteo::first();

App\Models\Participante::create([
    'sorteo_id' => $sorteo->id,
    'full_name' => 'Nombre Completo',
    'dni' => '12345678',
    'phone' => '+54 9 11 1234-5678',
    'location' => 'Ciudad',
    'province' => 'Provincia',
    'carton_number' => 'A-999'
]);
```

### Vía Importación (si existe la funcionalidad)

El sistema incluye un controlador de participantes que puede tener funcionalidad de importación masiva.

## 🧪 Probar la Aleatoriedad

### Test Manual (100 sorteos)

```bash
php artisan tinker
```

```php
$ganadores = [];
for ($i = 0; $i < 100; $i++) {
    $resultado = App\Actions\Sorteo\RealizarSorteo::execute();
    $ganadores[] = $resultado['winner']['id'];
}

// Ver frecuencias
$frecuencias = array_count_values($ganadores);
arsort($frecuencias);
print_r($frecuencias);
```

Si el algoritmo es justo, la distribución debe ser relativamente uniforme.

## 📝 Información del Ganador

Cada vez que se realiza un sorteo, se devuelve:

```json
{
    "winner": {
        "id": 5,
        "full_name": "Laura Fernández",
        "dni": "56789012",
        "phone": "+54 9 11 5678-9012",
        "location": "La Plata",
        "province": "Buenos Aires",
        "carton_number": "A-005"
    },
    "total_participants": 20,
    "timestamp": "2025-12-04T20:00:00-03:00"
}
```

## 🎯 Casos de Uso

1. **Sorteo de premios** en eventos
2. **Selección aleatoria** de ganadores
3. **Rifas** online
4. **Sorteos promocionales**
5. **Selección equitativa** en concursos

## ⚠️ Consideraciones

- Asegúrate de tener participantes en la base de datos antes de realizar un sorteo
- Los sorteos son completamente independientes entre sí
- Cada sorteo se registra en los logs para auditoría futura
- El sistema garantiza equidad matemática perfecta

## 🆘 Solución de Problemas

### Error: "No hay participantes registrados"

**Solución**: Ejecuta el seeder
```bash
php artisan db:seed --class=ParticipantesSeeder
```

### El botón no responde

**Verificar**:
1. Que el servidor esté corriendo
2. Que la base de datos esté conectada
3. Que existan participantes en la tabla

### No se muestra el ganador

**Verificar** en la consola del navegador (F12) si hay errores de JavaScript o de red.

## 📚 Documentación Adicional

Para detalles técnicos completos sobre el algoritmo de aleatoriedad, garantías de equidad, y arquitectura del sistema, consulta:

📖 **[SISTEMA_SORTEO_ALEATORIO.md](./SISTEMA_SORTEO_ALEATORIO.md)**

---

**¡Listo para sortear!** 🎉
