export const chillNodes = {
    CS: {
        id: "CS",
        x: 300,
        y: 1180,
        neighbors: ["CE"],
        surface: "ice"
    },
    CE: {
        id: "CE",
        x: 760,
        y: 1180,
        neighbors: ["CS", "CN"],
        surface: "ice"
    },
    CN: {
        id: "CN",
        x: 760,
        y: 760,
        neighbors: ["CE", "CW"],
        surface: "ice"
    },
    CW: {
        id: "CW",
        x: 300,
        y: 760,
        neighbors: ["CN", "CS", "CG"],
        surface: "ice"
    },
    CG: {
        id: "CG",
        x: 520,
        y: 540,
        neighbors: ["CW"],
        stopHere: true,
        surface: "ice"
    }
};
