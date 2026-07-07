.PHONY: run build

run:
	npm run dev

build:
	npm run build
	cp .htaccess dist/.htaccess
	cd dist && rm -f ichstillwoichwill.zip && zip -r ichstillwoichwill.zip . -x "ichstillwoichwill.zip"



