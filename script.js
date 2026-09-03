// ============================================================
// FloodPulse
// Smart Rainfall + Flood-Aware Route Planner
// ============================================================


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let map;

let startPoint = null;
let destinationPoint = null;

let startMarker = null;
let destinationMarker = null;

let routeLayer = null;


// ============================================================
// INITIALIZE MAP
// ============================================================

map = L.map("map").setView(
    [31.5204, 74.3587],
    12
);


// OpenStreetMap tiles
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ============================================================
// DISPLAY FLOOD / WATERLOGGING ZONES
// ============================================================

if (typeof floodZones !== "undefined") {

    floodZones.forEach(zone => {

        let circleColor = "orange";

        if (zone.risk === "HIGH") {
            circleColor = "red";
        }

        L.circle(
            [
                zone.latitude,
                zone.longitude
            ],
            {
                radius: zone.radius,
                color: circleColor,
                fillColor: circleColor,
                fillOpacity: 0.20,
                weight: 2
            }
        )
        .addTo(map)
        .bindPopup(

            `<b>🌊 ${zone.name}</b>
            <br>
            Risk Level:
            <strong>${zone.risk}</strong>
            <br>
            <small>
            Historical / reported waterlogging risk
            </small>`

        );

    });

}


// ============================================================
// MAP CLICK HANDLER
// ============================================================

map.on("click", function (event) {

    // Skip routing logic entirely while a citizen flood report is
    // being placed, so this handler and the report click handler
    // (further down) don't both react to the same click.
    if (reportingFlood) {
        return;
    }

    const latitude = event.latlng.lat;
    const longitude = event.latlng.lng;


    // --------------------------------------------------------
    // FIRST CLICK = START
    // --------------------------------------------------------

    if (startPoint === null) {

        startPoint = [
            latitude,
            longitude
        ];


        if (startMarker) {
            map.removeLayer(startMarker);
        }


        startMarker = L.marker(
            [
                latitude,
                longitude
            ]
        )
        .addTo(map)
        .bindPopup(
            "<b>📍 Starting Location</b>"
        )
        .openPopup();


        document.getElementById("routeInfo").innerHTML =

            `<h2>📍 Starting location selected</h2>

            <p>
            Now click on the map to select your destination.
            </p>`;

        return;
    }


    // --------------------------------------------------------
    // SECOND CLICK = DESTINATION
    // --------------------------------------------------------

    if (destinationPoint === null) {

        destinationPoint = [
            latitude,
            longitude
        ];


        if (destinationMarker) {
            map.removeLayer(destinationMarker);
        }


        destinationMarker = L.marker(
            [
                latitude,
                longitude
            ]
        )
        .addTo(map)
        .bindPopup(
            "<b>🏁 Destination</b>"
        )
        .openPopup();


        calculateRoute();

        return;
    }


    // --------------------------------------------------------
    // THIRD CLICK = RESET
    // --------------------------------------------------------

    resetRoute();


    startPoint = [
        latitude,
        longitude
    ];


    startMarker = L.marker(
        [
            latitude,
            longitude
        ]
    )
    .addTo(map)
    .bindPopup(
        "<b>📍 Starting Location</b>"
    )
    .openPopup();


    document.getElementById("routeInfo").innerHTML =

        `<h2>📍 New starting location selected</h2>

        <p>
        Click another location to select your destination.
        </p>`;

});


// ============================================================
// CALCULATE ROUTE
// ============================================================

