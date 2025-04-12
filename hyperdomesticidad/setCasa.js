/**
 * setCasa.js - Visualizador de planos de casas
 * 
 * Esta función carga un archivo JSON con la información de una casa
 * y genera una visualización en el div especificado.
 * 
 * @param {string} idDiv - El ID del div donde se insertará la visualización
 */
function setCasa(idDiv) {
    // Buscar el archivo JSON en la carpeta casa/
    const jsonFileName = `casa/${idDiv}.json`;
    
    // Cargar el archivo JSON
    fetch(jsonFileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Generar la visualización
            generarVisualizacion(data, idDiv);
        })
        .catch(error => {
            console.error(`Error al cargar o procesar el archivo JSON: ${error}`);
            document.getElementById(idDiv).innerHTML = `
                <div class="error">
                    <h3>Error al cargar la casa</h3>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

/**
 * Genera la visualización HTML de la casa
 * 
 * @param {Object} data - Los datos de la casa en formato JSON
 * @param {string} idDiv - El ID del div donde se insertará la visualización
 */
function generarVisualizacion(data, idDiv) {
    // Obtener el div donde se insertará la visualización
    const divContainer = document.getElementById(idDiv);
    if (!divContainer) {
        console.error(`No se encontró el div con ID: ${idDiv}`);
        return;
    }

    // Crear el contenedor principal
    const contenido = document.createElement('div');
    contenido.className = 'casa-visualizador';
    contenido.style.width = '100%';
    contenido.style.overflow = 'hidden';

    // Agregar el título
    const titulo = document.createElement('h3');
    titulo.textContent = data.titulo;
    contenido.appendChild(titulo);

    // Crear el contenedor para la planta y la leyenda
    const visualContainer = document.createElement('div');
    visualContainer.className = 'visual-container';
    visualContainer.style.display = 'flex';
    visualContainer.style.width = '100%';
    visualContainer.style.marginBottom = '20px';
    visualContainer.style.overflow = 'hidden';

    // Crear el contenedor para la planta (SVG)
    const plantaContainer = document.createElement('div');
    plantaContainer.className = 'planta-container';
    plantaContainer.style.flex = '3';
    plantaContainer.style.position = 'relative';

    // Crear el contenedor para la leyenda
    const leyendaContainer = document.createElement('div');
    leyendaContainer.className = 'leyenda-container';
    leyendaContainer.style.flex = '1';
    leyendaContainer.style.padding = '10px';
    leyendaContainer.style.maxWidth = '200px';
    leyendaContainer.style.overflowY = 'auto';

    visualContainer.appendChild(plantaContainer);
    visualContainer.appendChild(leyendaContainer);
    contenido.appendChild(visualContainer);

    // Agregar la descripción
    const descripcion = document.createElement('p');
    descripcion.className = 'descripcion';
    descripcion.textContent = data.descripcion;
    contenido.appendChild(descripcion);

    // Agregar el tooltip para mostrar descripciones al pasar el ratón
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.display = 'none';
    tooltip.style.padding = '8px';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '14px';
    tooltip.style.maxWidth = '250px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    document.body.appendChild(tooltip);

    // Crear el SVG para la planta
    crearVisualizacionSVG(data, plantaContainer, tooltip);

    // Crear la leyenda
    crearLeyenda(data, leyendaContainer);

    // Limpiar el div y agregar el contenido
    divContainer.innerHTML = '';
    divContainer.appendChild(contenido);
}

/**
 * Crea el SVG para visualizar la planta y los objetos
 * 
 * @param {Object} data - Los datos de la casa
 * @param {HTMLElement} container - El contenedor donde se insertará el SVG
 * @param {HTMLElement} tooltip - El elemento tooltip para mostrar descripciones
 */
function crearVisualizacionSVG(data, container, tooltip) {
    // Crear el elemento SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.backgroundColor = '';

    // Encontrar las dimensiones máximas para el escalado
    let maxX = 0;
    let maxY = 0;

    // Revisar todos los polígonos de la planta
    data.planta.forEach(elemento => {
        elemento.poligono.forEach(punto => {
            maxX = Math.max(maxX, punto[0]);
            maxY = Math.max(maxY, punto[1]);
        });
    });

    // Revisar todos los objetos
    data.objetos.forEach(objeto => {
        if (objeto.forma === 'poligono' && objeto.poligono) {
            objeto.poligono.forEach(punto => {
                maxX = Math.max(maxX, punto[0]);
                maxY = Math.max(maxY, punto[1]);
            });
        } else {
            // Para objetos con posición central y dimensiones
            const halfWidth = objeto.forma === 'circulo' ? objeto.dimensiones[0] : objeto.dimensiones[0] / 2;
            const halfHeight = objeto.forma === 'circulo' ? objeto.dimensiones[0] : objeto.dimensiones[1] / 2;
            
            maxX = Math.max(maxX, objeto.posicion[0] + halfWidth);
            maxY = Math.max(maxY, objeto.posicion[1] + halfHeight);
        }
    });

    // Establecer el viewBox para que se ajuste a todo el contenido con un margen
    const margin = 20;
    svg.setAttribute('viewBox', `0 0 ${maxX + margin} ${maxY + margin}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Añadir definiciones para filtros y efectos
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Crear filtro para efecto de brillo
    const filterId = 'filtro_brillo';
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute('id', filterId);
    
    const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    feGaussianBlur.setAttribute('stdDeviation', '2.5');
    feGaussianBlur.setAttribute('result', 'blur');
    
    filter.appendChild(feGaussianBlur);
    defs.appendChild(filter);
    
    // Agregar defs al SVG
    svg.appendChild(defs);

    // Grupos para organizar los elementos
    const grupoPlanta = document.createElementNS("http://www.w3.org/2000/svg", "g");
    grupoPlanta.setAttribute('class', 'planta');
    
    const grupoObjetos = document.createElementNS("http://www.w3.org/2000/svg", "g");
    grupoObjetos.setAttribute('class', 'objetos');
    
    // Agregar los grupos al SVG para evitar problemas de referencia nula
    svg.appendChild(grupoPlanta);
    svg.appendChild(grupoObjetos);

    // Dibujar los elementos de la planta
    data.planta.forEach(elemento => {
        const poligono = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        
        // Convertir el array de puntos al formato de SVG
        const puntos = elemento.poligono.map(punto => `${punto[0]},${punto[1]}`).join(' ');
        poligono.setAttribute('points', puntos);
        poligono.setAttribute('fill', elemento.color);
        poligono.setAttribute('stroke', '#000');
        poligono.setAttribute('stroke-width', '1');
        poligono.setAttribute('data-nombre', elemento.nombre);
        poligono.setAttribute('data-tipo', elemento.tipo);
        
        // Evento para mostrar el tooltip
        poligono.addEventListener('mousemove', (e) => {
            mostrarTooltip(e, elemento.nombre, tooltip);
        });
        
        poligono.addEventListener('mouseout', () => {
            ocultarTooltip(tooltip);
        });
        
        grupoPlanta.appendChild(poligono);
    });

    // Dibujar los objetos
    data.objetos.forEach(objeto => {
        let elementoSVG;
        
        if (objeto.forma === 'rectangulo') {
            // Crear un rectángulo
            elementoSVG = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            
            // Calcular la posición del rectángulo (el punto posicion es el centro)
            const x = objeto.posicion[0] - objeto.dimensiones[0] / 2;
            const y = objeto.posicion[1] - objeto.dimensiones[1] / 2;
            
            elementoSVG.setAttribute('x', x);
            elementoSVG.setAttribute('y', y);
            elementoSVG.setAttribute('width', objeto.dimensiones[0]);
            elementoSVG.setAttribute('height', objeto.dimensiones[1]);
            
            // Aplicar rotación si existe
            if (objeto.rotacion && objeto.rotacion !== 0) {
                // La rotación se aplica alrededor del centro del objeto
                elementoSVG.setAttribute('transform', `rotate(${objeto.rotacion} ${objeto.posicion[0]} ${objeto.posicion[1]})`);
            }
        } else if (objeto.forma === 'circulo') {
            // Crear un círculo
            elementoSVG = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            
            elementoSVG.setAttribute('cx', objeto.posicion[0]);
            elementoSVG.setAttribute('cy', objeto.posicion[1]);
            elementoSVG.setAttribute('r', objeto.dimensiones[0]);
        } else if (objeto.forma === 'poligono' && objeto.poligono) {
            // Crear un polígono personalizado
            elementoSVG = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            
            // Convertir el array de puntos al formato de SVG
            const puntos = objeto.poligono.map(punto => `${punto[0]},${punto[1]}`).join(' ');
            elementoSVG.setAttribute('points', puntos);
        }
        
        // Configuración común
        elementoSVG.setAttribute('fill', objeto.color);
        elementoSVG.setAttribute('stroke', '#000');
        elementoSVG.setAttribute('stroke-width', '1');
        elementoSVG.setAttribute('data-nombre', objeto.nombre);
        elementoSVG.setAttribute('data-descripcion', objeto.descripcion);
        
        // Agregar primero al grupo para evitar problemas de referencia nula
        grupoObjetos.appendChild(elementoSVG);
        
        // Aplicar animación si existe (después de agregar al DOM)
        if (objeto.animacion) {
            aplicarAnimacion(elementoSVG, objeto.animacion, objeto.color);
        }
        
        // Eventos para mostrar el tooltip
        elementoSVG.addEventListener('mousemove', (e) => {
            mostrarTooltip(e, `${objeto.nombre}: ${objeto.descripcion}`, tooltip);
        });
        
        elementoSVG.addEventListener('mouseout', () => {
            ocultarTooltip(tooltip);
        });
    });
    
    // Agregar el SVG al contenedor
    container.appendChild(svg);
}

/**
 * Aplica animación a un elemento SVG
 * 
 * @param {SVGElement} elemento - El elemento SVG a animar
 * @param {Object} animacion - La configuración de la animación
 * @param {string} colorBase - El color base del elemento
 */
function aplicarAnimacion(elemento, animacion, colorBase) {
    // Crear un identificador único para la animación
    const animId = 'anim_' + Math.random().toString(36).substr(2, 9);
    
    if (animacion.tipo === 'parpadeo') {
        // Animación de parpadeo (más simple y robusta)
        const velocidad = animacion.velocidad || 2; // Segundos por defecto
        
        // Crear la animación
        const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '1;0.3;1');
        animate.setAttribute('dur', `${velocidad}s`);
        animate.setAttribute('repeatCount', 'indefinite');
        
        elemento.appendChild(animate);
    } else if (animacion.tipo === 'brillo') {
        // Para brillo, usamos una animación más simple sin manipular el DOM
        const velocidad = animacion.velocidad || 3; // Segundos por defecto
        
        // Aplicar un filtro por clase en lugar de manipular el DOM
        elemento.setAttribute('class', elemento.getAttribute('class') + ' efecto-brillo');
        
        // Crear la animación directa de opacidad
        const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '1;0.6;1');
        animate.setAttribute('dur', `${velocidad}s`);
        animate.setAttribute('repeatCount', 'indefinite');
        
        elemento.appendChild(animate);
    } else if (animacion.tipo === 'color_rgb') {
        // Animación de cambio de color RGB
        const velocidad = animacion.velocidad || 5; // Segundos por defecto
        
        // Crear la animación
        const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate.setAttribute('attributeName', 'fill');
        animate.setAttribute('values', '#FF0000;#FFFF00;#00FF00;#00FFFF;#0000FF;#FF00FF;#FF0000');
        animate.setAttribute('dur', `${velocidad}s`);
        animate.setAttribute('repeatCount', 'indefinite');
        
        elemento.appendChild(animate);
    }
}

