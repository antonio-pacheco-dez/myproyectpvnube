// Inicializar amCharts
var root = am5.Root.new("chartdiv");

root.dateFormatter.setAll({
    dateFormat: "yyyy-MM-dd HH:mm",
    dateFields: ["valueX", "openValueX"]
});

// Establecer temas
root.setThemes([am5themes_Animated.new(root)]);

// Crear el gráfico
var chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    wheelX: "panX",
    wheelY: "zoomX",
    layout: root.verticalLayout,
    paddingLeft: 0
}));

// Agregar leyenda
var legend = chart.children.push(am5.Legend.new(root, {
    centerX: am5.p50,
    x: am5.p50
}));

var colors = chart.get("colors");

// Crear ejes
var yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
        categoryField: "category", // Usar NOMBRE_AREA como campo de categoría
        renderer: am5xy.AxisRendererY.new(root, {
            inversed: true,
            minorGridEnabled: true
        }),
        tooltip: am5.Tooltip.new(root, {
            themeTags: ["axis"],
            animationDuration: 200
        })
    })
);

var xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "minute", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {
            minorGridEnabled: true,
            minGridDistance: 90
        })
    })
);

// Agregar serie
var series = chart.series.push(am5xy.ColumnSeries.new(root, {
    xAxis: xAxis,
    yAxis: yAxis,
    openValueXField: "fromDate", // Campo de fecha de inicio
    valueXField: "toDate",       // Campo de fecha de fin
    categoryYField: "category", // Campo de categoría
    sequencedInterpolation: true
}));

series.columns.template.setAll({
    templateField: "columnSettings",
    strokeOpacity: 0,
    tooltipText: "{category}: {openValueX} - {valueX}"
});

// Variable global para categorías únicas
let uniqueCategories = [];

// Llamada a la API para obtener los datos
fetch('get_data.php')
    .then(response => response.json())
    .then(data => {
        console.log('Datos recibidos:', data); // Verificar los datos recibidos

        const formattedData = data.map(item => {
            try {
                const fromDate = new Date(item.INICIO);
                const toDate = new Date(item.FIN);

                if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                    throw new Error('Fecha inválida');
                }

                // Agregar categoría única
                if (!uniqueCategories.includes(item.NOMBRE_AREA)) {
                    uniqueCategories.push(item.NOMBRE_AREA);
                }

                return {
                    category: item.NOMBRE_AREA,
                    fromDate: fromDate.getTime(),
                    toDate: toDate.getTime(),
                    columnSettings: {
                        fill: am5.Color.brighten(colors.getIndex(0), 0)
                    }
                };
            } catch (error) {
                console.error('Error en la conversión de fecha:', error);
                return null;
            }
        }).filter(item => item !== null);

        console.log('Datos formateados:', formattedData);
        series.data.setAll(formattedData);

        // Asignar categorías únicas al eje Y
        yAxis.data.setAll(uniqueCategories.map(category => ({ category })));
    })
    .catch(error => {
        console.error('Error:', error);
    });

// Agregar barras de desplazamiento
chart.set("scrollbarX", am5.Scrollbar.new(root, {
    orientation: "horizontal"
}));

// Animar el gráfico
series.appear();
chart.appear(1000, 100);
    