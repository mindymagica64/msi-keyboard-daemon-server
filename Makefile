install:
	@npm install

clean:
	@rm -rf node_modules

reinstall: clean install

.PHONY: install clean reinstall

