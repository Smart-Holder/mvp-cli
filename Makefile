NODE    ?= node
CWD     ?= $(shell pwd)
ENV     ?= dev
NAME    ?= $(shell node -e 'console.log(require("./package.json").name)')
HOST_STR?= $(shell node -e 'console.log(require("./config").host)')

cfg = \
if [ -f .config.js ]; then \
	cat .config.js > config.js; \
elif [ -f .cfg_$(1).js ]; then \
	cat .cfg_$(1).js > config.js; \
fi

.PHONY: build dev pull cfg

.SECONDEXPANSION:

build: cfg
	@npm run $@
	@cd out; tar cfvz $(NAME).tgz ./public

dev: cfg
	@npm run $@

cfg:
	@mkdir -p out/android/cfg
	@$(call cfg,$(ENV))
	@echo "NSString *loadURL=@\"$(HOST_STR)/index.html\";" > ./out/ios_host.h
	@echo "package cfg;public class MvpCfg {public static final String host = \"$(HOST_STR)/index.html\";}" > ./out/android/cfg/MvpCfg.java

pull:
	git pull
	git submodule update --init --recursive
