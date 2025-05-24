# Sistema de Monitoreo de Salud Remoto

## Descripción

Esta aplicación web simula un sistema de monitoreo de salud remoto para zonas rurales del Cesar, utilizando IoT, Arduino y sensores biométricos. La aplicación permite visualizar datos simulados de sensores biométricos como frecuencia cardíaca, saturación de oxígeno y temperatura corporal, así como la detección de movimiento.

## Características

- Simulación de lecturas de sensores biométricos:
  - Sensor MAX30102 para frecuencia cardíaca (60 a 110 bpm) y saturación de oxígeno (90% a 100%)
  - Sensor DHT11/MLX90614 para temperatura corporal (36.0 a 38.5 °C)
  - Acelerómetro MPU6050 para detección de movimiento o caídas

- Simulación de conectividad a través de módulo WiFi ESP8266/ESP32

- Visualización de datos en tiempo real con gráficas

- Sistema de alertas para valores fuera de rango

- Generación de reportes en formato PDF

- Interfaz responsiva adaptada a dispositivos móviles y escritorio

## Cómo usar

1. Abra el archivo `index.html` en un navegador web moderno

2. La simulación comenzará automáticamente con una frecuencia de muestreo de 3 segundos

3. Puede ajustar los siguientes parámetros:
   - Frecuencia de muestreo (1, 3 o 5 segundos)
   - Límites mínimos y máximos para cada sensor
   - Sensibilidad de detección de movimiento

4. Utilice los botones de acción para:
   - Generar un reporte PDF con las últimas 10 mediciones
   - Simular desconexión/conexión del dispositivo
   - Reiniciar la simulación

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Chart.js para gráficas en tiempo real
- jsPDF para generación de reportes PDF

## Proyecto académico

Esta aplicación forma parte del proyecto "Desarrollo de un Sistema de Monitoreo de Salud Remoto para Zonas Rurales del Cesar utilizando IoT, Arduino y Sensores Biométricos" de la Universidad Popular del Cesar.

## Nota importante

Esta es una simulación con fines educativos y de demostración. En un sistema real, los datos provendrían de sensores físicos conectados a un dispositivo Arduino con módulos de comunicación inalámbrica.