/**
 * Muestra el tooltip con información
 * 
 * @param {Event} event - El evento de ratón
 * @param {string} texto - El texto a mostrar
 * @param {HTMLElement} tooltip - El elemento tooltip
 */
function mostrarTooltip(event, texto, tooltip) {
    tooltip.style.display = 'block';
    tooltip.textContent = texto;
    
    // Posicionar el tooltip junto al cursor
    const x = event.pageX + 15;
    const y = event.pageY + 15;
    
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

/**
 * Oculta el tooltip
 * 
 * @param {HTMLElement} tooltip - El elemento tooltip
 */
function ocultarTooltip(tooltip) {
    tooltip.style.display = 'none';
}

/**
 * Crea la leyenda de colores
 * 
 * @param {Object} data - Los datos de la casa
 * @param {HTMLElement} container - El contenedor donde se insertará la leyenda
 */
function crearLeyenda(data, container) {
    // Título de la leyenda
    const titulo = document.createElement('h3');
    titulo.textContent = 'Leyenda';
    titulo.style.marginTop = '0';
    titulo.style.marginBottom = '10px';
    container.appendChild(titulo);

    // Crear un mapa de tipos únicos y sus colores
    const tiposUnicos = new Map();
    
    // Agregar tipos de elementos de la planta
    data.planta.forEach(elemento => {
        if (!tiposUnicos.has(elemento.tipo)) {
            tiposUnicos.set(elemento.tipo, elemento.color);
        }
    });
    
    // Agregar tipos de objetos
    data.objetos.forEach(objeto => {
        if (!tiposUnicos.has(objeto.tipo)) {
            tiposUnicos.set(objeto.tipo, objeto.color);
        }
    });
    
    // Crear la lista de la leyenda
    const lista = document.createElement('ul');
    lista.style.listStyle = 'none';
    lista.style.padding = '0';
    lista.style.margin = '0';
    
    tiposUnicos.forEach((color, tipo) => {
        const item = document.createElement('li');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.marginBottom = '8px';
        
        // Cuadrado de color
        const colorBox = document.createElement('div');
        colorBox.style.width = '15px';
        colorBox.style.height = '15px';
        colorBox.style.backgroundColor = color;
        colorBox.style.border = '1px solid #000';
        colorBox.style.marginRight = '8px';
        
        // Nombre del tipo
        const nombre = document.createElement('span');
        nombre.textContent = primeraLetraMayuscula(tipo);
        
        item.appendChild(colorBox);
        item.appendChild(nombre);
        lista.appendChild(item);
    });
    
    container.appendChild(lista);
}

/**
 * Convierte la primera letra de una cadena a mayúscula
 * 
 * @param {string} texto - El texto a convertir
 * @return {string} El texto con la primera letra en mayúscula
 */
function primeraLetraMayuscula(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}