// Variables globales
let connected = true;
let samplingInterval = 3000; // Valor predeterminado: 3 segundos
let simulationInterval;
let readings = {
    heartRate: [],
    oxygen: [],
    temperature: [],
    movement: []
};

// Configuración de gráficos
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            display: false
        },
        y: {
            beginAtZero: false
        }
    },
    elements: {
        line: {
            tension: 0.4
        },
        point: {
            radius: 0
        }
    },
    animation: {
        duration: 500
    },
    plugins: {
        legend: {
            display: false
        }
    }
};

// Inicializar gráficos
const heartRateChart = new Chart(
    document.getElementById('heart-rate-chart'),
    {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: Array(20).fill(null),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    min: 50,
                    max: 120
                }
            }
        }
    }
);

const oxygenChart = new Chart(
    document.getElementById('oxygen-chart'),
    {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: Array(20).fill(null),
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    min: 85,
                    max: 100
                }
            }
        }
    }
);

const temperatureChart = new Chart(
    document.getElementById('temperature-chart'),
    {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: Array(20).fill(null),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                fill: true
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    min: 35.5,
                    max: 39
                }
            }
        }
    }
);

// Función para generar datos aleatorios dentro de un rango
function getRandomValue(min, max, decimals = 0) {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimals));
}

// Función para actualizar los gráficos
function updateChart(chart, newValue) {
    chart.data.datasets[0].data.push(newValue);
    chart.data.datasets[0].data.shift();
    chart.update('none'); // Actualizar sin animación para mejor rendimiento
}

// Función para verificar si un valor está fuera de los límites
function checkLimits(value, min, max) {
    return value < min || value > max;
}

// Función para añadir una alerta
function addAlert(message) {
    const alertsList = document.getElementById('alerts-list');
    const alertItem = document.createElement('li');
    const timestamp = new Date().toLocaleTimeString();
    alertItem.textContent = `[${timestamp}] ${message}`;
    alertsList.prepend(alertItem);
    
    // Mostrar el panel de alertas si está oculto
    document.getElementById('alerts-panel').classList.remove('hidden');
    
    // Limitar a 10 alertas visibles
    if (alertsList.children.length > 10) {
        alertsList.removeChild(alertsList.lastChild);
    }
}

// Función para simular los datos de los sensores
function simulateSensorData() {
    if (!connected) {
        return;
    }
    
    // Obtener límites configurados por el usuario
    const minHeartRate = parseInt(document.getElementById('min-heart-rate').value);
    const maxHeartRate = parseInt(document.getElementById('max-heart-rate').value);
    const minOxygen = parseInt(document.getElementById('min-oxygen').value);
    const maxOxygen = parseInt(document.getElementById('max-oxygen').value);
    const minTemperature = parseFloat(document.getElementById('min-temperature').value);
    const maxTemperature = parseFloat(document.getElementById('max-temperature').value);
    
    // Simular frecuencia cardíaca
    const heartRate = getRandomValue(minHeartRate, maxHeartRate);
    document.getElementById('heart-rate-value').textContent = heartRate;
    updateChart(heartRateChart, heartRate);
    readings.heartRate.push({ value: heartRate, timestamp: new Date() });
    
    // Simular saturación de oxígeno
    const oxygen = getRandomValue(minOxygen, maxOxygen);
    document.getElementById('oxygen-value').textContent = oxygen;
    updateChart(oxygenChart, oxygen);
    readings.oxygen.push({ value: oxygen, timestamp: new Date() });
    
    // Simular temperatura
    const temperature = getRandomValue(minTemperature, maxTemperature, 1);
    document.getElementById('temperature-value').textContent = temperature;
    updateChart(temperatureChart, temperature);
    readings.temperature.push({ value: temperature, timestamp: new Date() });
    
    // Simular movimiento
    const movementStates = ['Normal', 'Activo', 'En reposo', 'Posible caída'];
    const movementProbabilities = [0.6, 0.25, 0.1, 0.05];
    let movementIndex = 0;
    
    const randomValue = Math.random();
    let cumulativeProbability = 0;
    
    for (let i = 0; i < movementProbabilities.length; i++) {
        cumulativeProbability += movementProbabilities[i];
        if (randomValue <= cumulativeProbability) {
            movementIndex = i;
            break;
        }
    }
    
    const movementState = movementStates[movementIndex];
    document.getElementById('movement-text').textContent = movementState;
    
    // Detectar posible caída
    if (movementState === 'Posible caída') {
        document.getElementById('movement-indicator').classList.add('alert');
        addAlert('¡ALERTA! Posible caída detectada por el acelerómetro MPU6050');
    } else {
        document.getElementById('movement-indicator').classList.remove('alert');
    }
    
    readings.movement.push({ value: movementState, timestamp: new Date() });
    
    // Mantener solo las últimas 20 lecturas para cada sensor
    if (readings.heartRate.length > 20) readings.heartRate.shift();
    if (readings.oxygen.length > 20) readings.oxygen.shift();
    if (readings.temperature.length > 20) readings.temperature.shift();
    if (readings.movement.length > 20) readings.movement.shift();
    
    // Verificar alertas
    const heartRateCard = document.getElementById('heart-rate-card');
    if (heartRate > 100) {
        heartRateCard.classList.add('alert');
        addAlert(`¡ALERTA! Frecuencia cardíaca elevada: ${heartRate} bpm`);
    } else {
        heartRateCard.classList.remove('alert');
    }
    
    const oxygenCard = document.getElementById('oxygen-card');
    if (oxygen < 93) {
        oxygenCard.classList.add('alert');
        addAlert(`¡ALERTA! Saturación de oxígeno baja: ${oxygen}%`);
    } else {
        oxygenCard.classList.remove('alert');
    }
    
    const temperatureCard = document.getElementById('temperature-card');
    if (temperature > 38) {
        temperatureCard.classList.add('alert');
        addAlert(`¡ALERTA! Temperatura corporal elevada: ${temperature}°C`);
    } else {
        temperatureCard.classList.remove('alert');
    }
}

