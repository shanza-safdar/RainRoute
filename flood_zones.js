const floodZones = [

    // ==========================================
    // DHA / DEFENCE / CANTT
    // ==========================================

    {
        name: "Defence Mor",
        latitude: 31.4697,
        longitude: 74.4080,
        radius: 900,
        risk: "HIGH"
    },

    {
        name: "DHA Phase 1",
        latitude: 31.4685,
        longitude: 74.4020,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "DHA Phase 2",
        latitude: 31.4755,
        longitude: 74.4045,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "DHA Phase 3",
        latitude: 31.4680,
        longitude: 74.4170,
        radius: 650,
        risk: "HIGH"
    },

    {
        name: "DHA Phase 4",
        latitude: 31.4560,
        longitude: 74.4110,
        radius: 650,
        risk: "HIGH"
    },

    {
        name: "DHA Phase 5",
        latitude: 31.4500,
        longitude: 74.4070,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "Ghazi Underpass",
        latitude: 31.4630,
        longitude: 74.4085,
        radius: 500,
        risk: "HIGH"
    },

    {
        name: "Masjid Chowk Underpass",
        latitude: 31.4585,
        longitude: 74.4105,
        radius: 500,
        risk: "HIGH"
    },

    {
        name: "Lalak Jan Chowk",
        latitude: 31.4645,
        longitude: 74.4025,
        radius: 500,
        risk: "HIGH"
    },

    {
        name: "Watain Chowk",
        latitude: 31.4580,
        longitude: 74.3930,
        radius: 500,
        risk: "HIGH"
    },

    {
        name: "Walton Road",
        latitude: 31.4820,
        longitude: 74.3850,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "Ghazi Road",
        latitude: 31.4770,
        longitude: 74.3940,
        radius: 600,
        risk: "HIGH"
    },

    {
        name: "Defence Road",
        latitude: 31.4700,
        longitude: 74.4200,
        radius: 650,
        risk: "HIGH"
    },


    // ==========================================
    // CENTRAL LAHORE
    // ==========================================

    {
        name: "Lakshmi Chowk",
        latitude: 31.5700,
        longitude: 74.3230,
        radius: 600,
        risk: "HIGH"
    },

    {
        name: "Qartaba Chowk",
        latitude: 31.5570,
        longitude: 74.3170,
        radius: 500,
        risk: "HIGH"
    },

    {
        name: "Mozang",
        latitude: 31.5480,
        longitude: 74.3250,
        radius: 600,
        risk: "MODERATE"
    },

    {
        name: "Mall Road",
        latitude: 31.5500,
        longitude: 74.3500,
        radius: 650,
        risk: "MODERATE"
    },

    {
        name: "Upper Mall",
        latitude: 31.5350,
        longitude: 74.3650,
        radius: 650,
        risk: "MODERATE"
    },

    {
        name: "Lawrence Road",
        latitude: 31.5590,
        longitude: 74.3420,
        radius: 550,
        risk: "HIGH"
    },

    {
        name: "Chouburji Chowk",
        latitude: 31.5560,
        longitude: 74.3150,
        radius: 550,
        risk: "HIGH"
    },

    {
        name: "Jail Road",
        latitude: 31.5350,
        longitude: 74.3380,
        radius: 700,
        risk: "MODERATE"
    },


    // ==========================================
    // NORTH / NORTH-EAST LAHORE
    // ==========================================

    {
        name: "Badami Bagh",
        latitude: 31.5880,
        longitude: 74.3300,
        radius: 800,
        risk: "HIGH"
    },

    {
        name: "Shalimar",
        latitude: 31.5780,
        longitude: 74.3760,
        radius: 650,
        risk: "MODERATE"
    },

    {
        name: "Mughalpura",
        latitude: 31.5700,
        longitude: 74.3690,
        radius: 650,
        risk: "MODERATE"
    },

    {
        name: "Tajpura",
        latitude: 31.5600,
        longitude: 74.4070,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "Tajpura Underpass",
        latitude: 31.5610,
        longitude: 74.4100,
        radius: 500,
        risk: "HIGH"
    },

    {
        name: "Manawan",
        latitude: 31.6100,
        longitude: 74.4270,
        radius: 700,
        risk: "MODERATE"
    },

    {
        name: "Harbanspura",
        latitude: 31.5780,
        longitude: 74.3530,
        radius: 700,
        risk: "HIGH"
    },


    // ==========================================
    // EAST / SOUTH-EAST LAHORE
    // ==========================================

    {
        name: "Safanwala Chowk",
        latitude: 31.5750,
        longitude: 74.3150,
        radius: 550,
        risk: "HIGH"
    },

    {
        name: "Farrakhabad",
        latitude: 31.5700,
        longitude: 74.3000,
        radius: 650,
        risk: "HIGH"
    },

    {
        name: "Gulshan-e-Ravi",
        latitude: 31.5350,
        longitude: 74.2850,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "Samanabad",
        latitude: 31.5300,
        longitude: 74.3000,
        radius: 650,
        risk: "MODERATE"
    },

    {
        name: "Iqbal Town",
        latitude: 31.5100,
        longitude: 74.2850,
        radius: 700,
        risk: "MODERATE"
    },

    {
        name: "Pani Wala Talab",
        latitude: 31.5250,
        longitude: 74.3050,
        radius: 650,
        risk: "HIGH"
    },

    {
        name: "Shadipura",
        latitude: 31.5850,
        longitude: 74.2950,
        radius: 650,
        risk: "MODERATE"
    },


    // ==========================================
    // SOUTH / SOUTH-WEST LAHORE
    // ==========================================

    {
        name: "Ferozepur Road",
        latitude: 31.4920,
        longitude: 74.3290,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "Faisal Town",
        latitude: 31.4850,
        longitude: 74.3030,
        radius: 650,
        risk: "MODERATE"
    },

    {
        name: "Garden Town",
        latitude: 31.4950,
        longitude: 74.3210,
        radius: 600,
        risk: "MODERATE"
    },

    {
        name: "Nishtar Town",
        latitude: 31.4700,
        longitude: 74.3000,
        radius: 750,
        risk: "HIGH"
    },

    {
        name: "Johar Town",
        latitude: 31.4697,
        longitude: 74.2728,
        radius: 750,
        risk: "HIGH"
    },

    {
        name: "Johar Town Main Boulevard",
        latitude: 31.4700,
        longitude: 74.2850,
        radius: 600,
        risk: "HIGH"
    },

    {
        name: "Township",
        latitude: 31.4500,
        longitude: 74.2850,
        radius: 700,
        risk: "MODERATE"
    },

    {
        name: "Canal Road",
        latitude: 31.5050,
        longitude: 74.3350,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "Bhekhaywala Mor",
        latitude: 31.4800,
        longitude: 74.2850,
        radius: 500,
        risk: "HIGH"
    },

    {
        name: "Khayaban-e-Firdousi",
        latitude: 31.4700,
        longitude: 74.3000,
        radius: 500,
        risk: "HIGH"
    },


    // ==========================================
    // WESTERN / SOUTH-WESTERN LAHORE
    // ==========================================

    {
        name: "Expo Centre Road",
        latitude: 31.4670,
        longitude: 74.2650,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "Hadiara Defence Road",
        latitude: 31.4300,
        longitude: 74.3900,
        radius: 700,
        risk: "HIGH"
    },

    {
        name: "Barki Road",
        latitude: 31.5000,
        longitude: 74.4500,
        radius: 750,
        risk: "HIGH"
    }

];