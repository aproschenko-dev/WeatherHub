var config = {
    blynkUrl: "https://192.168.1.212:9443/b2d5d60492ec4348847dea2c0e4d30fa",
    serverPort: 9898,
    multicastAddress: '224.0.0.50',
    multicastPort: 4321,
    sensorDelay: 30,
    htSensorIds: [20046, 52585, 59408],
    htSensorPins: [["V6", "V7"], ["V8", "V9"], ["V10", "V11"]]
};

module.exports = config;