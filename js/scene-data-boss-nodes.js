export const bossNodes = {
    // ======================================================
    // BOTTOM PLATFORM
    // ======================================================
    START: {
        id: "START",
        x: 170,
        y: 1310,
        neighbors: ["L1D"]
    },

    // left ladder to lower slope
    L1D: {
        id: "L1D",
        x: 340,
        y: 1290,
        neighbors: ["START", "S1D", "L1U"],
        ladderExit: true
    },
    L1U: {
        id: "L1U",
        x: 345,
        y: 965,
        neighbors: ["L1D", "L6D", "L3D"],
        ladderExit: true
    },

    // small short ladder left
    L6D: {
        id: "L6D",
        x: 200,
        y: 945,
        neighbors: ["L6U", "L1U"],
        ladderExit: true
    },
    L6U: {
        id: "L6U",
        x: 200,
        y: 820,
        neighbors: ["L6D", "R1B", "M1"],
        ladderExit: true
    },

    // right ladder to lower slope
    L2D: {
        id: "L2D",
        x: 825,
        y: 1215,
        neighbors: ["S1D", "L2U"],
        ladderExit: true
    },
    L2U: {
        id: "L2U",
        x: 825,
        y: 1055,
        neighbors: ["L2D", "R2B", "M0"],
        ladderExit: true
    },

    S1D: {
        id: "S1D",
        x: 600,
        y: 1260,
        neighbors: ["L1D", "L2D", "SC1"],
        ladderExit: true
    },
    SC1: {
        id: "SC1",
        x: 680,
        y: 1170,
        neighbors: ["SC2", "S1D"],
        stopHere: false
    },
    SC2: {
        id: "SC2",
        x: 650,
        y: 1080,
        neighbors: ["SC1", "L3D"],
        stopHere: false
    },

    // ======================================================
    // LOWER SLOPE (left higher -> right lower)
    // ======================================================
    M0: {
        id: "M0",
        x: 695,
        y: 1020,
        neighbors: ["L2U", "L3D", "M0C"],
        inputMap: {
            up: "M0C",
            left: "L3D",
            right: "L2U"
        },
        cavePassThrough: true
    },
    M1: {
        id: "M1",
        x: 280,
        y: 800,
        neighbors: ["L6U", "M1C", "L5B"],
        inputMap: {
            up: "M1C",
            left: "L6U",
            right: "L5B"
        },
        cavePassThrough: true
    },
    M0C: {
        id: "M0C",
        x: 695,
        y: 950,
        neighbors: ["M0"],
        cavePassThrough: true,
        stopHere: true
    },
    M1C: {
        id: "M1C",
        x: 280,
        y: 740,
        neighbors: ["M1"],
        cavePassThrough: true,
        stopHere: true
    },

    // center main ladder up to upper shelf
    L3D: {
        id: "L3D",
        x: 500,
        y: 985,
        neighbors: ["L1U", "L3U", "M0", "SC2"],
        inputMap: {
            up: "L3U",
            left: "L1U",
            right: "M0",
            DOWN: "SC2"
        },
        ladderExit: true
    },
    L3U: {
        id: "L3U",
        x: 500,
        y: 730,
        neighbors: ["L3D", "L4D", "L5B"],
        ladderExit: true
    },

    // left rope from upper shelf down
    R1B: {
        id: "R1B",
        x: 85,
        y: 790,
        neighbors: ["L6U", "R1M"],
        inputMap: {
            up: "R1M",
            right: "L6U"
        },
        stopHere: true
    },
    R1T: {
        id: "R1T",
        x: 85,
        y: 435,
        neighbors: ["R1N", "L5D"],
        inputMap: {
            down: "R1N",
            right: "L5D"
        },
        stopHere: true
    },
    R1M: {
        id: "R1M",
        x: 115,
        y: 670,
        neighbors: ["R1N", "R1B"],
        stopHere: false
    },
    R1N: {
        id: "R1N",
        x: 110,
        y: 580,
        neighbors: ["R1M", "R1T"],
        stopHere: false
    },

    // right rope from middle-right down
    R2B: {
        id: "R2B",
        x: 925,
        y: 1030,
        neighbors: ["L2U", "R2M"],
        inputMap: {
            up: "R2M",
            left: "L2U"
        },
        stopHere: true
    },
    R2T: {
        id: "R2T",
        x: 905,
        y: 650,
        neighbors: ["R2N", "L4D", "S2M"],
        inputMap: {
            down: "R2N",
            left: "L4D"
        },
        stopHere: true
    },
    R2M: {
        id: "R2M",
        x: 895,
        y: 950,
        neighbors: ["R2B", "R2N"],
        stopHere: false
    },
    R2N: {
        id: "R2N",
        x: 885,
        y: 850,
        neighbors: ["R2T", "R2M"],
        stopHere: false
    },

    // ======================================================
    // SUMMIT LADDER + GOAL
    // ======================================================
    L4D: {
        id: "L4D",
        x: 690,
        y: 690,
        neighbors: ["L3U", "L4U", "R2T"],
        ladderExit: true
    },
    L4U: {
        id: "L4U",
        x: 690,
        y: 490,
        neighbors: ["L4D", "L5D", "S2U"],
        ladderExit: true
    },
    S2U: {
        id: "S2U",
        x: 810,
        y: 525,
        neighbors: ["L4U", "S2M"],
        stopHere: true
    },
    S2M: {
        id: "S2M",
        x: 860,
        y: 580,
        neighbors: ["R2T", "S2U"],
        stopHere: false
    },

    L5D: {
        id: "L5D",
        x: 340,
        y: 450,
        neighbors: ["R1T", "L4U", "L5N", "GOAL"],
        stopHere: true
    },
    L5B: {
        id: "L5B",
        x: 380,
        y: 755,
        neighbors: ["L3U", "M1", "L5C"],
        stopHere: true
    },
    L5C: {
        id: "L5C",
        x: 400,
        y: 620,
        neighbors: ["L5B", "L5N"],
        stopHere: false
    },
    L5N: {
        id: "L5N",
        x: 390,
        y: 520,
        neighbors: ["L5D", "L5C"],
        stopHere: false
    },

    TOP: {
        id: "TOP",
        x: 340,
        y: 0,
        neighbors: []
    },
    GOAL: {
        id: "GOAL",
        x: 340,
        y: 300,
        neighbors: ["L5D"]
    }
};
