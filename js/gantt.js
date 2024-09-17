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
            categoryField: "category",
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
        openValueXField: "fromDate",
        valueXField: "toDate",
        categoryYField: "category",
        sequencedInterpolation: true
    }));    

    series.columns.template.setAll({
        templateField: "columnSettings",
        strokeOpacity: 0,
        tooltipText: "{category}: {openValueX} - {valueX}",
        interactive: true, // Habilitar interactividad
    });

    // Variable global para categorías únicas
    let uniqueCategories = [];

    // Llamada a la API para obtener los datos
    fetch('get_data.php')
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos:', data);

            const formattedData = data.map(item => {
                try {
                    const fromDate = new Date(item.INICIO);
                    const toDate = new Date(item.FIN);

                    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                        throw new Error('Fecha inválida');
                    }

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
           
            console.log('Datos formateados:', formattedData);


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


    // Funciones de edición
    let isEditing = false;
    let dragStart = false;
    let dragItem = null;

    // Activar el modo de edición
    function activateEditMode() {
        isEditing = true;
        console.log("Modo de edición activado.");
    }

    // Desactivar el modo de edición
    function deactivateEditMode() {
        isEditing = false;
        console.log("Modo de edición desactivado.");
    }

    // Manejar el evento de arrastre
    function onPointerDown(event) {
        if (isEditing) {
            const dataItem = event.target.dataItem;
            if (dataItem) {
                dragItem = dataItem;
                dragStart = true;
                console.log("Arrastre iniciado", dataItem);
            } else {
                console.log("No se encontró dataItem en el evento pointerdown.");
            }
        }
    }

    // Manejar el evento de movimiento del puntero
    function onPointerMove(event) {
        debugger
        if (dragStart && isEditing && dragItem) {
            const position = event.point;
            const xAxis = chart.xAxes.getIndex(0);
            const fromValue = xAxis.getValueFromPosition(position.x);
            const toValue = fromValue + (dragItem.valueX - dragItem.openValueX); // Ajusta el ancho del bloque

            // Actualizar valores del bloque
            dragItem.set("openValueX", fromValue);
            dragItem.set("valueX", toValue);

            chart.requestUpdate(); // Asegúrate de que el gráfico se actualice
            
            console.log("Arrastre en curso", { fromValue, toValue });
        } else {
            console.log("Evento `pointermove` no activado. Verifica condiciones de `dragStart`, `isEditing` y `dragItem`.");
        }
    }

    // Manejar el evento de liberación del puntero
    function onPointerUp(event) {
        if (isEditing) {
            console.log("Evento puntero arriba", event);
            dragStart = false;
            dragItem = null;
        }
    }

    // Asignar los eventos a las columnas
    series.columns.template.events.on("pointerdown", onPointerDown);
    series.columns.template.events.on("pointermove", onPointerMove);
    series.columns.template.events.on("pointerup", onPointerUp);

    // Asignar los botones de la interfaz para activar y desactivar el modo de edición
    document.getElementById('editButton').addEventListener('click', () => {
        activateEditMode();
        toggleButtonVisibility();
    });

    document.getElementById('saveButton').addEventListener('click', () => {
        deactivateEditMode();
        console.log("Cambios guardados.");
        toggleButtonVisibility();
    });

    document.getElementById('deletChange').addEventListener('click', () => {
        deactivateEditMode();
        console.log("Cambios descartados.");
        toggleButtonVisibility();
    });

    // Función para alternar la visibilidad de los botones
    function toggleButtonVisibility() {
        const editButton = document.getElementById('editButton');
        const saveButton = document.getElementById('saveButton');
        const deleteButton = document.getElementById('deletChange');

        if (isEditing) {
            editButton.classList.add('hidden');
            saveButton.classList.remove('hidden');
            deleteButton.classList.remove('hidden');
        } else {
            editButton.classList.remove('hidden');
            saveButton.classList.add('hidden');
            deleteButton.classList.add('hidden');
        }
    }
