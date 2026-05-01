export const bossNodes = {
  CK1: {
    id: "CK1",
    x: 284,
    y: 1493,
    neighbors: ["CK2", "CK4"],
    jumpTo: "N52",
    tags: ["jumpFrom"]
  },

  CK2: {
    id: "CK2",
    x: 129,
    y: 1486,
    neighbors: ["CK1", "N53"],
    tags: []
  },

  CK3: {
    id: "CK3",
    x: 131,
    y: 1260,
    neighbors: ["N53"],
    tags: []
  },

  CK4: {
    id: "CK4",
    x: 456,
    y: 1500,
    neighbors: ["CK1", "CK49", "N52"],
    tags: ["banana"]
  },

  CK10: {
    id: "CK10",
    x: 1081,
    y: 1428,
    neighbors: ["CK12"],
    tags: ["portal"]
  },

  CK12: {
    id: "CK12",
    x: 863,
    y: 1448,
    neighbors: ["CK10", "CK13", "CK49"],
    tags: ["banana"]
  },

  CK13: {
    id: "CK13",
    x: 879,
    y: 1283,
    neighbors: ["CK12", "CK38"],
    jumpTo: "CK14",
    stopHere: true,
    tags: ["banana", "jumpFrom"]
  },

  CK14: {
    id: "CK14",
    x: 921,
    y: 1158,
    neighbors: ["CK15"],
    returnTo: "CK13",
    returnFrom: ["CK13"],
    requireInputForReturn: "down",
    tags: ["ropeReturn"]
  },

  CK15: {
    id: "CK15",
    x: 958,
    y: 1054,
    neighbors: ["CK14", "CK16"],
    tags: []
  },

  CK16: {
    id: "CK16",
    x: 930,
    y: 935,
    neighbors: ["CK15", "CK17"],
    tags: []
  },

  CK17: {
    id: "CK17",
    x: 935,
    y: 833,
    neighbors: ["CK16", "CK47", "CK18", "N49"],
    tags: ["banana"]
  },

  CK18: {
    id: "CK18",
    x: 930,
    y: 682,
    neighbors: ["CK17", "CK47", "CK21"],
    returnTo: "CK47",
    returnFrom: ["CK47", "N49"],
    requireInputForReturn: "down",
    tags: ["ropeReturn"]
  },

  CK20: {
    id: "CK20",
    x: 768,
    y: 638,
    neighbors: ["CK21", "CK42", "CK23"],
    tags: []
  },

  CK21: {
    id: "CK21",
    x: 844,
    y: 663,
    neighbors: ["CK18", "CK20"],
    tags: ["banana"]
  },

  CK22: {
    id: "CK22",
    x: 596,
    y: 598,
    neighbors: ["CK23", "CK25", "N44"],
    tags: []
  },

  CK23: {
    id: "CK23",
    x: 686,
    y: 610,
    neighbors: ["CK20", "CK22"],
    tags: []
  },

  CK24: {
    id: "CK24",
    x: 412,
    y: 547,
    neighbors: ["CK25", "CK28", "CK45"],
    tags: []
  },

  CK25: {
    id: "CK25",
    x: 512,
    y: 575,
    neighbors: ["CK22", "CK24"],
    tags: ["banana"]
  },

  CK28: {
    id: "CK28",
    x: 319,
    y: 535,
    neighbors: ["CK24", "CK29"],
    tags: []
  },

  CK29: {
    id: "CK29",
    x: 225,
    y: 519,
    neighbors: ["CK28", "CK30"],
    tags: []
  },

  CK30: {
    id: "CK30",
    x: 109,
    y: 484,
    neighbors: ["CK29", "CK46", "CK31"],
    tags: []
  },

  CK31: {
    id: "CK31",
    x: 92,
    y: 610,
    neighbors: ["CK30", "CK32"],
    tags: []
  },

  CK32: {
    id: "CK32",
    x: 120,
    y: 717,
    neighbors: ["CK31", "CK33"],
    tags: []
  },

  CK33: {
    id: "CK33",
    x: 71,
    y: 835,
    neighbors: ["CK32", "CK34"],
    returnTo: "CK48",
    returnFrom: ["CK48", "CK35"],
    requireInputForReturn: "down",
    tags: ["ropeReturn"]
  },

  CK34: {
    id: "CK34",
    x: 108,
    y: 977,
    neighbors: ["CK48", "CK35", "CK33"],
    returnTo: "CK41",
    returnFrom: ["CK41"],
    requireInputForReturn: "down",
    tags: ["ropeReturn"]
  },

  CK35: {
    id: "CK35",
    x: 224,
    y: 954,
    jumpTo: "CK33",
    neighbors: ["CK34", "CK36", "CK44"],
    tags: ["banana"]
  },

  CK36: {
    id: "CK36",
    x: 370,
    y: 919,
    neighbors: ["CK35", "N51", "N45"],
    tags: []
  },

  CK37: {
    id: "CK37",
    x: 600,
    y: 889,
    neighbors: ["N45", "N46", "N44"],
    tags: ["banana"]
  },

  CK38: {
    id: "CK38",
    x: 649,
    y: 1225,
    neighbors: ["CK43", "CK39", "CK13"],
    tags: ["jumpFrom"]
  },

  CK39: {
    id: "CK39",
    x: 459,
    y: 1167,
    neighbors: ["CK38", "CK40", "N52"],
    jumpTo: "N51",
    tags: ["jumpFrom"]
  },

  CK40: {
    id: "CK40",
    x: 368,
    y: 1146,
    neighbors: ["CK39", "N51", "N50"],
    tags: ["banana"]
  },

  CK41: {
    id: "CK41",
    x: 126,
    y: 1093,
    neighbors: ["N50"],
    jumpTo: "CK34",
    tags: ["banana", "jumpFrom"]
  },

  CK42: {
    id: "CK42",
    x: 782,
    y: 538,
    neighbors: ["CK20"],
    tags: []
  },

  CK43: {
    id: "CK43",
    x: 649,
    y: 1115,
    neighbors: ["CK38"],
    tags: ["portal"]
  },

  CK44: {
    id: "CK44",
    x: 222,
    y: 836,
    neighbors: ["CK35"],
    tags: ["portal"]
  },

  CK45: {
    id: "CK45",
    x: 410,
    y: 403,
    neighbors: ["CK24"],
    tags: ["portal"]
  },

  CK46: {
    id: "CK46",
    x: 8,
    y: 459,
    neighbors: ["CK30"],
    tags: ["portal"]
  },

  CK47: {
    id: "CK47",
    x: 1088,
    y: 770,
    neighbors: ["CK17", "CK18"],
    jumpTo: "CK18",
    tags: ["portal", "jumpFrom"]
  },

  CK48: {
    id: "CK48",
    x: 1,
    y: 1005,
    neighbors: ["CK34"],
    jumpTo: "CK33",
    tags: ["portal", "jumpFrom"]
  },

  CK49: {
    id: "CK49",
    x: 554,
    y: 1505,
    neighbors: ["CK4", "CK12", "CK50"],
    jumpTo: "N52",
    tags: ["jumpFrom"]
  },

  CK50: {
    id: "CK50",
    x: 551,
    y: 1719,
    neighbors: ["CK49"],
    tags: ["portal"]
  },

  N43: {
    id: "N43",
    x: 995,
    y: 1574,
    neighbors: [],
    tags: []
  },

  N44: {
    id: "N44",
    x: 600,
    y: 763,
    neighbors: ["CK37", "CK22"],
    returnTo: "N45",
    returnFrom: ["N45", "N46"],
    requireInputForReturn: "down",
    tags: ["ropeReturn"]
  },

  N45: {
    id: "N45",
    x: 501,
    y: 898,
    neighbors: ["CK36", "CK37"],
    jumpTo: "N44",
    tags: ["jumpFrom"]
  },

  N46: {
    id: "N46",
    x: 719,
    y: 875,
    neighbors: ["CK37", "N49"],
    jumpTo: "N44",
    tags: ["jumpFrom"]
  },

  N49: {
    id: "N49",
    x: 823,
    y: 851,
    neighbors: ["N46", "CK17"],
    jumpTo: "CK18",
    tags: ["jumpFrom"]
  },

  N50: {
    id: "N50",
    x: 254,
    y: 1116,
    neighbors: ["CK41", "CK40"],
    jumpTo: "N51",
    tags: ["jumpFrom"]
  },

  N51: {
    id: "N51",
    x: 368,
    y: 1042,
    neighbors: ["CK40", "CK36"],
    returnTo: "CK39",
    returnFrom: ["N50", "CK39"],
    requireInputForReturn: "down",
    tags: ["ropeReturn"]
  },

  N52: {
    id: "N52",
    x: 456,
    y: 1379,
    neighbors: ["CK4", "CK39"],
    returnTo: "CK49",
    returnFrom: ["CK1", "CK49"],
    requireInputForReturn: "down",
    tags: ["ropeReturn"]
  },

  N53: {
    id: "N53",
    x: 126,
    y: 1374,
    neighbors: ["CK2", "CK3"],
    tags: []
  }
};