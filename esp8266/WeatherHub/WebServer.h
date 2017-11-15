#ifndef WebServer_H
#define WebServer_H

#include <ESP8266WebServer.h>
#include "JsonConfig.h"

class WebServer
{
	private:
		JsonConfig* config;
		ESP8266WebServer* webServer;

		void webRoot();
		void webSetup();
		void webReboot();
		void webStyles();
		void handleNotFound();

		String renderParameterRow(String paramName, String paramId, String paramValue, int maxLength, bool isReadonly = false, bool isPassword = false);
		String renderTitle(String pageName, String moduleName);
		String renderAlert(String type, String text);
		String renderStyles(String styles);
		String renderMenu(String delay);

	public:
		typedef std::function<void(void)> TRebootFunction;
		void setup(ESP8266WebServer* webServer, JsonConfig* config, TRebootFunction rebootFunction);

	protected:
		TRebootFunction rebootFunction;
};

#endif