async function calculateRoute() {

    if (!startPoint || !destinationPoint) {
        return;
    }


    document.getElementById("routeInfo").innerHTML =

        `<h2>🛣️ Calculating routes...</h2>

        <p>
        Please wait while RainRoute analyzes the available routes.
        </p>`;


    try {

        // ----------------------------------------------------
        // START COORDINATES
        // ----------------------------------------------------

        const startLatitude =
            startPoint[0];

        const startLongitude =
            startPoint[1];


        // ----------------------------------------------------
        // DESTINATION COORDINATES
        // ----------------------------------------------------

        const destinationLatitude =
            destinationPoint[0];

        const destinationLongitude =
            destinationPoint[1];


        // ----------------------------------------------------
        // OSRM ROUTING API
        // ----------------------------------------------------

        const url =

            `https://router.project-osrm.org/route/v1/driving/` +

            `${startLongitude},${startLatitude};` +

            `${destinationLongitude},${destinationLatitude}` +

            `?overview=full&geometries=geojson&alternatives=true`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        // ----------------------------------------------------
        // CHECK ROUTE
        // ----------------------------------------------------

        if (
            !data.routes ||
            data.routes.length === 0
        ) {

            throw new Error(
                "No route found."
            );

        }


        // ----------------------------------------------------
        // GET ALL ROUTES
        // ----------------------------------------------------

        const routes =
            data.routes;


        console.log(
            "Routes found:",
            routes.length
        );


        // ----------------------------------------------------
        // REMOVE PREVIOUS ROUTES
        // ----------------------------------------------------

        if (routeLayer) {

            map.removeLayer(
                routeLayer
            );

        }


        // ----------------------------------------------------
        // CREATE ROUTE LAYER GROUP
        // ----------------------------------------------------

        routeLayer =
            L.layerGroup().addTo(map);


        // ----------------------------------------------------
        // DRAW ALL ROUTES
        // ----------------------------------------------------

        routes.forEach(
            (currentRoute, index) => {

                const isPrimaryRoute =
                    index === 0;


                const routeLine =
                    L.geoJSON(
                        currentRoute.geometry,
                        {
                            style: {

                                color:
                                    isPrimaryRoute
                                        ? "blue"
                                        : "purple",

                                weight:
                                    isPrimaryRoute
                                        ? 7
                                        : 5,

                                opacity:
                                    isPrimaryRoute
                                        ? 0.85
                                        : 0.65

                            }
                        }
                    );


                routeLine
                    .bindPopup(

                        `<b>
                        🛣️ Route ${index + 1}
                        </b>

                        <br>

                        ${
                            isPrimaryRoute
                                ? "Fastest Route"
                                : "Alternative Route"
                        }`

                    )
                    .addTo(routeLayer);

            }
        );


        // ----------------------------------------------------
        // ZOOM TO ALL ROUTES
        // ----------------------------------------------------

        const allRouteBounds =
            L.latLngBounds();


        routes.forEach(
            currentRoute => {

                const routeGeoJSON =
                    L.geoJSON(
                        currentRoute.geometry
                    );


                allRouteBounds.extend(
                    routeGeoJSON.getBounds()
                );

            }
        );


        map.fitBounds(
            allRouteBounds,
            {
                padding: [30, 30]
            }
        );


        // ----------------------------------------------------
        // ANALYZING MESSAGE
        // ----------------------------------------------------

        document.getElementById(
            "routeInfo"
        ).innerHTML =

            `<h2>🧠 RainRoute Intelligence</h2>

            <p>
            ${routes.length}
            possible route(s) found.
            </p>

            <p>
            🌧️ Analyzing rainfall...
            </p>

            <p>
            🌊 Checking waterlogging risk...
            </p>`;


        // ----------------------------------------------------
        // ANALYZE ALL ROUTES
        // ----------------------------------------------------

        const routeAnalyses = [];


        for (
            let i = 0;
            i < routes.length;
            i++
        ) {

            const analysis =
                await analyzeRoute(
                    routes[i],
                    i + 1
                );


            routeAnalyses.push(
                analysis
            );

        }


        // ----------------------------------------------------
        // FIND SAFEST ROUTE
        // ----------------------------------------------------

        let safestRoute =
            routeAnalyses[0];


        routeAnalyses.forEach(
            analysis => {

                if (
                    analysis.safetyScore <
                    safestRoute.safetyScore
                ) {

                    safestRoute =
                        analysis;

                }

            }
        );


        // ----------------------------------------------------
        // DISPLAY ROUTE COMPARISON
        // ----------------------------------------------------

        displayRouteComparison(
            routeAnalyses,
            safestRoute
        );


    }

    catch (error) {

        console.error(
            "Route calculation error:",
            error
        );


        document.getElementById(
            "routeInfo"
        ).innerHTML =

            `<h2>⚠️ Route Error</h2>

            <p>
            Unable to calculate the route.
            </p>

            <p>
            Please try selecting the locations again.
            </p>`;

    }

}


// ============================================================
// ANALYZE ONE ROUTE
// ============================================================

