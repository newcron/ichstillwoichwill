.PHONY: run build deploy testauth

run:
	npm run dev

build:
	npm run build
	cp .htaccess dist/.htaccess
	cp src/assets/*.pdf dist/assets
	cd dist && rm -f build.tar && tar -czvf build.tar * 

deploy: build
	. .deployment-secret;  cd dist && curl -XPOST https://deployments.ichstillwoichwill.de -F "data=@build.tar"  -u "$$DEPLOYMENT_USERNAME:$$DEPLOYMENT_PASSWORD"