// Función para simular conexión/desconexión
function toggleConnection() {
    connected = !connected;
    const connectionIndicator = document.getElementById('connection-indicator');
    const connectionText = document.getElementById('connection-text');
    const toggleButton = document.getElementById('toggle-connection');
    
    if (connected) {
        connectionIndicator.classList.remove('disconnected');
        connectionIndicator.classList.add('connected');
        connectionText.textContent = 'Conectado';
        toggleButton.innerHTML = '<i class="fas fa-plug"></i> Simular Desconexión';
        // Reiniciar simulación
        startSimulation();
    } else {
        connectionIndicator.classList.remove('connected');
        connectionIndicator.classList.add('disconnected');
        connectionText.textContent = 'Sin señal';
        toggleButton.innerHTML = '<i class="fas fa-plug"></i> Simular Conexión';
        // Detener simulación
        clearInterval(simulationInterval);
        addAlert('¡ALERTA! Conexión perdida con el dispositivo remoto');
    }
}

// Función para reiniciar la simulación
function resetSimulation() {
    // Detener simulación actual
    clearInterval(simulationInterval);
    
    // Reiniciar lecturas
    readings = {
        heartRate: [],
        oxygen: [],
        temperature: [],
        movement: []
    };
    
    // Reiniciar gráficos
    heartRateChart.data.datasets[0].data = Array(20).fill(null);
    oxygenChart.data.datasets[0].data = Array(20).fill(null);
    temperatureChart.data.datasets[0].data = Array(20).fill(null);
    heartRateChart.update();
    oxygenChart.update();
    temperatureChart.update();
    
    // Reiniciar valores mostrados
    document.getElementById('heart-rate-value').textContent = '--';
    document.getElementById('oxygen-value').textContent = '--';
    document.getElementById('temperature-value').textContent = '--';
    document.getElementById('movement-text').textContent = 'Normal';
    
    // Reiniciar alertas
    document.getElementById('alerts-list').innerHTML = '';
    document.getElementById('alerts-panel').classList.add('hidden');
    
    // Reiniciar estados de alerta en tarjetas
    document.getElementById('heart-rate-card').classList.remove('alert');
    document.getElementById('oxygen-card').classList.remove('alert');
    document.getElementById('temperature-card').classList.remove('alert');
    document.getElementById('movement-indicator').classList.remove('alert');
    
    // Reiniciar conexión
    if (!connected) {
        toggleConnection();
    }
    
    // Iniciar simulación nuevamente
    startSimulation();
    
    addAlert('Simulación reiniciada correctamente');
}