async function analyzeRoute(
    route,
    routeNumber
) {

    // --------------------------------------------------------
    // DISTANCE
    // --------------------------------------------------------

    const distance =
        route.distance / 1000;


    // --------------------------------------------------------
    // DURATION
    // --------------------------------------------------------

    const duration =
        Math.round(
            route.duration / 60
        );


    // --------------------------------------------------------
    // RAINFALL
    // --------------------------------------------------------

    const rainfall =
        await analyzeRouteRainfall(
            route.geometry.coordinates
        );


    // --------------------------------------------------------
    // FLOOD RISK
    // --------------------------------------------------------

    const flood =
        analyzeRouteFloodRisk(
            route.geometry.coordinates
        );


    // --------------------------------------------------------
    // CITIZEN-REPORTED FLOODING
    // --------------------------------------------------------

    const citizen =
        analyzeRouteCitizenReports(
            route.geometry.coordinates
        );


    // --------------------------------------------------------
    // SAFETY SCORE
    // --------------------------------------------------------

    const safetyScore =
        calculateOverallRisk(

            rainfall.averageRainfall,

            rainfall.maximumRainfall,

            flood.highRiskZones,

            flood.moderateRiskZones,

            citizen.highReports,

            citizen.moderateReports,

            citizen.lowReports,

            distance

        );


    // --------------------------------------------------------
    // RECOMMENDATION
    // --------------------------------------------------------

    const recommendation =
        getRiskRecommendation(
            safetyScore
        );


    return {

        routeNumber,

        distance,

        duration,

        averageRainfall:
            rainfall.averageRainfall,

        maximumRainfall:
            rainfall.maximumRainfall,

        highRiskZones:
            flood.highRiskZones,

        moderateRiskZones:
            flood.moderateRiskZones,

        highReports:
            citizen.highReports,

        moderateReports:
            citizen.moderateReports,

        lowReports:
            citizen.lowReports,

        safetyScore,

        recommendation,

        rainfallPoints:
            rainfall.selectedPoints,

        rainfallValues:
            rainfall.rainfallValues

    };

}


// ============================================================
// ANALYZE RAINFALL FOR ONE ROUTE
// ============================================================

async function analyzeRouteRainfall(
    coordinates
) {

    const numberOfPoints = 7;

    const selectedPoints = [];


    // --------------------------------------------------------
    // SELECT POINTS ALONG ROUTE
    // --------------------------------------------------------

    for (
        let i = 0;
        i < numberOfPoints;
        i++
    ) {

        const index =
            Math.floor(

                i *
                (coordinates.length - 1) /
                (numberOfPoints - 1)

            );


        selectedPoints.push(
            coordinates[index]
        );

    }


    // --------------------------------------------------------
    // WEATHER REQUESTS
    // --------------------------------------------------------

    const weatherRequests =
        selectedPoints.map(
            point => {

                const longitude =
                    point[0];

                const latitude =
                    point[1];


                const url =

                    `https://api.open-meteo.com/v1/forecast?` +

                    `latitude=${latitude}` +

                    `&longitude=${longitude}` +

                    `&hourly=precipitation` +

                    `&forecast_days=1`;


                return fetch(url)
                    .then(
                        response =>
                            response.json()
                    );

            }
        );


    // --------------------------------------------------------
    // WAIT FOR WEATHER DATA
    // --------------------------------------------------------

    const weatherData =
        await Promise.all(
            weatherRequests
        );


    // --------------------------------------------------------
    // EXTRACT RAINFALL
    // --------------------------------------------------------

    const rainfallValues =
        weatherData.map(
            weather => {

                if (
                    weather.hourly &&
                    weather.hourly.precipitation
                ) {

                    return (
                        weather.hourly
                            .precipitation[0] || 0
                    );

                }

                return 0;

            }
        );


    // --------------------------------------------------------
    // MAXIMUM RAINFALL
    // --------------------------------------------------------

    const maximumRainfall =
        Math.max(
            ...rainfallValues
        );


    // --------------------------------------------------------
    // AVERAGE RAINFALL
    // --------------------------------------------------------

    const totalRainfall =
        rainfallValues.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    const averageRainfall =
        totalRainfall /
        rainfallValues.length;


    return {

        averageRainfall,

        maximumRainfall,

        rainfallValues,

        selectedPoints

    };

}


