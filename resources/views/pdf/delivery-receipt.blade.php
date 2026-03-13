<!DOCTYPE html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Comprobante de Entrega - {{ $entrega->id }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 10px;
            font-size: 12px;
        }
        .header {
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 20px;
            width: 100%;
        }
        .header table {
            width: 100%;
            border-collapse: collapse;
        }
        .header td {
            vertical-align: middle;
        }
        .header-content {
            text-align: left;
        }
        .header-logo {
            text-align: right;
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 18px;
        }
        .header p {
            margin: 5px 0 0;
            color: #7f8c8d;
            font-size: 10px;
        }
        .logo {
            max-width: 180px;
            max-height: 80px;
        }
        .section {
            margin-bottom: 15px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 3px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        .row {
            margin-bottom: 5px;
            display: block;
        }
        .label {
            font-weight: bold;
            width: 130px;
            display: inline-block;
            color: #555;
            font-size: 12px;
        }
        .value {
            display: inline-block;
            color: #000;
            font-size: 12px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        .signature-box {
            margin-top: 40px;
            display: table;
            width: 100%;
        }
        .signature-line {
            display: table-cell;
            width: 40%;
            text-align: center;
            vertical-align: bottom;
        }
        .signature-line div {
            border-top: 1px solid #000;
            margin: 0 10px;
            padding-top: 5px;
            font-size: 11px;
        }
        .spacer {
            display: table-cell;
            width: 20%;
        }
        .legal-text {
            margin-top: 20px;
            font-size: 9px;
            text-align: justify;
            color: #666;
            line-height: 1.2;
        }
    </style>
</head>
<body>

    <div class="header">
        <table>
            <tr>
                <td class="header-content" width="60%">
                    <h1>Comprobante de Entrega de Premio</h1>
                    <p>Fecha de impresión: {{ now()->translatedFormat('d \d\e F \d\e Y, H:i') }}</p>
                </td>
                <td class="header-logo" width="40%">
                    @if(file_exists($logoPath))
                        <img src="{{ $logoPath }}" class="logo" alt="Logo">
                    @endif
                </td>
            </tr>
        </table>
    </div>
    
    <div class="section">

    <div class="section">
        <div class="section-title">Detalles del Sorteo</div>
        <div class="row">
            <span class="label">Sorteo:</span>
            <span class="value">{{ $sorteo->nombre }}</span>
        </div>
        <div class="row">
            <span class="label">Instancia:</span>
            <span class="value">{{ $instancia->nombre }}</span>
        </div>
        <div class="row">
            <span class="label">Fecha Sorteo:</span>
            <span class="value">{{ $instancia->fecha_ejecucion->format('d/m/Y') }}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Datos del Ganador</div>
        <div class="row">
            <span class="label">Nombre:</span>
            <span class="value">{{ $winnerName }}</span>
        </div>
        <div class="row">
            <span class="label">DNI:</span>
            <span class="value">{{ $winnerDni }}</span>
        </div>
        <div class="row">
            <span class="label">Teléfono:</span>
            <span class="value">{{ $winnerPhone }}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Detalles del Premio</div>
        <div class="row">
            <span class="label">Premio:</span>
            <span class="value">{{ $premio->nombre }}</span>
        </div>
        <div class="row">
            <span class="label">Descripción:</span>
            <span class="value">{{ $premio->descripcion ?? 'Sin descripción' }}</span>
        </div>
        <div class="row">
            <span class="label">Posición:</span>
            <span class="value">{{ $ganador->premioInstancia->posicion }}° Lugar</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Datos de la Entrega</div>
        <div class="row">
            <span class="label">Fecha Entrega:</span>
            <span class="value">{{ $entrega->fecha_entrega->format('d/m/Y H:i') }}</span>
        </div>
        <div class="row">
            <span class="label">Recibido por:</span>
            <span class="value">{{ $entrega->nombre_receptor }} (DNI: {{ $entrega->dni_receptor }})</span>
        </div>
        @if($entrega->observaciones)
        <div class="row">
            <span class="label">Observaciones:</span>
            <span class="value">{{ $entrega->observaciones }}</span>
        </div>
        @endif
    </div>

    <div class="legal-text">
        <p>
            Por medio de la presente, declaro haber recibido el premio detallado anteriormente en perfectas condiciones y de conformidad. 
            Autorizo el uso de mi imagen y datos para fines promocionales relacionados con este sorteo.
            La organización no se hace responsable por daños o desperfectos posteriores a la entrega.
        </p>
    </div>

    <div class="signature-box">
        <div class="signature-line">
            <div>Firma del Receptor</div>
        </div>
        <div class="spacer"></div>
        <div class="signature-line">
            <div>Firma y Sello de la Organización</div>
        </div>
    </div>

    <div class="footer">
        <p>Este documento es un comprobante válido de la entrega del premio.</p>
        <p>{{ config('app.name') }} - Generado automáticamente</p>
    </div>

</body>
</html>
