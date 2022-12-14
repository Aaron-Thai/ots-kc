
mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyb240MnV3IiwiYSI6ImNsYThybjA1YzAxYzgzb21pbjFhemRicmwifQ.UV3JfL1eYeQ89UEWfEqiZA';

let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/navigation-night-v1', // style URL
    zoom: 9, // starting zoom
    center: [-122.2,47.45] // starting center
}); 

async function geojsonFetch() {
    // make variables for the function
    let response, stores, kcneigh, table;
    response = await fetch('assets/ots.geojson'); //get earthquakes data
    stores = await response.json();
    response = await fetch('assets/KC_neigh.geojson'); //get japan data
    kcneigh = await response.json();


    //load data to the map as new layers and table on the side.
    map.on('load', function loadingData() {

        // add king county neighborhoods
        map.addSource('kcneigh', {
            type: 'geojson',
            data: kcneigh
        });

        map.addLayer({
            'id': 'kcneigh-layer',
            'type': 'fill',
            'source': 'kcneigh',
            'paint': {
                'fill-color': '#0080ff', // blue color fill
                'fill-opacity': 0.5
            }
        });

        // add stores
        map.addSource('stores', {
            type: 'geojson',
            data: stores
        });

        map.addLayer({
            'id': 'stores-layer',
            'type': 'circle',
            'source': 'stores',
            'paint': {
                'circle-radius': 8,
                'circle-stroke-width': 2,
                'circle-color': 'red',
                'circle-stroke-color': 'white'
            }
        });

        // click on tree to view store name in a popup
        map.on('click', 'stores-layer', (event) => {
            new mapboxgl.Popup()
            .setLngLat(event.features[0].geometry.coordinates)
            .setHTML(`${event.features[0].properties.Name}`)
            .addTo(map);
        });

        // on hover show neighborhood name
        map.on('mousemove', ({point}) => {
        const neigh = map.queryRenderedFeatures(point, {
            layers: ['kcneigh-layer']
        });
        document.getElementById('text-description').innerHTML = neigh.length ?
            `<p>Neighborhood: <em><strong>${neigh[0].properties.NEIGHBORHOOD_NAME}</strong></em></p>` :
            `<p>Hover over a neighborhood!</p>`
            ;
        }); 
    });

    
    // make a table for our stores data, inside function where we made stores variable
    table = document.getElementsByTagName("table")[0];
        // make variables to make a table
        let row, cell1;
        for (let i = 0; i < stores.features.length; i++) {
            // Create an empty <tr> element and add it to the 1st position of the table:
            row = table.insertRow(-1);
            cell1 = row.insertCell(0);
            cell1.innerHTML = stores.features[i].properties.Name;          
    }
    
};

// call the function we just made
geojsonFetch();

// connect html element button to our code
let btn = document.getElementById("sort-button");
btn.addEventListener('click', sortTable);

// sort the table alphabetically with localeCompare
function sortTable(e) {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementsByTagName("table")[0];
    switching = true;
    // Make a loop that will continue until
    // no switching has been done:
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        // Loop through all table rows (except the
        // first, which contains table headers):
        for (i = 1; i < (rows.length - 1); i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            // Get the two elements you want to compare,
            // one from current row and one from the next:
            x = rows[i].getElementsByTagName("td")[0].innerHTML;
            y = rows[i + 1].getElementsByTagName("td")[0].innerHTML;
            //check if the two rows should switch place:
            if (x.localeCompare(y) == 1) {
                //if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            // If a switch has been marked, make the switch
            // and mark that a switch has been done:
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}