// ============================================================
// ANALYZE FLOOD RISK FOR ONE ROUTE
// ============================================================

function analyzeRouteFloodRisk(
    coordinates
) {

    let highRiskZones = 0;

    let moderateRiskZones = 0;


    // --------------------------------------------------------
    // CHECK EVERY FLOOD ZONE
    // --------------------------------------------------------

    if (
        typeof floodZones === "undefined"
    ) {

        return {

            highRiskZones: 0,

            moderateRiskZones: 0

        };

    }


    floodZones.forEach(
        zone => {

            let zoneDetected = false;


            // ------------------------------------------------
            // CHECK ROUTE POINTS
            // ------------------------------------------------

            coordinates.forEach(
                point => {

                    const routeLongitude =
                        point[0];

                    const routeLatitude =
                        point[1];


                    const distance =
                        calculateDistance(

                            routeLatitude,

                            routeLongitude,

                            zone.latitude,

                            zone.longitude

                        );


                    if (
                        distance <= zone.radius
                    ) {

                        zoneDetected = true;

                    }

                }
            );


            // ------------------------------------------------
            // COUNT ZONES
            // ------------------------------------------------

            if (zoneDetected) {

                if (
                    zone.risk === "HIGH"
                ) {

                    highRiskZones++;

                }

                else if (
                    zone.risk === "MODERATE"
                ) {

                    moderateRiskZones++;

                }

            }

        }
    );


    return {

        highRiskZones,

        moderateRiskZones

    };

}


// ============================================================
// ANALYZE CITIZEN-REPORTED FLOODING FOR ONE ROUTE
// ============================================================

function analyzeRouteCitizenReports(
    coordinates
) {

    const reports =
        JSON.parse(
            localStorage.getItem(
                "rainRouteReports"
            )
        ) || [];


    let highReports = 0;

    let moderateReports = 0;

    let lowReports = 0;


    // Same idea as analyzeRouteFloodRisk, but against live
    // citizen reports instead of the static flood zone list.
    // A report "counts" for a route if any of the route's
    // points falls within this radius of it.

    const proximityThreshold = 500; // meters


    reports.forEach(
        report => {

            let reportDetected = false;


            coordinates.forEach(
                point => {

                    const routeLongitude =
                        point[0];

                    const routeLatitude =
                        point[1];


                    const distance =
                        calculateDistance(

                            routeLatitude,

                            routeLongitude,

                            report.latitude,

                            report.longitude

                        );


                    if (
                        distance <= proximityThreshold
                    ) {

                        reportDetected = true;

                    }

                }
            );


            if (reportDetected) {

                if (
                    report.waterLevel === "HIGH"
                ) {

                    highReports++;

                }

                else if (
                    report.waterLevel === "MODERATE"
                ) {

                    moderateReports++;

                }

                else if (
                    report.waterLevel === "LOW"
                ) {

                    lowReports++;

                }

            }

        }
    );


    return {

        highReports,

        moderateReports,

        lowReports

    };

}


// ============================================================
// CALCULATE DISTANCE BETWEEN GPS POINTS
// ============================================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius =
        6371000;


    const latDifference =
        (lat2 - lat1) *
        Math.PI / 180;


    const lonDifference =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =

        Math.sin(
            latDifference / 2
        ) *
        Math.sin(
            latDifference / 2
        )

        +

        Math.cos(
            lat1 * Math.PI / 180
        )

        *

        Math.cos(
            lat2 * Math.PI / 180
        )

        *

        Math.sin(
            lonDifference / 2
        )

        *

        Math.sin(
            lonDifference / 2
        );


    const c =

        2 *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(1 - a)

        );


    return earthRadius * c;

}


// ============================================================
// CALCULATE OVERALL ROUTE RISK
// ============================================================

