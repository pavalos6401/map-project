let map, next, min, max;

function initMap() {
  const CHICAGO_BOUNDS = {
    north: 42.03,
    south: 41.78,
    west: -87.95,
    east: -87.5,
  };
  const chicago = {
    lat: 41.85,
    lng: -87.65,
  };
  map = new google.maps.Map(document.getElementById("map"), {
    mapId: "7f2223121d65f8c0",
    zoom: 13,
    center: chicago,
    restriction: {
      latLngBounds: CHICAGO_BOUNDS,
      strictBounds: false,
    },
  });
  const infowindow = new google.maps.InfoWindow();
  map.data.loadGeoJson("map.geojson");

  map.addListener("click", function () {
    infowindow.close();
  });
  //fetch geojson data from the local file
  fetch("./map.geojson")
    .then((res) => res.json())
    .then(handleResponse)
    .catch((err) => console.log(err));
  let temps = new Array(20); //row:the number of nodes, col: the number of temps
  let sums1 = new Array(49).fill(0);
  let averages1 = new Array(49);
  let sums2 = new Array(20).fill(0);
  let averages2 = new Array(20);
  for (let i = 0; i < temps.length; i++) {
    temps[i] = new Array(49);
  }
  function handleResponse(res) {
    for (let i = 0; i < res.features.length; i++) {
      for (let j = 0; j < temps[0].length; j++) {
        temps[i][j] = parseFloat(
          res.features[i].properties[`temp${j}`].split(" ")[2]
        );
      }
    }
    let min = temps[0][0];
    let max = temps[0][0];
    for (let k = 0; k < sums1.length; k++) {
      for (let l = 0; l < temps.length; l++) {
        sums1[k] = sums1[k] + temps[l][k];
        if (temps[l][k] < min) {
          min = temps[l][k];
        }
        if (temps[l][k] > max) {
          max = temps[l][k];
        }
      }
      averages1[k] = (sums1[k] / res.features.length).toFixed(2);
    }
    for (let m = 0; m < 20; m++) {
      for (let n = 0; n < 49; n++) {
        sums2[m] = sums2[m] + temps[m][n];
      }
      averages2[m] = (sums2[m] / 49).toFixed(2);
    }
  }

  let evt = null;
  next = 0;
  map.data.addListener("click", function (event) {
    const temperature = event.feature.getProperty(`temp${next}`);
    infowindow.setContent(
      "<div style='width:auto; font-size:large'>" +
        "Location: "+
        event.feature.getProperty("addr")+
        "</br>"+
        "Temperature: " +
        temperature +
        "</br>" +
        "Average: " +
        averages2[event.feature.getProperty("id")] +
        "</div>"
    );
    infowindow.setPosition(event.feature.getGeometry().get());
    infowindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
    infowindow.open(map);
    evt = event;
  });

  function refresh() {
    map.data.setStyle((feature) => {
      const temp = feature.getProperty(`temp${next}`).split(" ")[2];
      let hue = -2.14 * temp + 222.86; //104-->0, -22-->270 
      let category = `hsl(${hue},100%,50%)`;
      return {
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: category,
          fillOpacity: 1.0,
          strokeWeight: 6,
          strokeOpacity: 0.8,
          strokeColor: category,
          rotation: 30,
        },
      };
    });
  }
  refresh();

  //set weather control
  const weatherControlDiv = document.createElement("div");
  weatherControl(weatherControlDiv, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(weatherControlDiv);
  function weatherControl(controlDiv, map) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginBottom = "22px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Click to change the weather";
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    const slider = document.createElement("div", {class:"slidecontainer"});
    slider.style.color = "rgb(25,25,25)";
    slider.style.fontFamily = "Roboto,Arial,sans-serif";
    slider.style.fontSize = "16px";
    slider.style.lineHeight = "38px";
    slider.style.paddingLeft = "5px";
    slider.style.paddingRight = "5px";
    slider.innerHTML = '<input type="range" min="0" max="48" value="0" class="slider" id="myRange">'
    slider.oninput = function() {
      next = document.getElementById("myRange").value;
      infowindow.setContent(
        "<div style='width:auto; font-size:large'>" +
        "Location: "+
        evt.feature.getProperty("addr")+
        "</br>"+
          "temperature: " +
          evt.feature.getProperty(`temp${next}`) +
          "</br>" +
          "Average: " +
          averages2[evt.feature.getProperty("id")] +
          "</div>"
      );
      refresh();
    }

    controlUI.appendChild(slider);
  }

  //set average control
  const averagesControlDiv = document.createElement("div");
  averagesControl(averagesControlDiv, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(averagesControlDiv);
  function averagesControl(controlDiv, map) {
    // Set CSS for the control border.
    const averageslUI = document.createElement("div");
    averageslUI.style.backgroundColor = "#fff";
    averageslUI.style.border = "2px solid #fff";
    averageslUI.style.borderRadius = "3px";
    averageslUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    averageslUI.style.cursor = "pointer";
    averageslUI.style.marginTop = "8px";
    averageslUI.style.marginBottom = "22px";
    averageslUI.style.marginLeft = "8px";
    averageslUI.style.textAlign = "center";
    averageslUI.title = "Click to calculate the average";
    controlDiv.appendChild(averageslUI);

    // Set CSS for the control interior.
    const averagesText = document.createElement("div");
    averagesText.style.color = "rgb(25,25,25)";
    averagesText.style.fontFamily = "Roboto,Arial,sans-serif";
    averagesText.style.fontSize = "16px";
    averagesText.style.lineHeight = "38px";
    averagesText.style.paddingLeft = "5px";
    averagesText.style.paddingRight = "5px";
    averagesText.innerHTML = "Calculate Average Over The Whole Area";
    averageslUI.appendChild(averagesText);
    averageslUI.addEventListener("click", () => {
      averagesText.innerHTML = `Calculate Average Over The Whole Area: ${averages1[next]}`;
    });
  }

  //set temperature-range control
  range = document.getElementsByName("range")[0];
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(range);
}

function rangeChanged(value) {
  map.data.setMap(null);
  map.data.loadGeoJson("./map.geojson", {}, function (features) {
    map.data.setStyle((feature) => {
      const temp = parseInt(feature.getProperty(`temp${next}`).split(" ")[2]);
      let hue = -2.14 * temp + 222.86; //104-->0, -22-->270 
      let category = `hsl(${hue},100%,50%)`;
      if (temp >= parseInt(value)) {
        return {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: category,
            fillOpacity: 1.0,
            strokeWeight: 6,
            strokeOpacity: 0.8,
            strokeColor: category,
            rotation: 30,
          },
          visible: true,
        };
      } else {
        return {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: category,
            fillOpacity: 1.0,
            strokeWeight: 6,
            strokeOpacity: 0.8,
            strokeColor: category,
            rotation: 30,
          },
          visible: false,
        };
      }
    });
    map.data.setMap(map);
  });
}