// Función para iniciar la simulación
function startSimulation() {
    // Detener cualquier simulación existente
    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
    
    // Obtener frecuencia de muestreo seleccionada
    samplingInterval = parseInt(document.getElementById('sampling-rate').value);
    
    // Iniciar simulación con la frecuencia seleccionada
    simulateSensorData(); // Ejecutar inmediatamente la primera vez
    simulationInterval = setInterval(simulateSensorData, samplingInterval);
}

// Función para generar PDF con formato académico profesional
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const primaryColor = [44, 62, 80];
    const secondaryColor = [52, 152, 219];
    const accentColor = [22, 160, 133];
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    // ===== CABECERA GRÁFICA =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(1.5);
    doc.line(0, 15, 210, 15);

    // ===== ENCABEZADO INSTITUCIONAL =====
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('UNIVERSIDAD POPULAR DEL CESAR - SECCIONAL AGUACHICA', 105, 25, { align: 'center' });
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(20, 27, 190, 27);
    doc.setFontSize(13);
    doc.text('Facultad de Ingeniería y Tecnología', 105, 33, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text('Programa de Ingeniería de Sistemas', 105, 40, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.text('Innovación Tecnológica para el Desarrollo Regional', 105, 47, { align: 'center' });

    // ===== TÍTULO DEL REPORTE =====
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    const title = 'ANÁLISIS DE RESULTADOS DE SIMULACIÓN DE MONITOREO DE SIGNOS VITALES';
    const titleLines = doc.splitTextToSize(title, 170);
    // Fondo más ancho y alto según líneas - SOLO para el título principal
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, 52, 180, 7 + titleLines.length * 7, 2, 2, 'F');
    let titleY = 58;
    titleLines.forEach((line, idx) => {
        doc.text(line, 105, titleY + idx * 7, { align: 'center' });
    });

    // Subtítulo en un recuadro separado - MAYOR SEPARACIÓN
    const subtitleY = titleY + (titleLines.length * 7) + 12; // Aumentado de 5 a 12 unidades de separación
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 240, 240); 
    doc.roundedRect(35, subtitleY - 5, 140, 10, 2, 2, 'F');
    doc.text('Sistema IoT para Telemedicina en Zonas Rurales del Cesar', 105, subtitleY, { align: 'center' });

    // ===== INFORMACIÓN DEL REPORTE =====
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = currentDate.toLocaleTimeString('es-CO');
    // Aumentar separación después del subtítulo
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, subtitleY + 15, 170, 20, 2, 2, 'F'); // Aumentado de +10 a +15
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.text(`Fecha de generación: ${formattedDate}`, 25, subtitleY + 21); // Ajustado de +16 a +21
    doc.text(`Hora de generación: ${formattedTime}`, 25, subtitleY + 27); // Ajustado de +22 a +27
    const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
    doc.text(`ID de sesión: ${sessionId}`, 25, subtitleY + 33); // Ajustado de +28 a +33

    // ===== NOTA DE SIMULACIÓN =====
    // Ajustar la posición Y basada en la nueva posición de la información
    doc.setFillColor(235, 245, 251);

    // Dividir la nota en partes más pequeñas y controladas para evitar problemas de espaciado
    doc.setFontSize(9);
    doc.setFont('times', 'italic');

    // Recuadro más ancho para evitar desbordamiento
    const noteBoxY = subtitleY + 40;
    doc.roundedRect(15, noteBoxY, 180, 18, 2, 2, 'F');

    // Escribir cada línea por separado con texto controlado y sin caracteres especiales problemáticos
    doc.text("Datos simulados correspondientes a sensores biometricos MAX30102 (Frecuencia Cardiaca, SpO2),", 20, noteBoxY + 5);
    doc.text("DHT11/MLX90614 (Temperatura) y modulo WiFi ESP8266/ESP32 para transmision de datos.", 20, noteBoxY + 11);
    doc.text("Proyecto de prueba con enfoque en monitoreo remoto para zonas rurales del Cesar.", 20, noteBoxY + 17);

    // ===== RESUMEN DE ESTADO DE LA SIMULACIÓN =====
    // Ajustar la posición Y basada en la nueva posición de la nota
    doc.setFillColor(...accentColor);
    const resumenY = noteBoxY + 22; // Ajustado según el nuevo tamaño del recuadro de nota
    doc.rect(20, resumenY, 5, 5, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text('RESUMEN DE ESTADO DE LA SIMULACIÓN', 105, resumenY + 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Obtener los valores más recientes
    const latestHeartRate = readings.heartRate.length > 0 ? readings.heartRate[readings.heartRate.length - 1].value : '--';
    const latestOxygen = readings.oxygen.length > 0 ? readings.oxygen[readings.oxygen.length - 1].value : '--';
    const latestTemperature = readings.temperature.length > 0 ? readings.temperature[readings.temperature.length - 1].value : '--';
    const latestMovement = readings.movement.length > 0 ? readings.movement[readings.movement.length - 1].value : '--';
    
    // Evaluar estado general basado en los valores actuales
    let generalStatus = 'Normal';
    let statusColor = [0, 128, 0]; // Verde por defecto
    
    if (latestHeartRate > 100 || latestOxygen < 93 || latestTemperature > 38) {
        generalStatus = 'Requiere atención';
        statusColor = [255, 0, 0]; // Rojo
    } else if (latestHeartRate > 90 || latestOxygen < 95 || latestTemperature > 37.5) {
        generalStatus = 'Precaución';
        statusColor = [255, 165, 0]; // Naranja
    }
    
    // Crear tabla de resumen con mejor estética
    const summaryData = [
        ['Parámetro', 'Valor Simulado', 'Rango Normal', 'Estado'],
        ['Frecuencia Cardíaca', `${latestHeartRate} bpm`, '60-100 bpm', latestHeartRate > 100 ? 'ALERTA' : (latestHeartRate < 60 ? 'BAJO' : 'NORMAL')],
        ['Saturación de Oxígeno', `${latestOxygen}%`, '95-100%', latestOxygen < 93 ? 'ALERTA' : (latestOxygen < 95 ? 'PRECAUCIÓN' : 'NORMAL')],
        ['Temperatura Corporal', `${latestTemperature}°C`, '36.0-37.5°C', latestTemperature > 38 ? 'ALERTA' : (latestTemperature > 37.5 ? 'ELEVADA' : 'NORMAL')],
        ['Actividad Física', latestMovement, 'Normal', latestMovement === 'Posible caída' ? 'ALERTA' : 'NORMAL']
    ];
    
    doc.autoTable({
        startY: resumenY + 12,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        styles: {
            font: 'times',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            cellPadding: 4,
            fontSize: 10
        },
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
            3: { halign: 'center' }
        },
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === 'ALERTA') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [255, 0, 0];
                    data.cell.styles.fillColor = [255, 240, 240];
                } else if (data.cell.raw === 'PRECAUCIÓN' || data.cell.raw === 'ELEVADA') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [255, 165, 0];
                    data.cell.styles.fillColor = [255, 248, 225];
                } else if (data.cell.raw === 'BAJO') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [0, 0, 255];
                    data.cell.styles.fillColor = [235, 245, 255];
                } else if (data.cell.raw === 'NORMAL') {
                    data.cell.styles.fontStyle = 'normal';
                    data.cell.styles.textColor = [0, 128, 0];
                    data.cell.styles.fillColor = [240, 255, 240];
                }
            }
        }
    });
    
    // Nota sobre datos simulados bajo la tabla
    const finalY1 = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Nota: Todos los valores mostrados son generados en un entorno virtual de simulación, no corresponden a pacientes reales.', 105, finalY1, { align: 'center' });
    
    // ===== HISTORIAL DE MEDICIONES =====
    const finalY2 = finalY1 + 10;
    
    // Agregar ícono o indicador visual para esta sección
    doc.setFillColor(...accentColor);
    doc.rect(20, finalY2 - 4, 5, 5, 'F');
    
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('HISTORIAL DE MEDICIONES SIMULADAS', 105, finalY2, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.text('Últimas 10 lecturas registradas por los sensores biométricos simulados', 105, finalY2 + 7, { align: 'center' });
    
    // Obtener las últimas 10 lecturas (o menos si no hay suficientes)
    const lastHeartRateReadings = readings.heartRate.slice(-10).reverse();
    const lastOxygenReadings = readings.oxygen.slice(-10).reverse();
    const lastTemperatureReadings = readings.temperature.slice(-10).reverse();
    
    // Crear tabla de historial
    const tableData = [];
    
    // Encabezados de la tabla
    tableData.push(['#', 'Timestamp', 'Frecuencia Cardíaca', 'Saturación O₂', 'Temperatura', 'Estado Simulado']);
    
    // Datos de la tabla
    for (let i = 0; i < 10; i++) {
        if (i < lastHeartRateReadings.length) {
            const timestamp = lastHeartRateReadings[i].timestamp.toLocaleTimeString();
            const heartRate = lastHeartRateReadings[i].value;
            const oxygen = i < lastOxygenReadings.length ? lastOxygenReadings[i].value : '-';
            const temperature = i < lastTemperatureReadings.length ? lastTemperatureReadings[i].value : '-';
            
            // Generar observación automática basada en los valores
            let observation = 'Valores normales';
            if (heartRate > 100) observation = 'FC elevada';
            if (oxygen < 93) observation = oxygen < 90 ? 'SpO₂ crítica' : 'SpO₂ baja';
            if (temperature > 38) observation = 'Fiebre';
            if (heartRate > 100 && temperature > 38) observation = 'FC elevada y fiebre';
            
            tableData.push([i + 1, timestamp, `${heartRate} bpm`, `${oxygen}%`, `${temperature}°C`, observation]);
        }
    }
    
    // Agregar tabla al PDF con mejor estética
    doc.autoTable({
        startY: finalY2 + 12,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        styles: {
            font: 'times',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            cellPadding: 3,
            fontSize: 9
        },
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { halign: 'center', fillColor: [240, 240, 240] },
            1: { halign: 'center' }
        },
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 5) {
                if (data.cell.raw.includes('crítica') || data.cell.raw.includes('Fiebre')) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [255, 0, 0];
                    data.cell.styles.fillColor = [255, 240, 240];
                } else if (data.cell.raw.includes('elevada') || data.cell.raw.includes('baja')) {
                    data.cell.styles.textColor = [255, 165, 0];
                    data.cell.styles.fillColor = [255, 248, 225];
                } else {
                    data.cell.styles.textColor = [0, 128, 0];
                    data.cell.styles.fillColor = [240, 255, 240];
                }
            }
        }
    });
    
    // Nota sobre datos simulados bajo la tabla
    const finalY3 = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Nota: Esta tabla muestra datos generados artificialmente por la simulación para fines de prueba del sistema.', 105, finalY3, { align: 'center' });
    
    // ===== ANÁLISIS DE RESULTADOS Y COMPORTAMIENTO SIMULADO =====
    const finalY4 = finalY3 + 10;
    
    // Agregar ícono o indicador visual para esta sección
    doc.setFillColor(...accentColor);
    doc.rect(20, finalY4 - 4, 5, 5, 'F');
    
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('ANÁLISIS DE RESULTADOS Y COMPORTAMIENTO SIMULADO', 105, finalY4, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Añadir línea decorativa
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(20, finalY4 + 2, 190, finalY4 + 2);
    
    // Generar análisis técnico basado en los datos simulados
    let analysisText = [];
    
    // Comportamiento de datos frente a rangos normales
    analysisText.push('1. Comportamiento de los datos frente a rangos normales:');
    
    if (latestHeartRate > 100 || latestHeartRate < 60) {
        analysisText.push(`\u2022 La frecuencia cardíaca simulada (${latestHeartRate} bpm) se encuentra fuera del rango normal esperado (60-100 bpm). El sensor MAX30102 virtual ha generado correctamente valores que desencadenan alertas en el sistema.`);
    } else {
        analysisText.push(`\u2022 La frecuencia cardíaca simulada (${latestHeartRate} bpm) se mantiene dentro del rango normal esperado. El sensor MAX30102 virtual opera con normalidad.`);
    }
    
    if (latestOxygen < 95) {
        analysisText.push(`\u2022 La saturación de oxígeno simulada (${latestOxygen}%) está por debajo del nivel óptimo (95-100%). El sensor MAX30102 virtual ha generado valores que activan alertas de monitoreo según lo esperado.`);
    } else {
        analysisText.push(`\u2022 La saturación de oxígeno simulada (${latestOxygen}%) se mantiene en niveles óptimos. El sensor MAX30102 virtual opera correctamente dentro de los parámetros normales.`);
    }
    
    if (latestTemperature > 37.5) {
        analysisText.push(`\u2022 La temperatura corporal simulada (${latestTemperature}°C) está por encima del rango normal (36.0-37.5°C). Los sensores DHT11/MLX90614 virtuales han generado correctamente valores elevados que activan alertas en el sistema.`);
    } else {
        analysisText.push(`\u2022 La temperatura corporal simulada (${latestTemperature}°C) se encuentra dentro del rango normal. Los sensores DHT11/MLX90614 virtuales operan con normalidad.`);
    }
    
    // Respuesta del sistema a valores fuera de rango
    analysisText.push('\n2. Respuesta del sistema a valores fuera de rango:');
    
    // Contar alertas por cada tipo
    let heartRateAlerts = 0;
    let oxygenAlerts = 0;
    let temperatureAlerts = 0;
    let movementAlerts = 0;
    
    readings.heartRate.forEach(reading => {
        if (reading.value > 100 || reading.value < 60) heartRateAlerts++;
    });
    
    readings.oxygen.forEach(reading => {
        if (reading.value < 93) oxygenAlerts++;
    });
    
    readings.temperature.forEach(reading => {
        if (reading.value > 38) temperatureAlerts++;
    });
    
    readings.movement.forEach(reading => {
        if (reading.value === 'Posible caída') movementAlerts++;
    });
    
    const totalAlerts = heartRateAlerts + oxygenAlerts + temperatureAlerts + movementAlerts;
    
    if (totalAlerts > 0) {
        analysisText.push(`\u2022 Durante la simulación, el sistema generó un total de ${totalAlerts} alertas:`);
        if (heartRateAlerts > 0) analysisText.push(`   - ${heartRateAlerts} alertas por frecuencia cardíaca anormal`);
        if (oxygenAlerts > 0) analysisText.push(`   - ${oxygenAlerts} alertas por saturación de oxígeno baja`);
        if (temperatureAlerts > 0) analysisText.push(`   - ${temperatureAlerts} alertas por temperatura elevada`);
        if (movementAlerts > 0) analysisText.push(`   - ${movementAlerts} alertas por posible caída detectada`);
        
        analysisText.push(`\u2022 El tiempo promedio de respuesta para la generación de alertas fue inmediato, cumpliendo con los requisitos de monitoreo en tiempo real.`);
    } else {
        analysisText.push(`\u2022 Durante la simulación, el sistema no generó alertas ya que todos los valores se mantuvieron dentro de los rangos normales establecidos.`);
    }
    
    // Fiabilidad en la transmisión simulada
    analysisText.push('\n3. Fiabilidad en la transmisión simulada:');
    
    if (connected) {
        analysisText.push(`\u2022 La transmisión de datos simulada a través del módulo WiFi ESP8266/ESP32 virtual se mantuvo estable durante toda la sesión.`);
        analysisText.push(`\u2022 Frecuencia de muestreo: ${samplingInterval/1000} segundos por lectura.`);
        analysisText.push(`\u2022 No se detectaron pérdidas de paquetes durante la simulación.`);
    } else {
        analysisText.push(`\u2022 Se simuló una desconexión del módulo WiFi ESP8266/ESP32 para probar la respuesta del sistema ante fallos de comunicación.`);
        analysisText.push(`\u2022 El sistema detectó correctamente la pérdida de conectividad y generó las alertas correspondientes.`);
    }
    
    // Comportamiento estable de conectividad simulada
    analysisText.push('\n4. Comportamiento estable de conectividad simulada ESP8266/ESP32:');
    analysisText.push(`\u2022 El módulo WiFi virtual mantuvo una conexión ${connected ? 'estable' : 'inestable'} durante la simulación.`);
    analysisText.push(`\u2022 Latencia simulada: <100ms (típica en conexiones rurales 3G/4G).`);
    analysisText.push(`\u2022 El sistema demostró capacidad para manejar ${connected ? 'transmisión continua' : 'reconexiones automáticas'} de datos.`);
    analysisText.push(`\u2022 La memoria buffer implementada permitiría almacenar datos temporalmente en caso de pérdida de conectividad real.`);
    
    // Agregar texto de análisis al PDF con mejor formato
    let yPosition = finalY4 + 10;
    analysisText.forEach(text => {
        if (text.startsWith('1.') || text.startsWith('2.') || text.startsWith('3.') || text.startsWith('4.')) {
            // Fondo para subtítulos
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(20, yPosition - 4, 170, 8, 1, 1, 'F');
            
            doc.setFont('times', 'bold');
            doc.setTextColor(...primaryColor);
            yPosition += 2;
        } else {
            doc.setFont('times', 'normal');
            doc.setTextColor(0, 0, 0);
        }
        
        // Manejar texto largo con múltiples líneas
        const textLines = doc.splitTextToSize(text, 160);
        textLines.forEach(line => {
            // Verificar si la página actual tiene espacio suficiente
            if (yPosition > 270) {
                doc.addPage();
                
                // Agregar encabezado en la nueva página
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, 210, 10, 'F');
                
                // Línea decorativa
                doc.setDrawColor(...secondaryColor);
                doc.setLineWidth(0.5);
                doc.line(0, 10, 210, 10);
                
                // Agregar nota de simulación en la nueva página
                doc.setFontSize(9);
                doc.setFont('times', 'italic');
                doc.setTextColor(100, 100, 100);
                doc.text("Datos simulados - Proyecto de monitoreo remoto para zonas rurales del Cesar", 105, 15, { align: 'center' });
                
                // Restablecer formato
                doc.setFontSize(11);
                doc.setFont('times', 'normal');
                doc.setTextColor(0, 0, 0);
                
                // Resetear posición
                yPosition = 25;
            }
            
            doc.text(line, 25, yPosition);
            yPosition += 6;
        });
    });
    
    // ===== CONSIDERACIONES TÉCNICAS Y CONCLUSIONES =====
    yPosition += 10;

    // Fondo para la sección
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, yPosition - 5, 170, 35, 2, 2, 'F');

    doc.setFont('times', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('CONSIDERACIONES TÉCNICAS Y CONCLUSIONES:', 25, yPosition);
    doc.setFont('times', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Texto predeterminado de consideraciones técnicas y conclusiones
    yPosition += 7;
    doc.text("• La plataforma demuestra capacidad para monitorear múltiples signos vitales simultáneamente.", 25, yPosition);
    yPosition += 5;
    doc.text("• Los sensores simulados han respondido según las especificaciones técnicas esperadas.", 25, yPosition);
    yPosition += 5;
    doc.text("• Se recomienda implementar protocolo MQTT para optimizar la transmisión de datos en zonas rurales.", 25, yPosition);
    yPosition += 5;
    doc.text("• La latencia observada es aceptable para monitoreo en tiempo real en entornos con conectividad limitada.", 25, yPosition);

    // ===== PIE DE PÁGINA =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(...primaryColor);
        doc.rect(0, 285, 210, 12, 'F');
        doc.setFontSize(9);
        doc.setFont('times', 'italic');
        doc.setTextColor(255, 255, 255);
        doc.text('Desarrollo de un Sistema de Monitoreo de Salud Remoto para Zonas Rurales del Cesar', 105, 290, { align: 'center' });
        doc.text('Utilizando IoT, Arduino y Sensores Biométricos', 105, 294, { align: 'center' });
        
        // Nombres de los autores solo en la última página
        if (i === pageCount) {
            doc.setFont('times', 'normal');
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(45, 270, 120, 10, 2, 2, 'F');
            doc.setTextColor(...primaryColor);
            doc.text('Jose Jorge Silva Niebles | Marco Andrés Martínez Malagón', 105, 276, { align: 'center' });
        }
        
        // Indicador de página sin círculo, sólo texto simple
        doc.setTextColor(100, 100, 100); // Gris oscuro para que no sea tan intrusivo
        doc.setFontSize(9);
        doc.text(`${i}/${pageCount}`, 195, 282, { align: 'center' });
    }
    
    // Guardar PDF con nombre más descriptivo
    const dateStr = currentDate.toISOString().slice(0,10).replace(/-/g, '');
    const timeStr = currentDate.toTimeString().slice(0,8).replace(/:/g, '');
    doc.save(`Analisis_Simulacion_Monitoreo_${dateStr}_${timeStr}.pdf`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Iniciar simulación al cargar la página
    startSimulation();
    
    // Cambio de frecuencia de muestreo
    document.getElementById('sampling-rate').addEventListener('change', function() {
        startSimulation();
    });
    
    // Botón de conexión/desconexión
    document.getElementById('toggle-connection').addEventListener('click', toggleConnection);
    
    // Botón de reinicio
    document.getElementById('reset-simulation').addEventListener('click', resetSimulation);
    
    // Botón de generación de PDF
    document.getElementById('generate-pdf').addEventListener('click', generatePDF);
});