function calculateOverallRisk(

    averageRainfall,

    maximumRainfall,

    highRiskZones,

    moderateRiskZones,

    highReports,

    moderateReports,

    lowReports,

    routeDistance

) {


    // --------------------------------------------------------
    // RAINFALL SCORE
    // --------------------------------------------------------

    let rainfallScore = 10;


    if (
        maximumRainfall >= 10
    ) {

        rainfallScore = 100;

    }

    else if (
        maximumRainfall >= 5
    ) {

        rainfallScore = 80;

    }

    else if (
        maximumRainfall >= 2
    ) {

        rainfallScore = 55;

    }

    else if (
        maximumRainfall >= 1
    ) {

        rainfallScore = 30;

    }


    // --------------------------------------------------------
    // HISTORICAL FLOOD-ZONE SCORE
    // --------------------------------------------------------

    let historicalScore = 10;


    if (
        highRiskZones >= 2
    ) {

        historicalScore = 100;

    }

    else if (
        highRiskZones === 1
    ) {

        historicalScore = 80;

    }

    else if (
        moderateRiskZones >= 2
    ) {

        historicalScore = 55;

    }

    else if (
        moderateRiskZones === 1
    ) {

        historicalScore = 35;

    }


    // --------------------------------------------------------
    // CITIZEN REPORT SCORE
    // --------------------------------------------------------

    let citizenScore = 10;


    if (
        highReports >= 2
    ) {

        citizenScore = 100;

    }

    else if (
        highReports === 1
    ) {

        citizenScore = 80;

    }

    else if (
        moderateReports >= 2
    ) {

        citizenScore = 55;

    }

    else if (
        moderateReports === 1
    ) {

        citizenScore = 35;

    }

    else if (
        lowReports >= 1
    ) {

        citizenScore = 20;

    }


    // --------------------------------------------------------
    // DISTANCE SCORE
    // --------------------------------------------------------

    let distanceScore = 20;


    if (
        routeDistance > 30
    ) {

        distanceScore = 100;

    }

    else if (
        routeDistance > 20
    ) {

        distanceScore = 75;

    }

    else if (
        routeDistance > 10
    ) {

        distanceScore = 45;

    }


    // --------------------------------------------------------
    // FINAL SCORE
    // Rainfall 30% / Historical 35% / Citizen 25% / Distance 10%
    // --------------------------------------------------------

    const score =

        (rainfallScore * 0.30)

        +

        (historicalScore * 0.35)

        +

        (citizenScore * 0.25)

        +

        (distanceScore * 0.10);


    return Math.round(score);

}


// ============================================================
// RISK RECOMMENDATION
// ============================================================

function getRiskRecommendation(
    score
) {

    if (
        score >= 75
    ) {

        return {

            level: "HIGH RISK",

            emoji: "🔴",

            message:
                "Avoid this route if possible."

        };

    }

    else if (
        score >= 50
    ) {

        return {

            level: "MODERATE RISK",

            emoji: "🟡",

            message:
                "Travel with caution."

        };

    }

    else {

        return {

            level: "LOW RISK",

            emoji: "🟢",

            message:
                "This route appears relatively safer."

        };

    }

}


// ============================================================
// DISPLAY ROUTE COMPARISON
// ============================================================

