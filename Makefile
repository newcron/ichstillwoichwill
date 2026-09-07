.PHONY: run build

run:
	npm run dev

build:
	npm run build
	cp .htaccess dist/.htaccess
	cp src/assets/*.pdf dist/assets
	cd dist && rm -f upload.tar && tar -czvf upload.tar *
    source .deployment-secret && cd dist && curl -XPOST https://deployments.hamstersbooks.de -F "data=@upload.tar"  -u "$(DEPLOYMENT_USERNAME):$(DEPLOYMENT_PASSWORD)" 



