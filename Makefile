.PHONY: run build

run:
	npm run dev

build:
	npm run build
	cp .htaccess dist/.htaccess
	cp src/assets/*.pdf dist/assets
	cd dist && rm -f ichstillwoichwill.zip && zip -r ichstillwoichwill.zip . -x "ichstillwoichwill.zip"