function displayRouteComparison(
    routeAnalyses,
    safestRoute
) {

    let comparisonHTML =

        `<hr>

        <h2>
        🛣️ Route Comparison
        </h2>`;


    // --------------------------------------------------------
    // DISPLAY EACH ROUTE
    // --------------------------------------------------------

    routeAnalyses.forEach(
        analysis => {

            const isRecommended =

                analysis.routeNumber ===
                safestRoute.routeNumber;


            comparisonHTML +=

                `<div style="
                    padding: 15px;
                    margin: 12px 0;
                    border-radius: 12px;
                    background: ${
                        isRecommended
                            ? "#e8f5e9"
                            : "#f5f5f5"
                    };
                    border: ${
                        isRecommended
                            ? "3px solid green"
                            : "1px solid #ccc"
                    };
                ">

                    <h3>

                        🛣️ Route
                        ${analysis.routeNumber}

                        ${
                            isRecommended
                                ? " ⭐ RECOMMENDED"
                                : ""
                        }

                    </h3>


                    <p>

                    📏
                    <strong>Distance:</strong>

                    ${analysis.distance.toFixed(2)}
                    km

                    </p>


                    <p>

                    ⏱️
                    <strong>Time:</strong>

                    ${analysis.duration}
                    minutes

                    </p>


                    <p>

                    🌧️
                    <strong>Maximum rainfall:</strong>

                    ${analysis.maximumRainfall.toFixed(2)}
                    mm

                    </p>


                    <p>

                    🌊
                    <strong>High-risk flood zones:</strong>

                    ${analysis.highRiskZones}

                    </p>


                    <p>

                    🌊
                    <strong>Moderate-risk flood zones:</strong>

                    ${analysis.moderateRiskZones}

                    </p>


                    <p>

                    🧑‍🤝‍🧑
                    <strong>Citizen reports nearby:</strong>

                    ${analysis.highReports}
                    high,
                    ${analysis.moderateReports}
                    moderate,
                    ${analysis.lowReports}
                    low

                    </p>


                    <h3>

                    ${analysis.recommendation.emoji}

                    Safety Score:

                    ${analysis.safetyScore}/100

                    </h3>


                    <p>

                    <strong>
                    ${analysis.recommendation.level}
                    </strong>

                    </p>

                </div>`;

        }
    );


    // --------------------------------------------------------
    // FINAL RECOMMENDATION
    // --------------------------------------------------------

    comparisonHTML +=

        `<hr>

        <div style="
            padding: 20px;
            border-radius: 15px;
            background: #eef7ff;
            text-align: center;
        ">

            <h2>
            ⭐ FloodPulse Recommendation
            </h2>


            <h1>

            🛣️ Route
            ${safestRoute.routeNumber}

            </h1>


            <h2>

            ${safestRoute.recommendation.emoji}

            ${safestRoute.safetyScore}/100

            </h2>


            <h3>

            ${safestRoute.recommendation.level}

            </h3>


            <p>

            ${safestRoute.recommendation.message}

            </p>


            <p>

            FloodPulse selected this route based on
            rainfall, historical waterlogging risk,
            and route distance.

            </p>

        </div>`;


    // --------------------------------------------------------
    // DISPLAY
    // --------------------------------------------------------

    document.getElementById(
        "routeInfo"
    ).innerHTML = comparisonHTML;


    // --------------------------------------------------------
    // ADD RAINFALL MARKERS FOR SAFEST ROUTE
    // --------------------------------------------------------

    safestRoute.rainfallPoints.forEach(
        (point, index) => {

            const longitude =
                point[0];

            const latitude =
                point[1];


            const rainfall =
                safestRoute.rainfallValues[index];


            let markerColor = "green";


            if (
                rainfall >= 5
            ) {

                markerColor = "red";

            }

            else if (
                rainfall >= 1
            ) {

                markerColor = "orange";

            }


            const circle =
                L.circleMarker(

                    [
                        latitude,
                        longitude
                    ],

                    {
                        radius: 8,
                        color: markerColor,
                        fillColor: markerColor,
                        fillOpacity: 0.8
                    }

                ).addTo(map);


            circle.bindPopup(

                `<b>
                🌧️ Rainfall Point ${index + 1}
                </b>

                <br>

                Expected precipitation:

                ${rainfall.toFixed(2)}
                mm`

            );

        }
    );

}


// ============================================================
// RESET ROUTE
// ============================================================

function resetRoute() {

    startPoint = null;

    destinationPoint = null;


    // --------------------------------------------------------
    // REMOVE START MARKER
    // --------------------------------------------------------

    if (startMarker) {

        map.removeLayer(
            startMarker
        );

        startMarker = null;

    }


    // --------------------------------------------------------
    // REMOVE DESTINATION MARKER
    // --------------------------------------------------------

    if (destinationMarker) {

        map.removeLayer(
            destinationMarker
        );

        destinationMarker = null;

    }


    // --------------------------------------------------------
    // REMOVE ROUTES
    // --------------------------------------------------------

    if (routeLayer) {

        map.removeLayer(
            routeLayer
        );

        routeLayer = null;

    }


    // --------------------------------------------------------
    // RESET INFORMATION
    // --------------------------------------------------------

    document.getElementById(
        "routeInfo"
    ).innerHTML =

        `<h2>
        🗺️ FloodPulse
        </h2>

        <p>
        Click on the map to select your
        starting location.
        </p>`;

}

// ============================================================
// LOCATION SEARCH + ROUTE
// ============================================================

