SHELL := /bin/bash
CFN_TEMPLATE_PATTERN ?= *.template

# Used in recipes
S3_BUCKET ?= rowanudell-2019-deployment
STACK_PREFIX ?= boc-updates
PARAMETER_SCOPE ?= /boc/updates
GITHUB_BRANCH ?= master
GITHUB_OWNER ?= rowanu
GITHUB_REPO ?= boc-feed

.PHONY: install
install: functions
	# TODO: Need to install linters e.g. cfn-lint, etc
	npm install

.PHONY: clean
clean:
	rm -rf dist/

.PHONY: test
test:
	npm run test:unit

.PHONY: lint
lint: cfn-lint vue-lint

.PHONY: vue-lint
vue-lint:
	npm run lint

.PHONY: cfn-lint
cfn-lint:
	yamllint --strict ${CFN_TEMPLATE_PATTERN}
	cfn-lint -t ${CFN_TEMPLATE_PATTERN}

.PHONY: data.template
data.template:
	aws cloudformation deploy \
		--stack-name ${STACK_PREFIX}-data \
		--template-file data.template \
		--parameter-overrides \
			ParameterScope=${PARAMETER_SCOPE} \
		--no-fail-on-empty-changeset
