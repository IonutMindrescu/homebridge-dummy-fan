var Service, Characteristic, HomebridgeAPI;

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	HomebridgeAPI = homebridge;
	homebridge.registerAccessory('homebridge-dummy-fan', 'DummyFan', DummyFan);
}

class DummyFan {
	constructor (log, config) {

		//get config values
		this.name = config['name'] || "Dummy Fan";
		this.autoOffDelay = config["autoOffDelay"] === undefined ? 0 : Number(config["autoOffDelay"]);
		this.min = config["min"] === undefined ? 0 : Number(config["min"]);
		this.max = config["max"] === undefined ? 100 : Number(config["max"]);
		this.minStep = config["minStep"] === undefined ? 1 : Number(config["minStep"]);

		//persist storage
		this.cacheDirectory = HomebridgeAPI.user.persistPath();
		this.storage = require('node-persist');
		this.storage.initSync({dir:this.cacheDirectory, forgiveParseErrors: true});
		this.cachedState = this.storage.getItemSync(this.name);

		//initial setup
		this.log = log;
		this.lastOpened = new Date();
		this.service = new Service.Fan(this.name, this.name);
		this.setupFanService(this.service);

		this.informationService = new Service.AccessoryInformation();
		this.informationService
			.setCharacteristic(Characteristic.Manufacturer, 'github/IonutMindrescu')
			.setCharacteristic(Characteristic.Model, 'Dummy Fan')
			.setCharacteristic(Characteristic.FirmwareRevision, '1.0.0')
			.setCharacteristic(Characteristic.SerialNumber, this.name.replace(/\s/g, '').toUpperCase());
}

getServices () {
	return [this.informationService, this.service];
}

setupFanService (service) {
	this.log.debug("setupFanService");
	this.log.debug("Cached State: " + this.cachedState);
	
	if ((this.cachedState === undefined) || (this.cachedState === true)) {
		this.log.debug("Using Saved Turned ON State");
		this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
	} else {
		this.log.debug("Using Default Turned OFF State");
		this.service.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
		this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
	}
	
	service.getCharacteristic(Characteristic.RotationSpeed)
		.setProps({
		    minValue: this.min,
		    maxValue: this.max,
		    minStep: this.minStep
		  });

	service.getCharacteristic(Characteristic.TargetDoorState)
		.on('get', (callback) => {
			var targetDoorState = service.getCharacteristic(Characteristic.TargetDoorState).value;
			callback(null, targetDoorState);
		})
		.on('set', (value, callback) => {
			if (value === Characteristic.TargetDoorState.OPEN) {
				this.log("Opening: " + this.name)
				this.lastOpened = new Date();
				this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
				this.storage.setItem(this.name, true);
				this.log.debug("autoOffDelay = " + this.autoOffDelay);
				if (this.autoOffDelay > 0) {
					this.log("Closing in " + this.autoOffDelay + " seconds.");
					setTimeout(() => {
						this.log("Auto Closing");
						this.service.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
						this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
						this.storage.setItem(this.name, false);
					}, this.autoOffDelay * 1000);
				}
				callback();

			} else if (value === Characteristic.TargetDoorState.CLOSED)  {
				this.log("Closing: " + this.name)
				this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
				this.storage.setItem(this.name, false);
				callback();
			} else {
				callback();
			}
		});
	}
}