async function findRoute() {

    const startInput =
        document.getElementById("start").value.trim();

    const destinationInput =
        document.getElementById("destination").value.trim();


    // --------------------------------------------------------
    // CHECK INPUTS
    // --------------------------------------------------------

    if (!startInput || !destinationInput) {

        document.getElementById("routeInfo").innerHTML =

            `<h2>⚠️ Missing Location</h2>

            <p>
            Please enter both a starting location
            and a destination.
            </p>`;

        return;

    }


    // --------------------------------------------------------
    // SHOW LOADING
    // --------------------------------------------------------

    document.getElementById("routeInfo").innerHTML =

        `<h2>🔎 Finding locations...</h2>

        <p>
        FloodPulse is locating your starting point
        and destination.
        </p>`;


    try {

        // ----------------------------------------------------
        // GEOCODE START
        // ----------------------------------------------------

        const startLocation =
            await geocodeLocation(
                startInput
            );


        // ----------------------------------------------------
        // GEOCODE DESTINATION
        // ----------------------------------------------------

        const destinationLocation =
            await geocodeLocation(
                destinationInput
            );


        // ----------------------------------------------------
        // CHECK LOCATIONS
        // ----------------------------------------------------

        if (!startLocation) {

            throw new Error(
                `Could not find "${startInput}".`
            );

        }


        if (!destinationLocation) {

            throw new Error(
                `Could not find "${destinationInput}".`
            );

        }


        // ----------------------------------------------------
        // SET START POINT
        // ----------------------------------------------------

        startPoint = [

            startLocation.latitude,

            startLocation.longitude

        ];


        // ----------------------------------------------------
        // SET DESTINATION POINT
        // ----------------------------------------------------

        destinationPoint = [

            destinationLocation.latitude,

            destinationLocation.longitude

        ];


        // ----------------------------------------------------
        // REMOVE OLD MARKERS
        // ----------------------------------------------------

        if (startMarker) {

            map.removeLayer(
                startMarker
            );

        }


        if (destinationMarker) {

            map.removeLayer(
                destinationMarker
            );

        }


        // ----------------------------------------------------
        // CREATE START MARKER
        // ----------------------------------------------------

        startMarker =
            L.marker(
                startPoint
            )
            .addTo(map)
            .bindPopup(
                `<b>📍 Start</b>
                <br>
                ${startLocation.display_name}`
            );


        // ----------------------------------------------------
        // CREATE DESTINATION MARKER
        // ----------------------------------------------------

        destinationMarker =
            L.marker(
                destinationPoint
            )
            .addTo(map)
            .bindPopup(
                `<b>🏁 Destination</b>
                <br>
                ${destinationLocation.display_name}`
            );


        // ----------------------------------------------------
        // ZOOM TO START + DESTINATION
        // ----------------------------------------------------

        const locationBounds =
            L.latLngBounds(
                [
                    startPoint,
                    destinationPoint
                ]
            );


        map.fitBounds(
            locationBounds,
            {
                padding: [50, 50]
            }
        );


        // ----------------------------------------------------
        // CALCULATE ROUTE
        // ----------------------------------------------------

        await calculateRoute();

    }


    catch (error) {

        console.error(
            "Location search error:",
            error
        );


        document.getElementById(
            "routeInfo"
        ).innerHTML =

            `<h2>⚠️ Location Error</h2>

            <p>
            ${error.message}
            </p>

            <p>
            Try using a more specific location,
            such as "DHA Phase 1 Lahore".
            </p>`;

    }

}


// ============================================================
// GEOCODE LOCATION
// ============================================================

async function geocodeLocation(
    locationName
) {

    const url =

        `https://nominatim.openstreetmap.org/search?` +

        `format=json` +

        `&q=${encodeURIComponent(
            locationName + ", Lahore, Pakistan"
        )}` +

        `&limit=1`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Location service is unavailable."
        );

    }


    const data =
        await response.json();


    if (
        !data ||
        data.length === 0
    ) {

        return null;

    }


    return {

        latitude:
            parseFloat(
                data[0].lat
            ),

        longitude:
            parseFloat(
                data[0].lon
            ),

        display_name:
            data[0].display_name

    };

}

// ============================================================
// CITIZEN FLOOD REPORT SYSTEM
// ============================================================

let reportingFlood = false;

let reportLocation = null;

let reportMarker = null;


// ============================================================
// START FLOOD REPORT
// ============================================================

