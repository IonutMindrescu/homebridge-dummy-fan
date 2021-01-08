# homebridge-dummy-fan
[Homebridge](https://github.com/nfarina/homebridge) plugin to create a dummy HomeKit Fan accessory. Why? It's simple to create Automations to trigger some custom built accessories like Sonoff switches.

# Installation
1. Install [Homebridge](https://github.com/nfarina/homebridge#installation)
2. Install this plugin using `npm install -g homebridge-dummy-fan`
3. Edit your configuration file like the example below and restart Homebridge

# Configuration Example
```
{
	"accessories": [{
		"accessory": "DummyFan",
		"name": "Dummy Fan"
	}]
}
```

# Configuration Parameters 

* ```name``` __(required)__ Name of Fan to appear in Home app
* ```autoOffDelay``` Number of seconds after fan will automatically turn off. Exclude parameter to disable.

# Credits

This plugin is edited based on the fork of [homebridge-dummy-garage](https://github.com/rasod/homebridge-dummy-garage)
