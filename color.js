const map = new Object()
async function init() {
    // try to load map 10 times
    let i = 0;
    const MAX_LOOPS = 10;
    // retry if blank page is loaded from iframe
    while (!map.svg || !map.svg.querySelectorAll('#counties path').length) {
        i++;
        if (i > MAX_LOOPS) {
            console.error('Could not retrieve map.');
            break;
        }
        console.log('Retrieving map...');
        await loadMap();
    }
    // this will not work by opening html from local file
    // use npm module http-server instead
    fetch('years_states_named.json') // this is the input json file for the data
    .then(response => response.json())
    .then(data => {
        // retrieve svg for color editing
        map.data = data;
        // calculate incidents per 1m miles and save in data set
        recordRatios();
        // compute maximum values occurring in data set
        map.max = {};
        ['incidents', 'miles', 'ratio'].forEach(dataKey => {
            map.max[dataKey] = getMax(dataKey);
        })
        console.log('data initialized')
        // set year slider to 2022
        document.querySelector('#yearSlider').value = 2022;
        console.log("Slider set.");
        // set default mode
        map.mode = 'incidents';
        updateColors();
        updateScale('red'); // start with a red gradient
    })
    .catch(error => console.error(error));   
}

// attempt to load map with delay to allow svg to be retrieved
async function loadMap() {
    const DELAY = 250;
    let promise = new Promise((resolve, reject) => {
        map.svg = document.querySelector('#map').contentDocument;
        setTimeout(() => resolve('done!'), DELAY);
    })
    await promise;
}

['incidents','miles','ratio'].forEach(id => {
    document.querySelector(`#${id}`).addEventListener('click', handleButton);
})

// respond to button clicks
function handleButton() {
    map.mode = this.id;
    updateColors();
    updateScale();
    updateTitle();
}

// update year text to match slider position
document.querySelector('#yearSlider').addEventListener('input', () => {
    document.querySelector('#year').textContent = document.querySelector('#yearSlider').value;
    updateColors()
})

// update all county colors from map.data
function updateColors() {
    const year = document.querySelector('#yearSlider').value;
    // reset all counties
    for (const county of map.svg.querySelectorAll('#counties path')) {
        county.style.fill='gray';
        county.style.stroke='none';
    }
    // change fill color for states that appear in data
    for (const [stateName, values] of Object.entries(map.data[year])) {
        let color;
        // code block
        let count = +map.data[year][stateName][map.mode];
        if (!count) {
            colorState(stateName, 'gray');
            // update text to show on hover
            updateHoverText(stateName, '0*');
            continue;
        }
        let hue = (count / map.max[map.mode]) * 255;
        // apply hue to color depending on data type
        switch(map.mode) {
            case 'incidents':
                color = `rgb(255, ${255 - hue}, ${255 - hue})`;
                break;
            case 'miles':
                color = `rgb(${255 - hue}, 255, ${255 - hue})`;
                break;
            case 'ratio':
                color = `rgb(${255 - hue}, ${255 - hue}, 255)`;
                break;
        }
        colorState(stateName, color);
        updateHoverText(stateName, count);
    }
}

function colorState(stateName, color) {
    try {
        for (const county of map.svg.querySelectorAll(`#${stateName.trim()} path`)) {
            county.style.fill = color;
        }
    }
    catch(TypeError) {
        console.log('Could not color region ' + stateName);
    }
}

function calcIncidentsPer100kMiles(incidents, miles) {
    return (incidents / miles) * 100000;
}

// TODO: consolidate loops to fix redundancies 

// Get maximum occurring count of incidents/miles
function getMax(key) {
    let max = 0;
    for (const [year, yearValues] of Object.entries(map.data)) {
        for (const [stateCounty, stateCountyValues] of Object.entries(yearValues)) {
            let count = +map.data[+year][stateCounty][key];
            if (isNaN(count) || !isFinite(count)) {
                continue;
            }
            if (count > max) {
                max = count;
            }
        }
    }
    return max;
}


//
function recordRatios() {
    for (const [year, yearValues] of Object.entries(map.data)) {
        for (const [state, stateValues] of Object.entries(yearValues)) {
            map.data[year][state]['ratio'] = calcIncidentsPer100kMiles(+map.data[year][state]['incidents'], +map.data[year][state]['miles']);
        }
    }
}

function updateScale() {
    let gradientColor;
    switch(map.mode) {
        case 'incidents': gradientColor = 'red'; break;
        case 'miles': gradientColor = 'green'; break;
        case 'ratio': gradientColor = 'blue'; break;
    }
    document.querySelector('#key').style.background = `linear-gradient(to right, white 0%, ${gradientColor} 100%)`
    // set max value at end of gradient
    document.querySelector('#maxValue').textContent = parseInt(map.max[map.mode]);
}

function updateTitle() {
    let text;
    switch(map.mode) {
        case 'incidents': text = 'INCIDENTS'; break;
        case 'miles': text = 'OPERATING MILES'; break;
        case 'ratio': text = 'INCIDENTS PER 100K MILES'; break;
    }
    document.querySelector("#title").textContent = `RAIL ${text}`;
}

// change hover text for each county
function updateHoverText(stateName, count) {
    // round decimals to 2 places
    if (+count % 1 != 0) {
        count = (+count).toFixed(2)
    }
    // assign count if is NAN
    if (isNaN(count)) {
        count = '0*';
    }
    try {
        titles = map.svg.querySelectorAll(`#${stateName} title`);
    }
    catch(TypeError) {
        console.log('Could not update text for ' + stateName);
    }
    titles.forEach(node => {
        node.textContent = `${stateName} : ${count}`;
    });
}
init();