function startFloodReport() {

    reportingFlood = true;

    reportLocation = null;


    document.getElementById(
        "reportForm"
    ).style.display = "block";


    document.getElementById(
        "routeInfo"
    ).innerHTML =

        `<h2>📍 Select Flood Location</h2>

        <p>
        Click on the map where you are currently
        seeing waterlogging.
        </p>`;

}


// ============================================================
// MAP CLICK FOR FLOOD REPORT
// ============================================================

// We add another click listener to the map.

map.on(
    "click",
    function (event) {

        if (!reportingFlood) {
            return;
        }


        const latitude =
            event.latlng.lat;

        const longitude =
            event.latlng.lng;


        reportLocation = {

            latitude,

            longitude

        };


        // ----------------------------------------------------
        // REMOVE PREVIOUS REPORT MARKER
        // ----------------------------------------------------

        if (reportMarker) {

            map.removeLayer(
                reportMarker
            );

        }


        // ----------------------------------------------------
        // CREATE REPORT MARKER
        // ----------------------------------------------------

        reportMarker =
            L.marker(
                [
                    latitude,
                    longitude
                ]
            )
            .addTo(map)
            .bindPopup(
                "<b>🌊 Flood report location</b>"
            )
            .openPopup();


        // ----------------------------------------------------
        // UPDATE MESSAGE
        // ----------------------------------------------------

        document.getElementById(
            "routeInfo"
        ).innerHTML =

            `<h2>✅ Location Selected</h2>

            <p>
            Your flood report location has been selected.
            </p>

            <p>
            Choose the water level below and
            submit your report.
            </p>`;

    }
);


// ============================================================
// SUBMIT FLOOD REPORT
// ============================================================

function submitFloodReport() {

    if (!reportLocation) {

        alert(
            "Please click on the map to select the flooded location."
        );

        return;

    }


    const waterLevel =
        document.getElementById(
            "waterLevel"
        ).value;


    const description =
        document.getElementById(
            "reportDescription"
        ).value.trim();


    // --------------------------------------------------------
    // CREATE REPORT
    // --------------------------------------------------------

    const report = {

        id:
            Date.now(),

        latitude:
            reportLocation.latitude,

        longitude:
            reportLocation.longitude,

        waterLevel,

        description,

        timestamp:
            new Date().toLocaleString()

    };


    // --------------------------------------------------------
    // SAVE LOCALLY
    // --------------------------------------------------------

    let reports =
        JSON.parse(
            localStorage.getItem(
                "rainRouteReports"
            )
        ) || [];


    reports.push(
        report
    );


    localStorage.setItem(

        "rainRouteReports",

        JSON.stringify(
            reports
        )

    );


    // --------------------------------------------------------
    // DISPLAY REPORT
    // --------------------------------------------------------

    displayFloodReport(
        report
    );


    // --------------------------------------------------------
    // RESET REPORTING MODE
    // --------------------------------------------------------

    reportingFlood = false;

    reportLocation = null;


    document.getElementById(
        "reportForm"
    ).style.display = "none";


    document.getElementById(
        "reportDescription"
    ).value = "";


    document.getElementById(
        "routeInfo"
    ).innerHTML =

        `<h2>✅ Report Submitted</h2>

        <p>
        Thank you for helping other citizens
        stay informed.
        </p>

        <p>
        🌊 Your report has been added to the
        FloodPulse map.
        </p>`;

}


// ============================================================
// DISPLAY FLOOD REPORT
// ============================================================

function displayFloodReport(
    report
) {

    let markerColor = "orange";


    if (
        report.waterLevel === "HIGH"
    ) {

        markerColor = "red";

    }

    else if (
        report.waterLevel === "LOW"
    ) {

        markerColor = "green";

    }


    const marker =
        L.circleMarker(

            [
                report.latitude,
                report.longitude
            ],

            {

                radius: 10,

                color: markerColor,

                fillColor: markerColor,

                fillOpacity: 0.8,

                weight: 3

            }

        ).addTo(map);


    marker.bindPopup(

        `<b>🌊 Citizen Flood Report</b>

        <br><br>

        <strong>
        Water Level:
        </strong>

        ${report.waterLevel}

        <br>

        <strong>
        Reported:
        </strong>

        ${report.timestamp}

        ${
            report.description
                ? `<br><br>
                   📝 ${report.description}`
                : ""
        }`

    );

}
